import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

type InvoiceProductCache = {
  name?: string | null;
};

type InvoiceOrderItem = {
  quantity?: number | null;
  unit_price?: number | null;
  price?: number | null;
  products_cache?: InvoiceProductCache | null;
};

type InvoicePayment = {
  method?: string | null;
  status?: string | null;
};

type InvoiceSyncLog = {
  action?: string | null;
  status?: string | null;
  message?: string | null;
};

type InvoiceOrder = {
  id: string;
  status: string;
  created_at: string;
  total_amount?: number | null;
  accurate_sales_invoice_id?: string | null;
  accurate_sales_receipt_id?: string | null;
  accurate_sales_order_id?: string | null;
  customers?: { full_name?: string | null; email?: string | null } | null;
  branches_cache?: { name?: string | null; address?: string | null } | null;
  order_items?: InvoiceOrderItem[];
  payments?: InvoicePayment[];
  sync_logs?: InvoiceSyncLog[];
};

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
  }
  return fallback;
}

function formatRp(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Ubah payment_type mentah (qris, gopay, bank_transfer, ...) jadi label bagus (QRIS, GoPay, Transfer Bank BCA, DANA). */
function prettifyMethod(raw: string): string {
  const key = raw.trim().toLowerCase();
  const direct: Record<string, string> = {
    qris: "QRIS",
    gopay: "GoPay",
    shopeepay: "ShopeePay",
    dana: "DANA",
    ovo: "OVO",
    linkaja: "LinkAja",
    credit_card: "Kartu Kredit",
    echannel: "Mandiri Bill Payment",
    "snap-success": "Midtrans Snap",
    webhook: "Midtrans",
    snap: "Midtrans Snap",
  };
  if (direct[key]) return direct[key];
  // bank_transfer ditangani terpisah karena butuh nama bank, sisanya dicantikkan umum
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type MidtransStatus = {
  payment_type?: string;
  bank?: string;
  store?: string;
  va_numbers?: { bank?: string }[];
};

/** Tanya ke Midtrans (sandbox) metode bayar asli order ini. Gagal -> null (pakai fallback DB). */
async function fetchMidtransMethod(orderId: string): Promise<string | null> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  if (!serverKey) return null;
  try {
    const res = await fetch(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
      headers: { Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as MidtransStatus;
    const paymentType = asString(data.payment_type, "");
    if (!paymentType) return null;
    if (paymentType.toLowerCase() === "bank_transfer") {
      const bank = asString(data.va_numbers?.[0]?.bank || asString(data.bank, ""), "");
      return bank ? `Transfer Bank ${bank.toUpperCase()}` : "Transfer Bank";
    }
    if (paymentType.toLowerCase() === "cstore") {
      const store = asString(data.store, "");
      if (store.toLowerCase() === "alfamart") return "Alfamart";
      if (store.toLowerCase() === "indomaret") return "Indomaret";
      return store ? prettifyMethod(store) : "Gerai Ritel";
    }
    return prettifyMethod(paymentType);
  } catch {
    return null;
  }
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("orders")
    .select(
      "*, customers(full_name, email), branches_cache(name, address), order_items(quantity, unit_price, products_cache(name)), payments(method, status), sync_logs(action, status, message)"
    )
    .eq("id", id)
    .single();
  const order = data as unknown as InvoiceOrder | null;
  if (!order || order.status !== "paid") {
    notFound();
  }

  const shortId = order.id.split("-")[0].toUpperCase();
  const branchName = order.branches_cache?.name || "Cabang Azuraya";
  const branchAddress = order.branches_cache?.address || "Ambil di toko, tidak ada pengiriman";
  const customerName = order.customers?.full_name || "Pelanggan";
  const customerEmail = order.customers?.email || "-";
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const totalAmount = asNumber(order.total_amount, 0);
  // Metode bayar asli (mis. DANA, QRIS, GoPay, Transfer Bank BCA): tanya Midtrans dulu,
  // kalau gagal pakai catatan payments, terakhir fallback "Midtrans".
  const storedMethod = asString(order.payments?.[0]?.method, "");
  const liveMethod = await fetchMidtransMethod(order.id);
  const paymentMethod = liveMethod || (storedMethod ? prettifyMethod(storedMethod) : "Midtrans");
  const invoiceAccurate = order.accurate_sales_invoice_id || order.accurate_sales_order_id || "-";
  const receiptRaw = order.accurate_sales_receipt_id || "";
  // Tanda "-" artinya penerimaan pelunasan belum tercatat di Accurate (baru faktur saja).
  // Alasan kegagalannya (kalau ada) diambil dari sync_logs agar ketahuan penyebabnya.
  const receiptErrorLog = Array.isArray(order.sync_logs)
    ? order.sync_logs.find((l) => l.status === "error" && asString(l.message, "") !== "")
    : undefined;
  const receiptErrorMsg = asString(receiptErrorLog?.message, "");
  const receiptAccurate = receiptRaw
    ? receiptRaw
    : receiptErrorMsg
      ? `Belum tercatat (${receiptErrorMsg.slice(0, 120)})`
      : "Belum tercatat";
  const paidDate = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rows = items.map((item) => {
    const qty = asNumber(item.quantity, 1) || 1;
    // Kolom di DB adalah unit_price (bug lama pakai item.price selalu 0, sudah dibetulkan di sini)
    const unit = asNumber(item.unit_price, asNumber(item.price, 0));
    return {
      name: item.products_cache?.name || "Produk",
      qty,
      unit,
      subtotal: unit * qty,
    };
  });

  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-black text-white" style={{ fontFamily: "var(--font-primary), Arial, sans-serif", width: "100%", maxWidth: "100%", overflowX: "hidden", background: "#000" }}>
      {/* Latar luar: hitam + segitiga cahaya khas Azuraya */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden print:hidden">
        <div className="flash-light flash-light--left" />
        <div className="flash-light flash-light--right" />
      </div>

      <div data-layout="v4-inline" className="relative z-10 mx-auto box-border w-full min-w-0 max-w-3xl px-4 pb-16 pt-10 sm:px-6" style={{ width: "100%", maxWidth: "720px", marginLeft: "auto", marginRight: "auto", paddingLeft: "16px", paddingRight: "16px", paddingTop: "40px", paddingBottom: "64px", boxSizing: "border-box", position: "relative", zIndex: 10 }}>
        <div className="mb-6 print:hidden">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-yellow-500">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="font-medium">Kembali</span>
          </Link>
        </div>
        <div className="w-full min-w-0 max-w-full rounded-3xl border border-white/10 bg-[#141414]" style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflow: "visible", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", background: "#141414", boxSizing: "border-box" }}>
          {/* Header: logo + INVOICE */}
          <div className="flex w-full min-w-0 flex-col gap-6 border-b-2 border-[#F5C518] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8" style={{ display: "flex", flexWrap: "wrap", gap: "24px", width: "100%", maxWidth: "100%", boxSizing: "border-box", borderBottom: "2px solid #F5C518", padding: "24px" }}>
            <div className="flex min-w-0 flex-1 items-center gap-4" style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: "1 1 280px" }}>
              <Image src="/images/logo.png" alt="Logo Azuraya Grup" width={90} height={57} className="shrink-0 object-contain" />
              <div className="min-w-0 flex-1" style={{ minWidth: 0, flex: 1 }}>
                <h1 className="text-3xl font-bold tracking-tight break-words sm:text-4xl" style={{ overflowWrap: "break-word" }}>
                  <span className="text-white">INVOICE</span>
                </h1>
                <p className="mt-1 break-all font-mono text-sm text-white/60">#{shortId}</p>
                <span className="mt-3 inline-block rounded-full border-2 border-green-500 px-3 py-1 text-xs font-black tracking-widest text-green-400">
                  LUNAS
                </span>
              </div>
            </div>
            <div className="w-full min-w-0 shrink-0 text-sm leading-6 [overflow-wrap:anywhere] sm:w-auto sm:max-w-[240px] sm:text-right" style={{ minWidth: 0, flex: "1 1 200px", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}>
              <div className="break-words text-white/60">
                <strong className="text-white">Invoice #:</strong> INV-{shortId}
              </div>
              <div className="break-words text-white/60">
                <strong className="text-white">Tanggal:</strong> {paidDate}
              </div>
              <div className="break-words text-white/60">
                <strong className="text-white">Metode:</strong> {paymentMethod}
              </div>
            </div>
          </div>

          {/* Dari & Kepada */}
          <div className="flex w-full min-w-0 flex-col gap-8 p-6 sm:flex-row sm:justify-between sm:p-8" style={{ display: "flex", flexWrap: "wrap", gap: "32px", width: "100%", maxWidth: "100%", boxSizing: "border-box", padding: "24px" }}>
            <div className="w-full min-w-0 flex-1 sm:max-w-[45%]" style={{ minWidth: 0, flex: "1 1 220px", maxWidth: "100%" }}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#F5C518]">Dari</h3>
              <p className="font-bold text-white">Azuraya Grup</p>
              <p className="break-words text-white/70" style={{ overflowWrap: "break-word" }}>{branchName}</p>
              <p className="break-words text-white/70" style={{ overflowWrap: "break-word" }}>{branchAddress}</p>
              <p className="mt-2 break-all text-sm text-white/60">Faktur Accurate: {invoiceAccurate}</p>
            </div>
            <div className="w-full min-w-0 flex-1 sm:max-w-[45%] sm:text-right" style={{ minWidth: 0, flex: "1 1 220px", maxWidth: "100%", overflowWrap: "anywhere" }}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#F5C518]">Kepada</h3>
              <p className="break-words font-bold text-white" style={{ overflowWrap: "break-word" }}>{customerName}</p>
              <p className="break-all text-white/70">{customerEmail}</p>
              <p className="mt-2 break-all text-sm text-white/60">Pelunasan: {receiptAccurate}</p>
            </div>
          </div>

          {/* Tabel barang */}
          <div className="w-full min-w-0 px-4 sm:px-8" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", paddingLeft: "16px", paddingRight: "16px" }}>
            <div className="w-full min-w-0 overflow-x-auto" style={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>
            <table className="w-full min-w-0 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/60">
                  <th className="py-3 pr-3 font-bold">Deskripsi</th>
                  <th className="py-3 pr-3 text-right font-bold">Qty</th>
                  <th className="py-3 pr-3 text-right font-bold">Harga Satuan</th>
                  <th className="py-3 text-right font-bold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="break-words py-3 pr-3 text-white">{r.name}</td>
                    <td className="whitespace-nowrap py-3 pr-3 text-right text-white/80">{r.qty}x</td>
                    <td className="whitespace-nowrap py-3 pr-3 text-right text-white/70">{formatRp(r.unit)}</td>
                    <td className="whitespace-nowrap py-3 text-right font-medium text-white">{formatRp(r.subtotal)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-white/50">
                      Tidak ada item pada pesanan ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            {/* Total */}
            <table className="ml-auto mt-6 w-full max-w-[300px]">
              <tbody>
                <tr>
                  <td className="py-1 text-white/70">Subtotal:</td>
                  <td className="py-1 text-right text-white">{formatRp(totalAmount)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-white/70">Pajak:</td>
                  <td className="py-1 text-right text-white">Rp 0 (termasuk)</td>
                </tr>
                <tr>
                  <td className="border-t-2 border-[#F5C518] pt-3 text-lg font-bold text-white">Total:</td>
                  <td className="border-t-2 border-[#F5C518] pt-3 text-right text-lg font-bold text-[#F5C518]">
                    {formatRp(totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Catatan */}
          <div className="p-6 sm:p-8" style={{ padding: "24px", boxSizing: "border-box" }}>
            <div
              className="rounded-xl bg-white/5 text-sm leading-6 text-white/80"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "20px 24px",
                fontSize: "14px",
                lineHeight: "1.7",
                overflowWrap: "break-word",
                boxSizing: "border-box",
              }}
            >
              <strong className="text-white">Catatan:</strong>
              <br />
              Terima kasih telah berbelanja di Azuraya Grup. Tunjukkan invoice ini saat pengambilan
              barang di {branchName}.
              <br />
              Dokumen ini adalah bukti pembayaran yang sah.
            </div>
            <div className="mt-6 text-center print:hidden">
              <PrintButton />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

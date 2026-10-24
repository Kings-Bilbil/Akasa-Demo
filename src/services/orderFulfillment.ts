import { fetchAccurateAPI } from './accurate';
import { createSalesInvoice, createSalesReceipt } from './accurateOrder';
import { ensureAccurateCustomer } from './accurateCustomer';

type AdminClient = ReturnType<typeof import('@/utils/supabase/admin').createAdminClient>;

export type FulfillSource = 'webhook' | 'checkout-success' | 'admin-retry' | 'dashboard-resume';

export type FulfillResult = {
  skipped: boolean;
  reason?: string;
  invoiceId?: number;
  receiptId?: number;
};

// In-memory guard tambahan untuk mencegah eksekusi ganda di dalam proses Node.js yang sama
const inFlightOrders = new Set<string>();
// Durasi maksimal lock dianggap aktif sebelum kadaluarsa (2 menit)
const LOCK_TTL_MS = 2 * 60 * 1000;

function isActiveLock(val: string | null | undefined): boolean {
  if (!val || !val.startsWith('LOCK:')) return false;
  const ts = Number(val.slice(5));
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < LOCK_TTL_MS;
}

function normalizeWarehouseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/gudang|cabang|pusat|toko|utama/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Satu-satunya tempat yang boleh membuat Faktur + Penerimaan di Accurate.
 * Dilengkapi Atomic Lock (PostgreSQL Compare-And-Swap + In-Memory Mutex)
 * agar ketika Webhook Midtrans dan Browser Callback datang di milidetik yang sama,
 * TIDAK AKAN PERNAH tercetak 2 faktur ganda di Accurate (POIN 22).
 */
export async function fulfillPaidOrder(
  supabase: AdminClient,
  orderId: string,
  opts: {
    source: FulfillSource;
    midtransNotification?: {
      transaction_id?: string;
      payment_type?: string;
      transaction_status?: string;
      raw?: unknown;
    };
  }
): Promise<FulfillResult> {
  // 0. In-memory mutex untuk proses yang sama
  if (inFlightOrders.has(orderId)) {
    console.log(`[${opts.source}] Order ${orderId} sedang diproses di memori, lewati duplikat.`);
    return { skipped: true, reason: 'in-flight-memory-lock' };
  }

  inFlightOrders.add(orderId);

  try {
    // 1. Tandai lunas dulu (aman dipanggil berkali-kali karena idempotent)
    await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);

    // 2. Ambil order + relasi
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        accurate_sales_invoice_id,
        accurate_sales_order_id,
        accurate_sales_receipt_id,
        branch_id,
        customer_id,
        branches_cache(accurate_branch_id, name),
        customers(full_name, email, accurate_customer_id),
        order_items(quantity, unit_price, products_cache(accurate_item_id, name))
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    const rawInvoiceVal = (order as { accurate_sales_invoice_id?: string | null }).accurate_sales_invoice_id || null;
    const rawReceiptVal = (order as { accurate_sales_receipt_id?: string | null }).accurate_sales_receipt_id || null;

    // Jika sedang dikunci oleh request lain yang masih aktif (< 2 menit), langsung berhenti!
    if (isActiveLock(rawInvoiceVal) || isActiveLock(rawReceiptVal)) {
      console.log(`[${opts.source}] Order ${orderId} sedang dikunci proses lain (${rawInvoiceVal}), batalkan duplikat.`);
      return { skipped: true, reason: 'already-processing' };
    }

    // Bersihkan lock basi (> 2 menit karena proses sebelumnya crash) jika ada
    if (rawInvoiceVal?.startsWith('LOCK:')) {
      await supabase
        .from('orders')
        .update({ accurate_sales_invoice_id: null })
        .eq('id', orderId)
        .eq('accurate_sales_invoice_id', rawInvoiceVal);
    }
    if (rawReceiptVal?.startsWith('LOCK:')) {
      await supabase
        .from('orders')
        .update({ accurate_sales_receipt_id: null })
        .eq('id', orderId)
        .eq('accurate_sales_receipt_id', rawReceiptVal);
    }

    const existingInvoiceId = rawInvoiceVal && !rawInvoiceVal.startsWith('LOCK:') ? rawInvoiceVal : null;
    const existingReceiptId = rawReceiptVal && !rawReceiptVal.startsWith('LOCK:') ? rawReceiptVal : null;

    // 3. Idempotency guard: kalau faktur + receipt sudah ada -> jangan buat lagi
    if (existingInvoiceId && existingReceiptId) {
      await recordPaymentRow(supabase, orderId, opts, 'paid-duplicate-skipped');
      return { skipped: true, reason: 'already-fulfilled' };
    }

    // 3b. Pastikan akun punya customer di Accurate
    const demoCustomerId = (order as { customer_id: string }).customer_id;
    const customerNo = await ensureAccurateCustomer(supabase, demoCustomerId);

    const branchAccurateRaw = (
      (order as unknown as { branches_cache: { accurate_branch_id: string } }).branches_cache as unknown as { accurate_branch_id: string }
    ).accurate_branch_id;
    const branchAccurateId = parseInt(branchAccurateRaw);
    const branchName = (
      (order as unknown as { branches_cache: { name: string } }).branches_cache as unknown as { name: string }
    ).name;
    const totalAmount = Number((order as { total_amount: number }).total_amount);

    if (Number.isNaN(branchAccurateId)) {
      throw new Error(`ID cabang Accurate tidak valid: "${branchAccurateRaw}" (branch: ${branchName})`);
    }

    const rawItems = (
      order as unknown as { order_items: { quantity: number; unit_price: number; products_cache: { accurate_item_id: string; name?: string } | null }[] }
    ).order_items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error('Tidak ada item pada pesanan ini.');
    }
    const brokenItem = rawItems.find((i) => !i.products_cache?.accurate_item_id);
    if (brokenItem) {
      throw new Error('Ada item yang tidak terhubung ke produk Accurate (accurate_item_id kosong).');
    }

    // 4. Cari warehouseId yang cocok dengan nama cabang (dengan normalisasi pintar Poin 17)
    let warehouseId: number | undefined = undefined;
    let warehouseNote = 'tidak dicoba';
    try {
      const whRes = await fetchAccurateAPI('/warehouse/list.do?fields=id,name');
      if (whRes && whRes.d) {
        const targetName = normalizeWarehouseName(branchName);
        const list = whRes.d as { id: number; name: string }[];
        const matchedWarehouse = list.find((w) => {
          const whNorm = normalizeWarehouseName(w.name);
          return whNorm === targetName || whNorm.includes(targetName) || targetName.includes(whNorm);
        });
        if (matchedWarehouse) {
          warehouseId = matchedWarehouse.id;
          warehouseNote = `cocok "${matchedWarehouse.name}" (id ${matchedWarehouse.id})`;
        } else {
          warehouseNote = `tidak ada yang cocok untuk "${branchName}" dari [${list.map((w) => w.name).join(', ')}]`;
        }
      } else {
        warehouseNote = 'daftar gudang kosong dari Accurate';
      }
    } catch (err) {
      warehouseNote = `gagal ambil daftar gudang: ${err instanceof Error ? err.message : String(err)}`;
      console.error('Gagal mengambil warehouse list:', err);
    }

    const items = (
      rawItems as { quantity: number; unit_price: number; products_cache: { accurate_item_id: string } }[]
    ).map((i) => ({
      accurate_item_id: i.products_cache.accurate_item_id,
      qty: Number(i.quantity),
      price: Number(i.unit_price),
      warehouseId,
    }));

    const payloadPreview =
      `branch=${branchAccurateId} warehouse=${warehouseId ?? 'otomatis'} customer=${customerNo} ` +
      `items=[${items.map((i) => `${i.accurate_item_id}:${i.qty}x@${i.price}`).join(', ')}]`;
    console.log(`[${opts.source}] Payload Faktur untuk ${orderId}: ${payloadPreview} (${warehouseNote})`);

    let invoiceLockToken: string | null = null;
    let receiptLockToken: string | null = null;

    try {
      let invoiceId: number;
      if (existingInvoiceId) {
        invoiceId = parseInt(existingInvoiceId);
        console.log(`[${opts.source}] Faktur sudah ada (${invoiceId}), lanjut ke Penerimaan saja.`);
      } else {
        // POIN 22 FIX: Atomic Compare-And-Swap Lock di PostgreSQL sebelum tembak Accurate!
        invoiceLockToken = `LOCK:${Date.now()}`;
        const { data: lockedRows } = await supabase
          .from('orders')
          .update({ accurate_sales_invoice_id: invoiceLockToken })
          .eq('id', orderId)
          .is('accurate_sales_invoice_id', null)
          .select('id');

        if (!lockedRows || lockedRows.length === 0) {
          console.log(`[${opts.source}] Atomic lock gagal diambil untuk faktur ${orderId} (sudah diproses request lain).`);
          return { skipped: true, reason: 'atomic-invoice-lock-skipped' };
        }

        console.log(`[${opts.source}] Membuat Faktur Penjualan di cabang:`, branchAccurateId);
        const siResult = await createSalesInvoice(branchAccurateId, items, customerNo);

        if (!siResult || !siResult.r || !siResult.r.id) {
          throw new Error('Respon Accurate tidak mengembalikan ID Faktur');
        }

        invoiceId = siResult.r.id as number;
        await supabase
          .from('orders')
          .update({ accurate_sales_invoice_id: invoiceId.toString() })
          .eq('id', orderId);
        invoiceLockToken = null; // Lock berhasil diganti dengan ID faktur asli
      }

      // Atomic Compare-And-Swap Lock untuk Penerimaan Penjualan (Sales Receipt)
      receiptLockToken = `LOCK:${Date.now()}`;
      const { data: lockedReceiptRows } = await supabase
        .from('orders')
        .update({ accurate_sales_receipt_id: receiptLockToken })
        .eq('id', orderId)
        .is('accurate_sales_receipt_id', null)
        .select('id');

      if (!lockedReceiptRows || lockedReceiptRows.length === 0) {
        console.log(`[${opts.source}] Atomic lock gagal diambil untuk receipt ${orderId} (sudah diproses request lain).`);
        return { skipped: true, reason: 'atomic-receipt-lock-skipped', invoiceId };
      }

      console.log(`[${opts.source}] Membuat Penerimaan Penjualan (Lunas) untuk faktur:`, invoiceId);
      const srResult = await createSalesReceipt(branchAccurateId, invoiceId, totalAmount, customerNo);

      if (srResult && srResult.r && srResult.r.id) {
        await supabase
          .from('orders')
          .update({ accurate_sales_receipt_id: srResult.r.id.toString() })
          .eq('id', orderId);
        receiptLockToken = null;

        await supabase.from('sync_logs').insert({
          related_order_id: orderId,
          action: 'CREATE_SALES_INVOICE_AND_RECEIPT',
          status: 'success',
          message: `Faktur & Penerimaan (Lunas) berhasil dibuat di Accurate via ${opts.source}`,
        });
        await recordPaymentRow(supabase, orderId, opts, 'paid');
        return { skipped: false, invoiceId, receiptId: srResult.r.id as number };
      }

      // Jika gagal membuat receipt, lepaskan lock receipt agar bisa di-retry
      await supabase
        .from('orders')
        .update({ accurate_sales_receipt_id: null })
        .eq('id', orderId)
        .eq('accurate_sales_receipt_id', receiptLockToken);
      receiptLockToken = null;

      await supabase.from('sync_logs').insert({
        related_order_id: orderId,
        action: 'CREATE_SALES_RECEIPT',
        status: 'error',
        message: 'Faktur berhasil, tapi gagal membuat Penerimaan Penjualan.',
      });
      await recordPaymentRow(supabase, orderId, opts, 'paid-invoice-only');
      return { skipped: false, invoiceId };
    } catch (e: unknown) {
      // Lepaskan lock jika proses pembuatan gagal di tengah jalan agar Admin bisa klik "Kirim Ulang"
      if (invoiceLockToken) {
        await supabase
          .from('orders')
          .update({ accurate_sales_invoice_id: null })
          .eq('id', orderId)
          .eq('accurate_sales_invoice_id', invoiceLockToken);
      }
      if (receiptLockToken) {
        await supabase
          .from('orders')
          .update({ accurate_sales_receipt_id: null })
          .eq('id', orderId)
          .eq('accurate_sales_receipt_id', receiptLockToken);
      }

      const rawMsg = e instanceof Error ? e.message : String(e);
      const errStr = rawMsg.toLowerCase();
      let userMsg = `Gagal sinkronisasi ke Accurate: ${rawMsg}`;
      if (errStr.includes('fetch') || errStr.includes('network'))
        userMsg = 'Gagal menghubungi server Accurate.';
      else if (errStr.includes('api') || errStr.includes('token') || errStr.includes('unauthorized'))
        userMsg = 'Koneksi ditolak oleh Accurate. Token kedaluwarsa.';
      else if (errStr.includes('timeout')) userMsg = 'Server Accurate terlalu lama merespons.';
      else if (errStr.includes('no_item') || errStr.includes('not found'))
        userMsg = 'Barang tidak ditemukan di Accurate.';
      else if (errStr.includes('kuantitas') || errStr.includes('stok') || errStr.includes('insufficient'))
        userMsg = 'Stok fisik di gudang Accurate tidak mencukupi untuk pesanan ini.';

      await supabase.from('sync_logs').insert({
        related_order_id: orderId,
        action: 'CREATE_SALES_INVOICE',
        status: 'error',
        message: `${userMsg} [${payloadPreview} | gudang: ${warehouseNote}]`,
      });
      throw new Error(userMsg);
    }
  } finally {
    inFlightOrders.delete(orderId);
  }
}

async function recordPaymentRow(
  supabase: AdminClient,
  orderId: string,
  opts: { source: FulfillSource; midtransNotification?: { transaction_id?: string; payment_type?: string; transaction_status?: string; raw?: unknown } },
  status: string
) {
  try {
    const n = opts.midtransNotification;
    await supabase.from('payments').insert({
      order_id: orderId,
      midtrans_transaction_id: n?.transaction_id || orderId,
      status,
      method: n?.payment_type || (opts.source === 'webhook' ? 'webhook' : 'snap-success'),
      raw_notification_ref: n?.raw ? (n.raw as object) : { source: opts.source, orderId },
    });
  } catch (err) {
    console.error('Gagal mencatat payments:', err);
  }
}

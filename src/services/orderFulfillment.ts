import { fetchAccurateAPI } from './accurate';
import { createSalesInvoice, createSalesReceipt } from './accurateOrder';
import { ensureAccurateCustomer } from './accurateCustomer';

type AdminClient = ReturnType<typeof import('@/utils/supabase/admin').createAdminClient>;

export type FulfillSource = 'webhook' | 'checkout-success';

export type FulfillResult = {
  skipped: boolean;
  reason?: string;
  invoiceId?: number;
  receiptId?: number;
};

/**
 * Satu-satunya tempat yang boleh membuat Faktur + Penerimaan di Accurate.
 * Dipakai oleh webhook Midtrans DAN checkout/success (localhost bypass)
 * supaya tidak ada dokumen ganda.
 *
 * Idempotent: kalau order sudah punya accurate_sales_invoice_id,
 * fungsi langsung return skipped tanpa tembak Accurate lagi.
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
  // 1. Tandai lunas dulu (aman dipanggil 2x karena update idempotent)
  await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);

  // 2. Ambil order + relasi. Pakai unit_price (bukan price) — ini bug lama yang sudah dibetulkan.
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
      order_items(quantity, unit_price, products_cache(accurate_item_id))
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Order not found');
  }

  // 3. Idempotency guard: kalau faktur + receipt sudah ada -> jangan buat lagi.
  const existingInvoiceId =
    (order as { accurate_sales_invoice_id?: string | null }).accurate_sales_invoice_id ||
    null;
  const existingReceiptId =
    (order as { accurate_sales_receipt_id?: string | null }).accurate_sales_receipt_id ||
    null;

  if (existingInvoiceId && existingReceiptId) {
    await recordPaymentRow(supabase, orderId, opts, 'paid-duplicate-skipped');
    return { skipped: true, reason: 'already-fulfilled' };
  }

  // 3b. Pastikan akun demo punya customer sendiri di Accurate (nama akun,
  // bukan "Akasa"). Sekali dibuat, nomornya disimpan di customers dan dipakai
  // ulang untuk pesanan berikutnya. Gagal -> fallback pelanggan generik.
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

  // Validasi awal dengan pesan jelas (dicatat ke sync_logs oleh pemanggil via throw)
  if (Number.isNaN(branchAccurateId)) {
    throw new Error(`ID cabang Accurate tidak valid: "${branchAccurateRaw}" (branch: ${branchName})`);
  }

  const rawItems = (
    order as unknown as { order_items: { quantity: number; unit_price: number; products_cache: { accurate_item_id: string } | null }[] }
  ).order_items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Tidak ada item pada pesanan ini.');
  }
  const brokenItem = rawItems.find((i) => !i.products_cache?.accurate_item_id);
  if (brokenItem) {
    throw new Error('Ada item yang tidak terhubung ke produk Accurate (accurate_item_id kosong).');
  }

  // 4. Cari warehouseId yang cocok dengan nama cabang (fuzzy match lama, dipertahankan)
  let warehouseId: number | undefined = undefined;
  let warehouseNote = 'tidak dicoba';
  try {
    const whRes = await fetchAccurateAPI('/warehouse/list.do?fields=id,name');
    if (whRes && whRes.d) {
      const cleanName = (n: string) =>
        n.toLowerCase().replace('gudang', '').replace('cabang', '').trim();
      const targetName = cleanName(branchName);
      const list = whRes.d as { id: number; name: string }[];
      const matchedWarehouse = list.find(
        (w) => cleanName(w.name) === targetName
      );
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

  // Catat persis payload yang dikirim agar kegagalan seperti
  // "Detail dari transaksi belum diisi!" bisa ditelusuri tanpa tebak-tebakan.
  const payloadPreview =
    `branch=${branchAccurateId} warehouse=${warehouseId ?? 'otomatis'} customer=${customerNo} ` +
    `items=[${items.map((i) => `${i.accurate_item_id}:${i.qty}x@${i.price}`).join(', ')}]`;
  console.log(`[${opts.source}] Payload Faktur untuk ${orderId}: ${payloadPreview} (${warehouseNote})`);

  try {
    // Kalau faktur sudah ada (mis. order lama yang receipt-nya gagal),
    // lewati pembuatan faktur dan langsung lengkapi receipt-nya saja.
    let invoiceId: number;
    if (existingInvoiceId) {
      invoiceId = parseInt(existingInvoiceId);
      console.log(`[${opts.source}] Faktur sudah ada (${invoiceId}), lanjut ke Penerimaan saja.`);
    } else {
      console.log(`[${opts.source}] Membuat Faktur Penjualan di cabang:`, branchAccurateId);
      const siResult = await createSalesInvoice(branchAccurateId, items, customerNo);

      if (!siResult || !siResult.r || !siResult.r.id) {
        throw new Error('Respon Accurate tidak mengembalikan ID Faktur');
      }

      invoiceId = siResult.r.id as number;
      // Simpan di kolom baru yang benar. Kolom lama accurate_sales_order_id
      // TIDAK ditimpa lagi supaya tidak menipu (dulu invoice disimpan di kolom SO).
      await supabase
        .from('orders')
        .update({ accurate_sales_invoice_id: invoiceId.toString() })
        .eq('id', orderId);
    }

    console.log(`[${opts.source}] Membuat Penerimaan Penjualan (Lunas) untuk faktur:`, invoiceId);
    const srResult = await createSalesReceipt(branchAccurateId, invoiceId, totalAmount, customerNo);

    if (srResult && srResult.r && srResult.r.id) {
      await supabase
        .from('orders')
        .update({ accurate_sales_receipt_id: srResult.r.id.toString() })
        .eq('id', orderId);
      await supabase.from('sync_logs').insert({
        related_order_id: orderId,
        action: 'CREATE_SALES_INVOICE_AND_RECEIPT',
        status: 'success',
        message: `Faktur & Penerimaan (Lunas) berhasil dibuat di Accurate via ${opts.source}`,
      });
      await recordPaymentRow(supabase, orderId, opts, 'paid');
      return { skipped: false, invoiceId, receiptId: srResult.r.id as number };
    }

    await supabase.from('sync_logs').insert({
      related_order_id: orderId,
      action: 'CREATE_SALES_RECEIPT',
      status: 'error',
      message: 'Faktur berhasil, tapi gagal membuat Penerimaan Penjualan.',
    });
    await recordPaymentRow(supabase, orderId, opts, 'paid-invoice-only');
    return { skipped: false, invoiceId };
  } catch (e: unknown) {
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

    await supabase.from('sync_logs').insert({
      related_order_id: orderId,
      action: 'CREATE_SALES_INVOICE',
      status: 'error',
      message: `${userMsg} [${payloadPreview} | gudang: ${warehouseNote}]`,
    });
    throw new Error(userMsg);
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
    // payments adalah log pendukung, jangan gagalkan order kalau insert-nya gagal
    console.error('Gagal mencatat payments:', err);
  }
}

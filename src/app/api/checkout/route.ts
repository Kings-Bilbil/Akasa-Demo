import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { fetchAccurateAPI } from '@/services/accurate';
import { snap } from '@/services/midtrans';

const ADMIN_EMAIL = 'admin@azuraya.com';
// Batas waktu reservasi stok untuk pesanan yang masih pending_payment (15 menit)
const RESERVATION_WINDOW_MS = 15 * 60 * 1000;

type RequestedItem = {
  id: string;
  quantity: number;
  price?: number;
};

type DbProduct = {
  id: string;
  name: string;
  price: number;
  accurate_item_id: string;
};

function normalizeWarehouseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/gudang|cabang|pusat|toko|utama/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export async function POST(request: Request) {
  try {
    // 1. Verifikasi sesi pengguna dari server (tidak percaya begitu saja customerId dari client)
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Sesi Anda telah berakhir. Silakan login kembali untuk melakukan pesanan.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, items, branchId } = body as {
      orderId?: string;
      items?: RequestedItem[];
      branchId?: string;
    };

    const customerId = user.id;
    const customerEmail = user.email || body.customerEmail || null;

    if (!orderId || !branchId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data checkout tidak lengkap.' }, { status: 400 });
    }

    // Validasi kuantitas tiap item harus bilangan bulat positif
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!item.id || !Number.isInteger(qty) || qty < 1 || qty > 999) {
        return NextResponse.json(
          { error: 'Jumlah barang yang dipesan tidak valid.' },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // 2. Pastikan bukan akun Admin
    let effectiveEmail: string | null = customerEmail;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, email, full_name')
      .eq('id', customerId)
      .single();

    if (existingCustomer?.email) {
      effectiveEmail = existingCustomer.email;
    }

    if (effectiveEmail?.toLowerCase() === ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin tidak dapat melakukan pesanan.' }, { status: 403 });
    }

    // Auto-create profil customer jika belum ada di tabel public.customers
    if (!existingCustomer) {
      const fallbackEmail = effectiveEmail || `user-${customerId}@azuraya.local`;
      const { error: insertCustomerError } = await supabase.from('customers').insert({
        id: customerId,
        full_name: user.user_metadata?.full_name || 'Pelanggan Azuraya',
        email: fallbackEmail,
      });
      if (insertCustomerError) {
        console.warn('Gagal auto-create customer (lanjut checkout):', insertCustomerError.message);
      }
    }

    // 3. Validasi cabang tujuan
    const { data: branchData, error: branchError } = await supabase
      .from('branches_cache')
      .select('id, name, accurate_branch_id')
      .eq('id', branchId)
      .single();

    if (branchError || !branchData) {
      return NextResponse.json({ error: 'Cabang yang dipilih tidak ditemukan.' }, { status: 400 });
    }

    // 4. POIN 19 FIX: Ambil harga resmi dari database (products_cache), ABAIKAN harga dari browser
    const productIds = [...new Set(items.map((i) => i.id))];
    const { data: dbProducts, error: productsError } = await supabase
      .from('products_cache')
      .select('id, name, price, accurate_item_id')
      .in('id', productIds);

    if (productsError || !dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Salah satu produk tidak ditemukan atau sudah tidak tersedia.' },
        { status: 400 }
      );
    }

    const productMap = new Map<string, DbProduct>(
      (dbProducts as DbProduct[]).map((p) => [p.id, p])
    );

    // 5. POIN 20 FIX: Cek Stok Live di Accurate + Reservasi Pesanan Aktif (Anti Rebutan Stok Terakhir)
    const reservationCutoff = new Date(Date.now() - RESERVATION_WINDOW_MS).toISOString();

    // Ambil pesanan pending_payment aktif di cabang yang sama dalam 15 menit terakhir
    const { data: activePendingOrders } = await supabase
      .from('orders')
      .select('id, customer_id, order_items(product_id, quantity)')
      .eq('branch_id', branchId)
      .eq('status', 'pending_payment')
      .gte('created_at', reservationCutoff);

    const reservedByOthersMap = new Map<string, number>();
    for (const pendingOrder of activePendingOrders || []) {
      // Jika pesanan pending tersebut milik pelanggan LAIN, hitung sebagai stok yang sedang ditahan
      if (pendingOrder.customer_id !== customerId) {
        const orderItemsList = (pendingOrder.order_items as { product_id: string; quantity: number }[]) || [];
        for (const oi of orderItemsList) {
          reservedByOthersMap.set(
            oi.product_id,
            (reservedByOthersMap.get(oi.product_id) || 0) + Number(oi.quantity || 0)
          );
        }
      }
    }

    const targetBranchNorm = normalizeWarehouseName(branchData.name);

    for (const reqItem of items) {
      const dbProduct = productMap.get(reqItem.id)!;
      const requestedQty = Number(reqItem.quantity);

      let liveWarehouseStock = 0;
      try {
        const cleanItemNo = encodeURIComponent((dbProduct.accurate_item_id || '').trim());
        const accRes = await fetchAccurateAPI(`/item/detail.do?no=${cleanItemNo}`);
        if (accRes?.s === false) {
          return NextResponse.json(
            { error: 'Gagal memverifikasi stok gudang Accurate saat ini. Silakan coba sesaat lagi.' },
            { status: 503 }
          );
        }
        const warehouseList: { name: string; balance: number }[] = accRes?.d?.detailWarehouseData || [];
        const matchedWh = warehouseList.find((w) => {
          const whNorm = normalizeWarehouseName(w.name);
          return (
            whNorm === targetBranchNorm ||
            whNorm.includes(targetBranchNorm) ||
            targetBranchNorm.includes(whNorm)
          );
        });
        liveWarehouseStock = matchedWh && typeof matchedWh.balance === 'number' ? Math.max(0, matchedWh.balance) : 0;
      } catch {
        return NextResponse.json(
          { error: 'Koneksi ke server stok Accurate sedang sibuk. Silakan coba beberapa saat lagi.' },
          { status: 503 }
        );
      }

      const reservedQty = reservedByOthersMap.get(reqItem.id) || 0;
      const effectiveAvailable = Math.max(0, liveWarehouseStock - reservedQty);

      if (liveWarehouseStock < requestedQty) {
        return NextResponse.json(
          {
            error:
              liveWarehouseStock <= 0
                ? `Maaf, stok "${dbProduct.name}" di ${branchData.name} baru saja habis.`
                : `Maaf, sisa stok "${dbProduct.name}" di ${branchData.name} hanya tinggal ${liveWarehouseStock} unit.`,
          },
          { status: 409 }
        );
      }

      if (effectiveAvailable < requestedQty) {
        return NextResponse.json(
          {
            error: `Maaf, stok terakhir "${dbProduct.name}" di ${branchData.name} sedang dalam proses pembayaran oleh pelanggan lain. Silakan tunggu beberapa menit atau pilih cabang lain.`,
          },
          { status: 409 }
        );
      }
    }

    // 6. Hitung ulang harga & total resmi di sisi server (POIN 19)
    const verifiedOrderItems = items.map((reqItem) => {
      const dbProduct = productMap.get(reqItem.id)!;
      const unitPrice = Math.round(Number(dbProduct.price));
      const quantity = Number(reqItem.quantity);
      return {
        order_id: orderId,
        product_id: dbProduct.id,
        name: dbProduct.name,
        quantity,
        unit_price: unitPrice,
      };
    });

    const verifiedTotalAmount = verifiedOrderItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    if (verifiedTotalAmount <= 0) {
      return NextResponse.json({ error: 'Total harga pesanan tidak valid.' }, { status: 400 });
    }

    // 7. Simpan Pesanan ke Supabase dengan total resmi hasil hitungan server
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_id: customerId,
      branch_id: branchId,
      total_amount: verifiedTotalAmount,
      status: 'pending_payment',
    });

    if (orderError) throw orderError;

    // 8. Simpan Detail Item ke Supabase
    const orderItemsToInsert = verifiedOrderItems.map((item) => ({
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
    if (itemsError) throw itemsError;

    // 9. Minta Token Snap dari Midtrans dengan rincian item & harga resmi server
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: verifiedTotalAmount,
      },
      item_details: verifiedOrderItems.map((item) => ({
        id: item.product_id,
        price: item.unit_price,
        quantity: item.quantity,
        name: item.name.slice(0, 50),
      })),
      credit_card: { secure: true },
      callbacks: {
        finish: `${origin}/dashboard`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // 10. POIN 21 FIX: Simpan snap_token ke tabel payments agar jika pop-up tertutup,
    // pelanggan bisa membuka kembali pop-up pembayaran dari halaman Dashboard!
    try {
      await supabase.from('payments').insert({
        order_id: orderId,
        midtrans_transaction_id: orderId,
        status: 'pending',
        method: 'snap',
        raw_notification_ref: {
          snap_token: transaction.token,
          redirect_url: transaction.redirect_url,
          created_at: new Date().toISOString(),
        },
      });
    } catch (payErr) {
      console.warn('Gagal menyimpan snap_token awal ke payments:', payErr);
    }

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      verifiedTotal: verifiedTotalAmount,
    });
  } catch (error: unknown) {
    console.error('Checkout Error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

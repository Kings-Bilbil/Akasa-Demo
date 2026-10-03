import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { snap } from '@/services/midtrans';

const ADMIN_EMAIL = 'admin@azuraya.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, total, items, customerId, branchId, customerEmail } = body;

    if (!orderId || !customerId || !branchId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Data checkout tidak lengkap.' }, { status: 400 });
    }
    
    // 1. Simpan Pesanan ke Supabase
    const supabase = createAdminClient();

    // Cek admin dari data tersimpan (bukan cuma percaya input frontend,
    // karena frontend lama tidak pernah mengirim customerEmail).
    // Urutan: customers.email -> auth.users.email -> input customerEmail.
    let effectiveEmail: string | null = customerEmail || null;
    const { data: existingCustomer } = await supabase.from('customers').select('id, email').eq('id', customerId).single();
    if (existingCustomer?.email) {
      effectiveEmail = existingCustomer.email;
    } else {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(customerId);
        if (authUser?.user?.email) effectiveEmail = authUser.user.email;
      } catch {
        // abaikan, fallback ke customerEmail dari frontend
      }
    }

    if (effectiveEmail === ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin tidak dapat melakukan pesanan." }, { status: 403 });
    }
    
    // Perbaikan: Jika user didaftarkan lewat Dashboard (bukan UI Register kita),
    // data user belum ada di tabel public.customers. Buat otomatis dengan email ASLI
    // (bukan demo@azuraya.com yang menyebabkan tabrakan unique untuk user ke-2 dst).
    if (!existingCustomer) {
      const fallbackEmail = effectiveEmail || `user-${customerId}@azuraya.local`;
      const { error: insertCustomerError } = await supabase.from('customers').insert({
        id: customerId,
        full_name: 'Pelanggan Azuraya',
        email: fallbackEmail,
      });
      // Kalau email sudah dipakai user lain (kasus lama demo@...), jangan gagalkan order:
      // lanjutkan saja karena FK customers masih bisa bermasalah, tapi catat warning.
      if (insertCustomerError) {
        console.warn('Gagal auto-create customer (lanjut checkout):', insertCustomerError.message);
      }
    }
    
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_id: customerId,
      branch_id: branchId,
      total_amount: total,
      status: 'pending_payment'
    });
    
    if (orderError) throw orderError;
    
    // 2. Simpan Detail Item ke Supabase
    type CheckoutItem = { id: string; quantity: number; price: number };
    const orderItems = (items as CheckoutItem[]).map((item) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));
    
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    
    // 3. Minta Token Snap dari Midtrans (pakai singleton agar tidak duplikasi config)
    const origin = request.headers.get('origin') || "http://localhost:3000";
    
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(total)
      },
      credit_card: { secure: true },
      // Mengarahkan kembali ke halaman dashboard setelah pembayaran selesai
      callbacks: {
        finish: `${origin}/dashboard`
      }
    };
    
    const transaction = await snap.createTransaction(parameter);
    
    return NextResponse.json({ token: transaction.token });
  } catch (error: unknown) {
    console.error("Checkout Error:", error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

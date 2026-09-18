import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import midtransClient from 'midtrans-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, total, items, customerId, branchId, customerEmail } = body;
    
    if (customerEmail === 'admin@azuraya.com') {
      return NextResponse.json({ error: "Admin tidak dapat melakukan pesanan." }, { status: 403 });
    }
    
    // 1. Simpan Pesanan ke Supabase
    const supabase = createAdminClient();
    
    // Perbaikan: Jika user didaftarkan lewat Dashboard (bukan UI Register kita),
    // data user belum ada di tabel public.customers. Kita buat otomatis di sini.
    const { data: existingCustomer } = await supabase.from('customers').select('id').eq('id', customerId).single();
    if (!existingCustomer) {
       await supabase.from('customers').insert({
         id: customerId,
         full_name: "Pelanggan Demo",
         email: "demo@azuraya.com"
       });
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
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));
    
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    
    // 3. Minta Token Snap dari Midtrans
    // PENTING: Inisialisasi di dalam fungsi agar selalu membaca versi terbaru dari .env.local
    const snapClient = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(total)
      },
      credit_card: { secure: true },
      // Memaksa Midtrans agar selalu pulang ke localhost, mengabaikan settingan Dashboard
      callbacks: {
        finish: "http://localhost:3000"
      }
    };
    
    const transaction = await snapClient.createTransaction(parameter);
    
    return NextResponse.json({ token: transaction.token });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

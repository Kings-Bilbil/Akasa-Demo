import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { fulfillPaidOrder } from '@/services/orderFulfillment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    // Status transaksi sukses di Midtrans
    if (body.transaction_status === 'capture' || body.transaction_status === 'settlement') {
      const orderId = body.order_id;

      // Satu pintu fulfillment (idempotent): buat Faktur + Receipt sekali saja,
      // catat payments + sync_logs di dalam helper. Tidak lagi simpan
      // invoiceId ke kolom accurate_sales_order_id yang menipu.
      try {
        await fulfillPaidOrder(supabase, orderId, {
          source: 'webhook',
          midtransNotification: {
            transaction_id: body.transaction_id,
            payment_type: body.payment_type,
            transaction_status: body.transaction_status,
            raw: body,
          },
        });
      } catch (e: unknown) {
        // Order tetap ditandai paid di dalam helper, Accurate dicatat sebagai error log.
        // Webhook tetap balas success agar Midtrans tidak retry terus.
        console.error('Fulfillment webhook gagal (order tetap paid):', e);
      }
      
      return NextResponse.json({ status: 'success' });
    }
    
    return NextResponse.json({ status: 'ignored' });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : 'Webhook gagal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

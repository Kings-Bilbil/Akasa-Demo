import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSalesOrder } from '@/services/accurateOrder';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    // Status transaksi sukses di Midtrans
    if (body.transaction_status === 'capture' || body.transaction_status === 'settlement') {
      const orderId = body.order_id;
      
      // 1. Update status pesanan di Supabase
      await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
      
      // 2. Tembak Sales Order ke Accurate
      // Ambil detail pesanan & barang dari Supabase
      const { data: order } = await supabase
        .from('orders')
        .select(`
          branch_id, 
          branches_cache(accurate_branch_id),
          order_items(quantity, unit_price, products_cache(accurate_item_id))
        `)
        .eq('id', orderId)
        .single();
        
      if (order) {
        // Ambil "no" barang dari Accurate menggunakan ID (idealnya ini disimpan di cache juga)
        // Demi demo, kita anggap accurate_item_id sudah cukup (biasanya butuh item no)
        const branchAccurateId = parseInt(order.branches_cache.accurate_branch_id);
        // ... Logika kirim SO
        console.log("Membuat Sales Order di cabang:", branchAccurateId);
        // await createSalesOrder(branchAccurateId, items);
      }
      
      return NextResponse.json({ status: 'success' });
    }
    
    return NextResponse.json({ status: 'ignored' });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

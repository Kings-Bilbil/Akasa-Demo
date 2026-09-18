import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSalesOrder } from '@/services/accurateOrder';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    const supabase = createAdminClient();

    // 1. Update status pesanan di database kita
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .select('*, order_items(*, products_cache(*)), branches_cache(*)')
      .single();
      
    if (updateError || !order) {
      console.error('Gagal update pesanan:', updateError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Buat Sales Order di Accurate Online
    console.log(`\n\n[LOCALHOST BYPASS] Memicu Sales Order ke Accurate untuk Pesanan: ${orderId}`);
    
    // Siapkan data untuk Accurate API
    const itemsForAccurate = order.order_items.map((item: any) => ({
      accurate_item_id: item.products_cache.accurate_item_id,
      price: item.price,
      qty: item.quantity
    }));

    const accurateBranchId = parseInt(order.branches_cache.accurate_branch_id);

    // Panggil servis Accurate kita (urutan argumen: branchId, items)
    const accurateRes = await createSalesOrder(accurateBranchId, itemsForAccurate);
    console.log('[Accurate API Response]', accurateRes);

    return NextResponse.json({ success: true, accurateRes });
  } catch (error: any) {
    console.error('Error di checkout success:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

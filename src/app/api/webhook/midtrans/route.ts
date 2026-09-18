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
        const branchAccurateId = parseInt((order.branches_cache as any).accurate_branch_id);
        const items = order.order_items.map((i: any) => ({
          accurate_item_id: (i.products_cache as any).accurate_item_id,
          qty: Number(i.quantity),
          price: Number(i.unit_price)
        }));

        try {
          console.log("Membuat Sales Order di cabang:", branchAccurateId);
          const soResult = await createSalesOrder(branchAccurateId, items);
          if (soResult && soResult.r && soResult.r.id) {
            await supabase.from('orders').update({ accurate_sales_order_id: soResult.r.id.toString() }).eq('id', orderId);
            await supabase.from('sync_logs').insert({ related_order_id: orderId, action: 'CREATE_SALES_ORDER', status: 'success', message: 'SO berhasil dibuat di Accurate' });
          } else {
            throw new Error("Respon Accurate tidak mengembalikan ID SO");
          }
        } catch (e: any) {
          const errStr = String(e.message || e).toLowerCase();
          let userMsg = `Gagal sinkronisasi ke Accurate: ${e.message || e}`;
          if (errStr.includes('fetch') || errStr.includes('network')) userMsg = 'Gagal menghubungi server Accurate.';
          else if (errStr.includes('api') || errStr.includes('token') || errStr.includes('unauthorized')) userMsg = 'Koneksi ditolak oleh Accurate. Token kedaluwarsa.';
          else if (errStr.includes('timeout')) userMsg = 'Server Accurate terlalu lama merespons.';
          else if (errStr.includes('no_item') || errStr.includes('not found')) userMsg = 'Barang tidak ditemukan di Accurate.';
          
          await supabase.from('sync_logs').insert({ related_order_id: orderId, action: 'CREATE_SALES_ORDER', status: 'error', message: userMsg });
        }
      }
      
      return NextResponse.json({ status: 'success' });
    }
    
    return NextResponse.json({ status: 'ignored' });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

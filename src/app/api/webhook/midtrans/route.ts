import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createSalesInvoice, createSalesReceipt } from '@/services/accurateOrder';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    
    // Status transaksi sukses di Midtrans
    if (body.transaction_status === 'capture' || body.transaction_status === 'settlement') {
      const orderId = body.order_id;
      
      // 1. Update status pesanan di Supabase
      await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);
      
      // 2. Tembak Sales Invoice & Receipt ke Accurate (Opsi B)
      const { data: order } = await supabase
        .from('orders')
        .select(`
          total_amount,
          branch_id, 
          branches_cache(accurate_branch_id),
          order_items(quantity, unit_price, products_cache(accurate_item_id))
        `)
        .eq('id', orderId)
        .single();
        
      if (order) {
        const branchAccurateId = parseInt((order.branches_cache as any).accurate_branch_id);
        const totalAmount = Number(order.total_amount);
        const items = order.order_items.map((i: any) => ({
          accurate_item_id: (i.products_cache as any).accurate_item_id,
          qty: Number(i.quantity),
          price: Number(i.unit_price)
        }));

        try {
          console.log("Membuat Faktur Penjualan di cabang:", branchAccurateId);
          // Langkah 1: Buat Faktur Penjualan (Memotong stok fisik)
          const siResult = await createSalesInvoice(branchAccurateId, items);
          if (siResult && siResult.r && siResult.r.id) {
            const invoiceId = siResult.r.id;
            await supabase.from('orders').update({ accurate_sales_order_id: invoiceId.toString() }).eq('id', orderId);
            
            // Langkah 2: Buat Penerimaan Penjualan (Melunasi tagihan Faktur ke Kas Midtrans)
            console.log("Membuat Penerimaan Penjualan (Lunas) untuk faktur:", invoiceId);
            const srResult = await createSalesReceipt(branchAccurateId, invoiceId, totalAmount);
            if (srResult && srResult.r && srResult.r.id) {
               await supabase.from('orders').update({ accurate_sales_receipt_id: srResult.r.id.toString() }).eq('id', orderId);
               await supabase.from('sync_logs').insert({ related_order_id: orderId, action: 'CREATE_SALES_INVOICE_AND_RECEIPT', status: 'success', message: 'Faktur & Penerimaan (Lunas) berhasil dibuat di Accurate' });
            } else {
               await supabase.from('sync_logs').insert({ related_order_id: orderId, action: 'CREATE_SALES_RECEIPT', status: 'error', message: 'Faktur berhasil, tapi gagal membuat Penerimaan Penjualan.' });
            }
          } else {
            throw new Error("Respon Accurate tidak mengembalikan ID Faktur");
          }
        } catch (e: any) {
          const errStr = String(e.message || e).toLowerCase();
          let userMsg = `Gagal sinkronisasi ke Accurate: ${e.message || e}`;
          if (errStr.includes('fetch') || errStr.includes('network')) userMsg = 'Gagal menghubungi server Accurate.';
          else if (errStr.includes('api') || errStr.includes('token') || errStr.includes('unauthorized')) userMsg = 'Koneksi ditolak oleh Accurate. Token kedaluwarsa.';
          else if (errStr.includes('timeout')) userMsg = 'Server Accurate terlalu lama merespons.';
          else if (errStr.includes('no_item') || errStr.includes('not found')) userMsg = 'Barang tidak ditemukan di Accurate.';
          
          await supabase.from('sync_logs').insert({ related_order_id: orderId, action: 'CREATE_SALES_INVOICE', status: 'error', message: userMsg });
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

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { fulfillPaidOrder } from '@/services/orderFulfillment';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Jalur localhost bypass: Midtrans webhook tidak bisa menjangkau localhost,
    // jadi frontend memanggil endpoint ini setelah snap.pay sukses.
    // Memakai helper yang SAMA dengan webhook (Faktur + Receipt, idempotent)
    // supaya tidak terjadi dokumen ganda SO vs Invoice.
    // Bug lama `item.price` (harusnya `unit_price`) sudah hilang karena
    // pengambilan harga dilakukan di dalam fulfillPaidOrder.
    console.log(`\n\n[LOCALHOST BYPASS] Fulfillment untuk Pesanan: ${orderId}`);

    try {
      const result = await fulfillPaidOrder(supabase, orderId, {
        source: 'checkout-success',
      });
      return NextResponse.json({ success: true, skipped: result.skipped, ...result });
    } catch (fulfillError: unknown) {
      // Order sudah ditandai paid, hanya Accurate yang gagal — tetap balas sukses
      // supaya popup frontend tidak menakuti pembeli. Admin bisa lihat di sync_logs.
      console.error('[checkout/success] Accurate gagal, order tetap paid:', fulfillError);
      return NextResponse.json({
        success: true,
        warning: fulfillError instanceof Error ? fulfillError.message : String(fulfillError),
      });
    }
  } catch (error: unknown) {
    console.error('Error di checkout success:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

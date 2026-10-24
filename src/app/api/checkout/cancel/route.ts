import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi.' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select('id, customer_id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    if (order.customer_id !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (order.status === 'paid') {
      return NextResponse.json(
        { error: 'Pesanan yang sudah lunas tidak dapat dibatalkan.' },
        { status: 400 }
      );
    }

    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('status', 'pending_payment');

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dibatalkan.',
    });
  } catch (error: unknown) {
    console.error('[checkout/cancel] Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal membatalkan pesanan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

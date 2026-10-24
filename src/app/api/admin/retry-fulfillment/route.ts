import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { fulfillPaidOrder } from '@/services/orderFulfillment';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'admin@azuraya.com') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya admin yang diizinkan melakukan sinkronisasi ulang.' },
        { status: 403 }
      );
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Parameter orderId wajib disertakan.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const result = await fulfillPaidOrder(adminSupabase, orderId, { source: 'admin-retry' });

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengirim ulang pesanan ke Accurate!',
      result
    });
  } catch (error: unknown) {
    console.error('Error retry fulfillment:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengirim ulang pesanan ke Accurate';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

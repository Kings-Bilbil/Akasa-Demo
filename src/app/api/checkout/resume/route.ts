import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { fulfillPaidOrder } from '@/services/orderFulfillment';

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
      .select('id, customer_id, status, total_amount, payments(raw_notification_ref, created_at)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    if (order.customer_id !== user.id) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({
        status: 'already_paid',
        invoiceUrl: `/invoice/${orderId}`,
      });
    }

    // 1. Cek status terkini di Midtrans: siapa tahu pelanggan sudah transfer VA/QRIS saat pop-up tertutup
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    if (serverKey) {
      try {
        const mtRes = await fetch(
          `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (mtRes.ok) {
          const mtData = await mtRes.json();
          const txStatus = mtData?.transaction_status;
          const fraudStatus = mtData?.fraud_status;

          if (
            txStatus === 'settlement' ||
            (txStatus === 'capture' && (!fraudStatus || fraudStatus === 'accept'))
          ) {
            try {
              await fulfillPaidOrder(adminSupabase, orderId, {
                source: 'dashboard-resume',
                midtransNotification: {
                  transaction_id: mtData.transaction_id,
                  payment_type: mtData.payment_type,
                  transaction_status: mtData.transaction_status,
                  raw: mtData,
                },
              });
            } catch (e) {
              console.error('[checkout/resume] Gagal sinkron Accurate saat auto-settle:', e);
            }
            return NextResponse.json({
              status: 'already_paid',
              invoiceUrl: `/invoice/${orderId}`,
            });
          }

          if (txStatus === 'expire' || txStatus === 'cancel' || txStatus === 'deny') {
            await adminSupabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', orderId);
            return NextResponse.json(
              {
                status: 'expired',
                error: 'Waktu pembayaran untuk pesanan ini telah berakhir. Silakan buat pesanan baru.',
              },
              { status: 410 }
            );
          }
        }
      } catch (err) {
        console.warn('[checkout/resume] Gagal cek status Midtrans:', err);
      }
    }

    // 2. Cari snap_token yang sudah tersimpan di tabel payments
    const paymentsList = (order.payments as { raw_notification_ref?: { snap_token?: string } }[]) || [];
    const savedToken = paymentsList.find((p) => p.raw_notification_ref?.snap_token)?.raw_notification_ref?.snap_token;

    if (savedToken) {
      return NextResponse.json({
        status: 'resume',
        token: savedToken,
      });
    }

    return NextResponse.json(
      {
        error: 'Token pembayaran tidak ditemukan untuk pesanan lama ini. Silakan batalkan dan buat pesanan baru.',
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('[checkout/resume] Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal melanjutkan pembayaran';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

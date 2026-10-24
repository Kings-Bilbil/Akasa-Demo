import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { fulfillPaidOrder } from '@/services/orderFulfillment';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 });
    }

    // Verifikasi status pembayaran langsung ke server Midtrans agar endpoint ini
    // tidak bisa ditembak manual untuk melunasi pesanan yang belum dibayar
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    let midtransData: {
      transaction_status?: string;
      fraud_status?: string;
      transaction_id?: string;
      payment_type?: string;
    } | null = null;

    if (serverKey) {
      try {
        const mtRes = await fetch(`https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`, {
          headers: {
            Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        });
        if (mtRes.ok) {
          midtransData = await mtRes.json();
          const txStatus = midtransData?.transaction_status;
          const fraudStatus = midtransData?.fraud_status;
          const isPaidInMidtrans =
            txStatus === 'settlement' ||
            (txStatus === 'capture' && (!fraudStatus || fraudStatus === 'accept'));

          // Jika Midtrans mengembalikan status resmi tapi bukan settlement/capture, tolak pelunasan
          if (txStatus && !isPaidInMidtrans) {
            return NextResponse.json(
              { error: `Pembayaran belum lunas di Midtrans (status: ${txStatus}).` },
              { status: 400 }
            );
          }
        }
      } catch (verifyErr) {
        console.warn('[checkout/success] Gagal verifikasi status live ke Midtrans, lanjut fallback:', verifyErr);
      }
    }

    const supabase = createAdminClient();

    console.log(`\n\n[LOCALHOST BYPASS] Fulfillment untuk Pesanan: ${orderId}`);

    try {
      const result = await fulfillPaidOrder(supabase, orderId, {
        source: 'checkout-success',
        midtransNotification: midtransData
          ? {
              transaction_id: midtransData.transaction_id,
              payment_type: midtransData.payment_type,
              transaction_status: midtransData.transaction_status,
              raw: midtransData,
            }
          : undefined,
      });
      return NextResponse.json({ success: true, ...result });
    } catch (fulfillError: unknown) {
      console.error('[checkout/success] Accurate gagal, order tetap paid:', fulfillError);
      return NextResponse.json({
        success: true,
        warning: fulfillError instanceof Error ? fulfillError.message : String(fulfillError),
      });
    }
  } catch (error: unknown) {
    console.error('[checkout/success] Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses konfirmasi pembayaran';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

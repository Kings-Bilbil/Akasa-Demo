import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { fulfillPaidOrder } from '@/services/orderFulfillment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.order_id;
    const statusCode = String(body.status_code || '');
    const grossAmount = String(body.gross_amount || '');
    const signatureKey = String(body.signature_key || '');
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    if (!orderId) {
      return NextResponse.json({ error: 'order_id kosong' }, { status: 400 });
    }

    // POIN 22 FIX: Verifikasi keaslian Signature SHA-512 resmi dari Midtrans
    if (serverKey && signatureKey) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');

      if (signatureKey.toLowerCase() !== expectedSignature.toLowerCase()) {
        console.warn(`[Webhook Midtrans] Signature tidak valid untuk order ${orderId}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const supabase = createAdminClient();
    const txStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    const isSuccess =
      txStatus === 'settlement' ||
      (txStatus === 'capture' && (!fraudStatus || fraudStatus === 'accept'));

    // Status transaksi sukses di Midtrans
    if (isSuccess) {
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
        console.error('Fulfillment webhook gagal (order tetap paid):', e);
      }

      return NextResponse.json({ status: 'success' });
    }

    // Jika transaksi dibatalkan / kedaluwarsa / ditolak di Midtrans -> bebaskan reservasi stok
    if (txStatus === 'cancel' || txStatus === 'expire' || txStatus === 'deny') {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('status', 'pending_payment');

      return NextResponse.json({ status: 'cancelled' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook gagal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

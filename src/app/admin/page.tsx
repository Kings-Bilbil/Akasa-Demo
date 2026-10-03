import OrdersDatatable, { type OrderRow } from '@/views/datatables/datatable-orders'
import { Card } from '@/components/ui/card'
import { createAdminClient } from '@/utils/supabase/admin'

type SyncLog = {
  status: string
  message?: string
}

type AdminOrder = {
  id: string
  created_at: string
  status: string
  total_amount?: number | null
  accurate_sales_invoice_id?: string | number | null
  accurate_sales_order_id?: string | number | null
  accurate_sales_receipt_id?: string | number | null
  customers?: { full_name?: string | null; email?: string | null } | null
  branches_cache?: { name?: string | null } | null
  sync_logs?: SyncLog[] | null
}

export default async function AdminOrdersPage() {
  const adminClient = createAdminClient()

  const { data: orders } = await adminClient
    .from('orders')
    .select('*, customers(full_name, email), branches_cache(name), sync_logs(status, message, action)')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  const list = (orders ?? []) as AdminOrder[]

  // ---------- Baris tabel ----------
  const rows: OrderRow[] = list.map(order => {
    const failedLog = order.sync_logs?.find((log: SyncLog) => log.status === 'error')

    // Kolom baru accurate_sales_invoice_id adalah sumber kebenaran untuk Faktur.
    // Kolom lama accurate_sales_order_id dipertahankan untuk data legacy:
    // dulu invoice sempat tersimpan di kolom SO (menipu), jadi fallback ke sana
    // hanya untuk menampilkan, bukan untuk logika baru.
    const invoiceId = order.accurate_sales_invoice_id
      ? String(order.accurate_sales_invoice_id)
      : null;
    const soId = order.accurate_sales_order_id ? String(order.accurate_sales_order_id) : null;
    const receiptId = order.accurate_sales_receipt_id ? String(order.accurate_sales_receipt_id) : null;

    return {
      id: order.id,
      shortId: String(order.id).split('-')[0],
      createdAt: order.created_at,
      customerName: order.customers?.full_name || 'Tanpa Nama',
      customerEmail: order.customers?.email || '-',
      branchName: order.branches_cache?.name || '',
      isPaid: order.status === 'paid',
      total: order.total_amount || 0,
      accurateSo: soId,
      accurateInvoice: invoiceId,
      accurateReceipt: receiptId,
      syncError: !invoiceId && !soId && failedLog ? failedLog.message || 'Terjadi kesalahan' : null
    }
  })

  return (
    <div className='grid gap-6'>
      <Card className='w-full py-0'>
        <OrdersDatatable data={rows} variant='admin' emptyText='Belum ada pesanan masuk.' />
      </Card>
    </div>
  )
}

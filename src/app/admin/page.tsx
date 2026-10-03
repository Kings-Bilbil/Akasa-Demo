import OrdersDatatable, { type OrderRow } from '@/views/datatables/datatable-orders'
import { Card } from '@/components/ui/card'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function AdminOrdersPage() {
  const adminClient = createAdminClient()

  const { data: orders } = await adminClient
    .from('orders')
    .select('*, customers(full_name, email), branches_cache(name), sync_logs(status, message, action)')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  const list = (orders ?? []) as any[]

  // ---------- Baris tabel ----------
  const rows: OrderRow[] = list.map(order => {
    const failedLog = order.sync_logs?.find((log: any) => log.status === 'error')

    return {
      id: order.id,
      shortId: String(order.id).split('-')[0],
      createdAt: order.created_at,
      customerName: order.customers?.full_name || 'Tanpa Nama',
      customerEmail: order.customers?.email || '-',
      branchName: order.branches_cache?.name || '',
      isPaid: order.status === 'paid',
      total: order.total_amount || 0,
      accurateSo: order.accurate_sales_order_id ? String(order.accurate_sales_order_id) : null,
      syncError: !order.accurate_sales_order_id && failedLog ? failedLog.message || 'Terjadi kesalahan' : null
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

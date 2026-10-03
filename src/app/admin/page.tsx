import { CircleAlertIcon, ClockIcon, ShoppingCartIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'

import CatalogSummaryCard from '@/views/dashboards/widgets/widget-catalog-summary'
import SalesOverviewCard from '@/views/dashboards/charts/chart-sales-metrics'
import StatisticsCard from '@/views/dashboards/statistics/statistics-card-01'
import RankingCard from '@/views/dashboards/widgets/widget-ranking'
import OrdersDatatable, { type OrderRow } from '@/views/datatables/datatable-orders'

import { formatRupiah, formatRupiahCompact } from '@/lib/format'
import { createAdminClient } from '@/utils/supabase/admin'

const TIME_ZONE = 'Asia/Jakarta'

const dateKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date)
const monthKey = (date: Date) => dateKey(date).slice(0, 7)

export default async function AdminOrdersPage() {
  const adminClient = createAdminClient()

  const [{ data: orders }, { count: productCount }, { count: branchCount }] = await Promise.all([
    adminClient
      .from('orders')
      .select('*, customers(full_name, email), branches_cache(name), sync_logs(status, message, action)')
      .order('created_at', { ascending: false }),
    adminClient.from('products_cache').select('*', { count: 'exact', head: true }),
    adminClient.from('branches_cache').select('*', { count: 'exact', head: true })
  ])

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

  // ---------- Agregat ----------
  const paid = list.filter(order => order.status === 'paid')
  const paidOrders = paid.length
  const pendingOrders = list.length - paidOrders
  const totalRevenue = paid.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const failedSyncCount = rows.filter(row => row.isPaid && row.syncError).length
  const uniqueCustomers = new Set(list.map(order => order.customer_id).filter(Boolean)).size
  const avgOrder = paidOrders === 0 ? 0 : Math.round(totalRevenue / paidOrders)

  // ---------- 5 bulan terakhir ----------
  const now = new Date()
  const months = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (4 - index), 1)
    return {
      key: monthKey(new Date(date.getFullYear(), date.getMonth(), 15)),
      label: date.toLocaleDateString('id-ID', { month: 'short' })
    }
  })

  const monthlyOrders = months.map(({ key, label }) => ({
    month: label,
    orders: list.filter(order => monthKey(new Date(order.created_at)) === key).length
  }))

  const monthlyRevenue = months.map(({ key, label }) => ({
    month: label,
    revenue: paid
      .filter(order => monthKey(new Date(order.created_at)) === key)
      .reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }))

  // ---------- 24 hari terakhir ----------
  const dailySales = Array.from({ length: 24 }, (_, index) => {
    const date = new Date(now.getTime() - (23 - index) * 24 * 60 * 60 * 1000)
    const key = dateKey(date)

    return {
      date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: TIME_ZONE }),
      sales: paid
        .filter(order => dateKey(new Date(order.created_at)) === key)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)
    }
  })

  // ---------- Peringkat cabang ----------
  const byBranch = new Map<string, { revenue: number; orders: number }>()
  paid.forEach(order => {
    const name = order.branches_cache?.name || 'Tanpa Cabang'
    const current = byBranch.get(name) ?? { revenue: 0, orders: 0 }
    byBranch.set(name, { revenue: current.revenue + (order.total_amount || 0), orders: current.orders + 1 })
  })

  const topBranches = [...byBranch.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 4)
  const maxBranchRevenue = topBranches[0]?.[1].revenue || 1

  return (
    <div className='grid grid-cols-2 gap-6 lg:grid-cols-3'>
      {/* Kartu statistik */}
      <div className='col-span-full grid gap-6 sm:grid-cols-3 md:max-lg:grid-cols-1'>
        <StatisticsCard
          icon={<ShoppingCartIcon className='size-4' />}
          value={String(list.length)}
          title='Total Pesanan'
          description={`${paidOrders} sudah lunas`}
        />
        <StatisticsCard
          icon={<ClockIcon className='size-4' />}
          value={String(pendingOrders)}
          title='Menunggu Pembayaran'
          description='Belum dibayar oleh pelanggan'
        />
        <StatisticsCard
          icon={<CircleAlertIcon className='size-4' />}
          value={String(failedSyncCount)}
          title='Gagal Kirim ke Accurate'
          description={failedSyncCount === 0 ? 'Semua pesanan lunas sudah tersinkron' : 'Perlu dicek di tabel pesanan'}
        />
      </div>

      <div className='grid gap-6 max-xl:col-span-full lg:max-xl:grid-cols-2'>
        <CatalogSummaryCard
          className='justify-between gap-3 *:data-[slot=card-content]:space-y-5'
          monthlyOrders={monthlyOrders}
          monthlyRevenue={monthlyRevenue}
          totalOrders={list.length}
          totalRevenueLabel={formatRupiahCompact(totalRevenue)}
          totalProducts={productCount ?? 0}
          totalBranches={branchCount ?? 0}
        />

        <RankingCard
          className='justify-between gap-5 sm:min-w-0'
          title='Pendapatan per Cabang'
          totalLabel={formatRupiah(totalRevenue)}
          description='Dari pesanan yang sudah lunas'
          emptyText='Belum ada pesanan lunas.'
          rows={topBranches.map(([name, value]) => ({
            name,
            subtitle: `${value.orders} pesanan`,
            valueLabel: formatRupiahCompact(value.revenue),
            progressPercentage: Math.round((value.revenue / maxBranchRevenue) * 100)
          }))}
        />
      </div>

      <SalesOverviewCard
        className='col-span-full *:data-[slot=card-content]:space-y-6 xl:col-span-2'
        paidOrders={paidOrders}
        pendingOrders={pendingOrders}
        dailySales={dailySales}
        dailyRangeLabel='24 hari terakhir'
        metrics={[
          { icon: 'revenue', title: 'Total pendapatan', value: formatRupiah(totalRevenue) },
          { icon: 'orders', title: 'Total pesanan', value: String(list.length) },
          { icon: 'average', title: 'Rata-rata per pesanan', value: formatRupiah(avgOrder) },
          { icon: 'customers', title: 'Pelanggan', value: String(uniqueCustomers) }
        ]}
      />

      <Card className='col-span-full w-full py-0'>
        <OrdersDatatable data={rows} variant='admin' emptyText='Belum ada pesanan masuk.' />
      </Card>
    </div>
  )
}

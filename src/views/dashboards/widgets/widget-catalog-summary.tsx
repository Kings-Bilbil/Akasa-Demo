'use client'

// Third-party Imports
import { Bar, BarChart } from 'recharts'

// Component Imports
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'

type Props = {
  className?: string
  /** Pesanan per bulan (5 bulan terakhir) */
  monthlyOrders: { month: string; orders: number }[]
  /** Pendapatan per bulan (5 bulan terakhir) */
  monthlyRevenue: { month: string; revenue: number }[]
  totalOrders: number
  totalRevenueLabel: string
  totalProducts: number
  totalBranches: number
}

const ordersChartConfig = {
  orders: { label: 'Pesanan', color: 'var(--primary)' }
} satisfies ChartConfig

const revenueChartConfig = {
  revenue: { label: 'Pendapatan', color: 'color-mix(in oklab, var(--primary) 30%, transparent)' }
} satisfies ChartConfig

const CatalogSummaryCard = ({
  className,
  monthlyOrders,
  monthlyRevenue,
  totalOrders,
  totalRevenueLabel,
  totalProducts,
  totalBranches
}: Props) => {
  return (
    <Card className={className}>
      <CardHeader className='flex justify-between'>
        <div className='flex flex-col gap-1'>
          <span className='text-lg font-semibold'>Ringkasan Toko</span>
          <span className='text-muted-foreground text-sm'>
            {totalProducts} produk &bull; {totalBranches} cabang
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Separator />
      </CardContent>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between gap-1'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs'>Pesanan masuk</span>
            <span className='text-2xl font-semibold'>{totalOrders.toLocaleString('id-ID')}</span>
          </div>
          <ChartContainer config={ordersChartConfig} className='min-h-13 max-w-18'>
            <BarChart accessibilityLayer data={monthlyOrders} barSize={8}>
              <Bar dataKey='orders' fill='var(--color-orders)' radius={2} minPointSize={2} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className='flex items-center justify-between gap-1'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs'>Total pendapatan</span>
            <span className='text-2xl font-semibold'>{totalRevenueLabel}</span>
          </div>
          <ChartContainer config={revenueChartConfig} className='min-h-13 max-w-18'>
            <BarChart accessibilityLayer data={monthlyRevenue} barSize={8}>
              <Bar dataKey='revenue' fill='var(--color-revenue)' radius={2} minPointSize={2} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default CatalogSummaryCard

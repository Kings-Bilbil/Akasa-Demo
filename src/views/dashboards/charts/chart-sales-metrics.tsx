'use client'

// Third-party Imports
import { Bar, BarChart, Label, Pie, PieChart } from 'recharts'
import { CircleCheckBigIcon, ReceiptTextIcon, ShoppingBagIcon, TrendingUpIcon, UsersIcon, WalletIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Util Imports
import { formatRupiah } from '@/lib/format'

type MetricIcon = 'revenue' | 'orders' | 'average' | 'customers'

export type SalesOverviewProps = {
  className?: string
  /** Empat kartu metrik di sisi kiri */
  metrics: { icon: MetricIcon; title: string; value: string }[]
  paidOrders: number
  pendingOrders: number
  /** Pendapatan harian (pesanan lunas) untuk grafik batang */
  dailySales: { date: string; sales: number }[]
  /** Judul kecil pada panel grafik batang */
  dailyRangeLabel: string
}

const metricIcons: Record<MetricIcon, React.ReactNode> = {
  revenue: <TrendingUpIcon className='size-5' />,
  orders: <ShoppingBagIcon className='size-5' />,
  average: <WalletIcon className='size-5' />,
  customers: <UsersIcon className='size-5' />
}

const statusChartConfig = {
  total: { label: 'Pesanan' },
  paid: { label: 'Lunas', color: 'var(--primary)' },
  pending: { label: 'Menunggu', color: 'color-mix(in oklab, var(--primary) 30%, transparent)' }
} satisfies ChartConfig

const dailyChartConfig = {
  sales: { label: 'Pendapatan' }
} satisfies ChartConfig

const SalesOverviewCard = ({
  className,
  metrics,
  paidOrders,
  pendingOrders,
  dailySales,
  dailyRangeLabel
}: SalesOverviewProps) => {
  const totalOrders = paidOrders + pendingOrders
  const successRate = totalOrders === 0 ? 0 : Math.round((paidOrders / totalOrders) * 100)

  const statusData =
    totalOrders === 0
      ? [{ status: 'pending', total: 1, fill: 'color-mix(in oklab, var(--muted-foreground) 25%, transparent)' }]
      : [
          { status: 'paid', total: paidOrders, fill: 'var(--color-paid)' },
          { status: 'pending', total: pendingOrders, fill: 'var(--color-pending)' }
        ]

  return (
    <Card className={className}>
      <CardContent>
        <div className='grid gap-6 lg:grid-cols-5'>
          <div className='flex flex-col justify-between gap-7 lg:col-span-3'>
            <span className='text-lg font-semibold'>Ringkasan Penjualan</span>
            <div className='flex items-center gap-3'>
              <img src='/images/logo.png' className='size-10.5 rounded-lg bg-black object-contain p-1' alt='Azuraya' />
              <div className='flex flex-col gap-0.5'>
                <span className='text-xl font-medium'>Azuraya Grup</span>
                <span className='text-muted-foreground text-sm'>Seluruh cabang &bull; semua waktu</span>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              {metrics.map(metric => (
                <Card key={metric.title} className='ring-foreground/10 py-2 shadow-none ring-1'>
                  <CardContent className='flex items-center gap-3 px-4'>
                    <Avatar className='rounded-sm after:border-0'>
                      <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                        {metricIcons[metric.icon]}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex min-w-0 flex-col gap-0.5'>
                      <span className='text-muted-foreground text-sm font-medium'>{metric.title}</span>
                      <span className='truncate text-lg font-medium'>{metric.value}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className='ring-foreground/10 justify-between gap-4 shadow-none ring-1 lg:col-span-2'>
            <CardHeader className='gap-1'>
              <CardTitle className='text-lg font-semibold'>Status Pesanan</CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
              <ChartContainer config={statusChartConfig} className='h-38.5 w-full'>
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={statusData}
                    dataKey='total'
                    nameKey='status'
                    startAngle={300}
                    endAngle={660}
                    innerRadius={58}
                    outerRadius={75}
                    paddingAngle={totalOrders === 0 ? 0 : 2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 12}
                                className='fill-card-foreground text-lg font-medium'
                              >
                                {totalOrders}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 19} className='fill-muted-foreground text-sm'>
                                Total Pesanan
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className='flex items-center justify-between'>
                <span className='text-xl'>Lunas</span>
                <span className='text-2xl font-medium'>{successRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      <CardContent>
        <Card className='ring-foreground/10 shadow-none ring-1'>
          <CardContent className='grid gap-4 lg:grid-cols-5'>
            <div className='flex flex-col justify-center gap-6'>
              <span className='text-lg font-semibold'>Tingkat Pembayaran</span>
              <span className='max-lg:5xl text-6xl'>{successRate}%</span>
              <span className='text-muted-foreground text-sm'>Persentase pesanan yang sudah dibayar lunas</span>
            </div>
            <div className='flex flex-col gap-6 text-lg md:col-span-4'>
              <span className='font-medium'>Pendapatan harian</span>
              <span className='text-muted-foreground text-wrap'>
                Total nilai pesanan lunas per hari ({dailyRangeLabel}). Arahkan kursor ke batang untuk melihat nominalnya.
              </span>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='flex items-center gap-2'>
                  <CircleCheckBigIcon className='size-6' />
                  <span className='text-lg font-medium'>{paidOrders} Lunas</span>
                </div>
                <div className='flex items-center gap-2'>
                  <ReceiptTextIcon className='size-6' />
                  <span className='text-lg font-medium'>{pendingOrders} Menunggu</span>
                </div>
              </div>

              <ChartContainer config={dailyChartConfig} className='h-16 w-full'>
                <BarChart accessibilityLayer data={dailySales} margin={{ left: 0, right: 0 }} maxBarSize={16}>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideIndicator
                        labelFormatter={value => String(value)}
                        formatter={value => formatRupiah(Number(value))}
                      />
                    }
                  />
                  <Bar
                    dataKey='sales'
                    fill='var(--primary)'
                    background={{ fill: 'color-mix(in oklab, var(--primary) 10%, transparent)', radius: 12 }}
                    radius={12}
                    minPointSize={2}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default SalesOverviewCard

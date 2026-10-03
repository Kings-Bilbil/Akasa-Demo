import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CircleCheckBigIcon, ClockIcon, ShoppingCartIcon, WalletIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import OrdersDatatable, { type OrderRow } from '@/views/datatables/datatable-orders'

import { formatRupiah } from '@/lib/format'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.email === 'admin@azuraya.com') {
    redirect('/admin')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products_cache(name)), branches_cache(name)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const list = (orders ?? []) as any[]

  const rows: OrderRow[] = list.map(order => ({
    id: order.id,
    shortId: String(order.id).split('-')[0],
    createdAt: order.created_at,
    customerName: '',
    customerEmail: '',
    branchName: order.branches_cache?.name || '',
    isPaid: order.status === 'paid',
    total: order.total_amount || 0,
    items: (order.order_items ?? []).map((item: any) => `${item.quantity}x ${item.products_cache?.name ?? 'Produk'}`).join(', ')
  }))

  const paid = list.filter(order => order.status === 'paid')
  const totalSpent = paid.reduce((sum, order) => sum + (order.total_amount || 0), 0)

  return (
    <div className='grid gap-6'>
      <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Pesanan</CardTitle>
            <ShoppingCartIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{list.length}</div>
            <p className='text-xs text-muted-foreground'>Semua pesanan Anda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pesanan Lunas</CardTitle>
            <CircleCheckBigIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{paid.length}</div>
            <p className='text-xs text-muted-foreground'>Sudah dibayar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Menunggu Pembayaran</CardTitle>
            <ClockIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{list.length - paid.length}</div>
            <p className='text-xs text-muted-foreground'>Belum dibayar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Belanja</CardTitle>
            <WalletIcon className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatRupiah(totalSpent)}</div>
            <p className='text-xs text-muted-foreground'>Dari pesanan yang lunas</p>
          </CardContent>
        </Card>
      </div>

      <Card className='w-full py-0'>
        <CardHeader className='border-b pt-6 pb-4'>
          <CardTitle className='text-lg font-semibold'>Riwayat Pesanan</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {list.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center gap-4 py-16 text-center'>
              <p>Anda belum memiliki riwayat pesanan.</p>
              <Button render={<Link href='/produk' />}>Belanja Sekarang</Button>
            </div>
          ) : (
            <OrdersDatatable data={rows} variant='user' pageSize={5} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

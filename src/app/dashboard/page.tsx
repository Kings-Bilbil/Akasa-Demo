import { redirect } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import OrdersDatatable, { type OrderRow } from '@/views/datatables/datatable-orders'

import { createClient } from '@/utils/supabase/server'

type DashboardOrderItem = {
  quantity: number
  products_cache?: { name?: string | null } | null
}

type DashboardOrder = {
  id: string
  created_at: string
  status: string
  total_amount?: number | null
  branches_cache?: { name?: string | null } | null
  order_items?: DashboardOrderItem[] | null
}

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
    .eq('status', 'paid')
    .order('created_at', { ascending: false })

  const list = (orders ?? []) as DashboardOrder[]

  const rows: OrderRow[] = list.map(order => ({
    id: order.id,
    shortId: String(order.id).split('-')[0],
    createdAt: order.created_at,
    customerName: '',
    customerEmail: '',
    branchName: order.branches_cache?.name || '',
    isPaid: order.status === 'paid',
    total: order.total_amount || 0,
    items: (order.order_items ?? []).map((item: DashboardOrderItem) => `${item.quantity}x ${item.products_cache?.name ?? 'Produk'}`).join(', ')
  }))

  return (
    <div className='grid gap-6'>
      <Card className='w-full py-0'>
          <CardHeader className='border-b px-6 pt-6 pb-4'>
          <CardTitle className='text-lg font-semibold'>Riwayat Pesanan</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {list.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center gap-4 py-16 text-center'>
              <p>Anda belum memiliki riwayat pesanan.</p>
              <Button render={<Link href='/produk' />}>Belanja Sekarang</Button>
            </div>
          ) : (
            <OrdersDatatable data={rows} variant='user' />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

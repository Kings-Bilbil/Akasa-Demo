import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
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

  return (
    <main className="min-h-screen bg-gray-50 py-12 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-800 font-medium transition">&larr; Kembali ke Beranda</Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Anda</h1>
          <form action="/api/auth/logout" method="POST">
            <button className="text-red-600 font-medium hover:underline">Keluar</button>
          </form>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Riwayat Pesanan</h2>
          
          {(!orders || orders.length === 0) ? (
            <div className="text-center py-10 text-gray-500">
              Anda belum memiliki riwayat pesanan.
              <div className="mt-4">
                <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">Belanja Sekarang</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-5 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start border-b pb-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tanggal Pesanan: {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                      <p className="font-bold text-gray-900 text-lg">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full mb-2 ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                      </span>
                      <br/>
                      {order.status === 'paid' && (
                        <Link href={`/invoice/${order.id}`} className="text-blue-600 text-sm hover:underline font-medium" target="_blank">
                          Download Bukti Bayar / Invoice
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Item yang Dipesan (Ambil di {order.branches_cache?.name}):</p>
                    <ul className="space-y-2">
                      {order.order_items.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between text-sm text-gray-600">
                          <span>{item.quantity}x {item.products_cache?.name}</span>
                          <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

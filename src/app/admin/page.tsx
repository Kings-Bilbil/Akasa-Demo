import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simple admin check based on email for demo purposes
  if (!user || user.email !== 'admin@azuraya.com') {
    return (
      <div className="text-center mt-20">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="text-gray-700">Halaman ini hanya untuk Admin. Silakan login menggunakan email <strong>admin@azuraya.com</strong>.</p>
      </div>
    )
  }

  const adminClient = createAdminClient();
  const { data: orders } = await adminClient
    .from('orders')
    .select('*, customers(full_name, email), branches_cache(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Daftar Pesanan Masuk</h1>
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cabang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.split('-')[0]}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customers?.full_name || 'Tanpa Nama'}</div>
                  <div className="text-sm text-gray-500">{order.customers?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.branches_cache?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'paid' ? 'Lunas / Diproses' : 'Menunggu Pembayaran'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  Rp {order.total_amount.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <div className="p-8 text-center text-gray-500">Belum ada pesanan masuk.</div>
        )}
      </div>
    </div>
  )
}

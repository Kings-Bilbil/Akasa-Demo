import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProductList from './ProductList'

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== 'admin@azuraya.com') {
    redirect('/admin');
  }

  const adminClient = createAdminClient();
  const { data: products } = await adminClient
    .from('products_cache')
    .select('*')
    .order('name');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Gambar Produk</h1>
      <p className="text-gray-600 mb-8">Gambar yang diatur di sini akan langsung tampil di website dan tidak akan tertimpa saat sinkronisasi Accurate.</p>
      
      <ProductList initialProducts={products || []} />
    </div>
  )
}

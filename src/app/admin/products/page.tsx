import { redirect } from 'next/navigation'

import PageHeader from '@/components/layout/PageHeader'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

import ProductList from './ProductList'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@azuraya.com') {
    redirect('/admin')
  }

  const adminClient = createAdminClient()
  const { data: products } = await adminClient.from('products_cache').select('*').order('name')

  return (
    <div>
      <PageHeader
        title='Pengaturan Gambar Produk'
        description='Upload file gambar (JPG/PNG/WebP) dari perangkat. Gambar langsung tampil di website dan tidak akan tertimpa saat sinkronisasi Accurate. Jika upload gagal, jalankan SQL pembuatan bucket product-images di supabase.sql terlebih dahulu.'
      />
      <ProductList initialProducts={products || []} />
    </div>
  )
}

import { redirect } from 'next/navigation'

import PageHeader from '@/components/layout/PageHeader'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

import BranchList from './BranchList'

export default async function AdminBranchesPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@azuraya.com') {
    redirect('/admin')
  }

  const adminClient = createAdminClient()
  const { data: branches } = await adminClient.from('branches_cache').select('*').order('name')

  const { data: mapsData } = await adminClient.from('web_settings').select('value').eq('key', 'branch_maps').single()

  let branchMaps = {}
  if (mapsData?.value) {
    try {
      branchMaps = JSON.parse(mapsData.value)
    } catch (e) {}
  }

  return (
    <div>
      <PageHeader
        title='Pengaturan Peta Cabang'
        description='Atur link iframe Google Maps, nomor telepon, dan jam operasional untuk masing-masing cabang agar muncul ketika cabang dipilih.'
      />
      <BranchList branches={branches || []} initialData={branchMaps} />
    </div>
  )
}

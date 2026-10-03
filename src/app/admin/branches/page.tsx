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

  const { data: globalMapsData } = await adminClient.from('web_settings').select('value').eq('key', 'gmaps_iframe_url').single()
  const currentGlobalMapUrl = globalMapsData?.value || ''

  let branchMaps = {}
  if (mapsData?.value) {
    try {
      branchMaps = JSON.parse(mapsData.value)
    } catch (e) {}
  }

  return (
    <div>
      <PageHeader
        title='Pengaturan Web & Cabang'
        description='Atur link iframe Google Maps global (footer website) serta informasi per-cabang (peta, telepon, jam operasional).'
      />
      <BranchList branches={branches || []} initialData={branchMaps} initialGlobalMap={currentGlobalMapUrl} />
    </div>
  )
}

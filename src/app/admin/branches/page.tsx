import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import BranchList from './BranchList'

export default async function AdminBranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== 'admin@azuraya.com') {
    redirect('/admin');
  }

  const adminClient = createAdminClient();
  const { data: branches } = await adminClient
    .from('branches_cache')
    .select('*')
    .order('name');
    
  const { data: mapsData } = await adminClient
    .from('web_settings')
    .select('value')
    .eq('key', 'branch_maps')
    .single();

  let branchMaps = {};
  if (mapsData?.value) {
    try {
      branchMaps = JSON.parse(mapsData.value);
    } catch (e) {}
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Peta Cabang</h1>
      <p className="text-gray-600 mb-8">Atur link iframe Google Maps untuk masing-masing cabang agar muncul ketika cabang dipilih.</p>
      
      <BranchList branches={branches || []} initialData={branchMaps} />
    </div>
  )
}


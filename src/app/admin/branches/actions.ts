'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function saveBranchMapsAction(data: Record<string, any>) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'branch_maps', value: JSON.stringify(data) });
    
  if (error) throw new Error(error.message);
  revalidatePath('/admin/branches');
  revalidatePath('/cabang');
  return { success: true };
}

export async function saveGlobalMapAction(globalMapUrl: string) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'gmaps_iframe_url', value: globalMapUrl });
    
  if (error) throw new Error(error.message);
  revalidatePath('/admin/branches');
  revalidatePath('/');
  return { success: true };
}

export async function saveSingleBranchAction(branchId: string, branchInfo: any) {
  const adminSupabase = createAdminClient();
  
  const { data: existingData } = await adminSupabase.from('web_settings').select('value').eq('key', 'branch_maps').single();
  let maps: Record<string, any> = {};
  if (existingData?.value) {
    try { maps = JSON.parse(existingData.value); } catch(e) {}
  }
  
  maps[branchId] = branchInfo;
  
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'branch_maps', value: JSON.stringify(maps) });
    
  if (error) throw new Error(error.message);
  revalidatePath('/admin/branches');
  revalidatePath('/cabang');
  return { success: true };
}

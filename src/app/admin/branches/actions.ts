'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

type BranchInfo = {
  mapUrl?: string
  phone?: string
  openTime?: string
  closeTime?: string
};

export async function saveBranchMapsAction(data: Record<string, BranchInfo | string>) {
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

export async function saveSingleBranchAction(branchId: string, branchInfo: BranchInfo) {
  const adminSupabase = createAdminClient();
  
  const { data: existingData } = await adminSupabase.from('web_settings').select('value').eq('key', 'branch_maps').single();
  let maps: Record<string, BranchInfo> = {};
  if (existingData?.value) {
    try { maps = JSON.parse(existingData.value); } catch {}
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

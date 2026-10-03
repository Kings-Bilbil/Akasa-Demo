'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function saveBranchMapsAction(data: Record<string, any>, globalMapUrl?: string) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'branch_maps', value: JSON.stringify(data) });
    
  if (error) {
    throw new Error(error.message);
  }
  
  if (globalMapUrl !== undefined) {
    const { error: gmapsError } = await adminSupabase
      .from('web_settings')
      .upsert({ key: 'gmaps_iframe_url', value: globalMapUrl });
      
    if (gmapsError) {
      throw new Error(gmapsError.message);
    }
  }
  
  revalidatePath('/admin/branches');
  revalidatePath('/cabang');
  revalidatePath('/');
  return { success: true };
}

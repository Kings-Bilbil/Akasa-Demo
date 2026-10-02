'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function saveBranchMapsAction(data: Record<string, any>) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'branch_maps', value: JSON.stringify(data) });
    
  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/admin/branches');
  revalidatePath('/cabang');
  revalidatePath('/');
  return { success: true };
}

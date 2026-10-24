'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type BranchInfo = {
  mapUrl?: string
  phone?: string
  openTime?: string
  closeTime?: string
};

/**
 * Poin 25 FIX: Ekstrak otomatis URL jika Admin menempelkan kode lengkap iframe HTML:
 * `<iframe src="https://www.google.com/maps/embed?..." ...></iframe>`
 */
function cleanMapsUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1].trim();
  }
  return trimmed;
}

async function verifyAdminAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== 'admin@azuraya.com') {
    throw new Error('Akses ditolak: Hanya admin yang dapat mengubah pengaturan cabang.');
  }
}

export async function saveBranchMapsAction(data: Record<string, BranchInfo | string>) {
  await verifyAdminAuth();
  
  // Bersihkan setiap URL peta yang dimasukkan
  const sanitized: Record<string, BranchInfo | string> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      sanitized[key] = cleanMapsUrl(val);
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = {
        ...val,
        mapUrl: cleanMapsUrl(val.mapUrl)
      };
    }
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'branch_maps', value: JSON.stringify(sanitized) });
    
  if (error) throw new Error(error.message);
  revalidatePath('/admin/branches');
  revalidatePath('/cabang');
  return { success: true };
}

export async function saveGlobalMapAction(globalMapUrl: string) {
  await verifyAdminAuth();
  const cleanedUrl = cleanMapsUrl(globalMapUrl);

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'gmaps_iframe_url', value: cleanedUrl });
    
  if (error) throw new Error(error.message);
  revalidatePath('/admin/branches');
  revalidatePath('/');
  return { success: true };
}

export async function saveSingleBranchAction(branchId: string, branchInfo: BranchInfo) {
  await verifyAdminAuth();
  const sanitizedInfo: BranchInfo = {
    ...branchInfo,
    mapUrl: cleanMapsUrl(branchInfo.mapUrl)
  };

  const adminSupabase = createAdminClient();
  
  const { data: existingData } = await adminSupabase.from('web_settings').select('value').eq('key', 'branch_maps').single();
  let maps: Record<string, BranchInfo> = {};
  if (existingData?.value) {
    try { maps = JSON.parse(existingData.value); } catch {}
  }
  
  maps[branchId] = sanitizedInfo;
  
  const { error } = await adminSupabase
    .from('web_settings')
    .upsert({ key: 'branch_maps', value: JSON.stringify(maps) });
    
  if (error) throw new Error(error.message);
  revalidatePath('/admin/branches');
  revalidatePath('/cabang');
  return { success: true };
}

import Link from 'next/link';
import TemplateHeader from '@/components/TemplateHeader';
import './cabang.css';
import CabangClient from './CabangClient';
import { createClient } from '@/utils/supabase/server';

export default async function CabangPage() {
  const supabase = await createClient();
  
  // Ambil data cabang dari database (disinkronisasi dari Accurate)
  const { data: branches } = await supabase.from('branches_cache').select('*').order('name');
  
  // Ambil data pengaturan peta cabang
  const { data: mapsData } = await supabase.from('web_settings').select('value').eq('key', 'branch_maps').single();
  
  // Parse mapsData
  let branchMaps = {};
  try {
    if (mapsData?.value) {
      branchMaps = JSON.parse(mapsData.value);
    }
  } catch (e) {}

  return (
    <>
      <TemplateHeader />
      <main className="store-locator bg-black text-white min-h-screen">
        <div className="store-locator__header flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
          <h2 className="text-2xl font-bold m-0">Cari <span className="text-yellow-500">Cabang Azuraya</span></h2>
          <Link href="/" className="store-locator__close transition-opacity hover:opacity-80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>
        
        <CabangClient branches={branches || []} branchMaps={branchMaps} />
      </main>
    </>
  );
}



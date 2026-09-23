'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import TemplateHeader from '@/components/TemplateHeader';

export default function CabangPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [globalGmaps, setGlobalGmaps] = useState("https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1020084.7176140683!2d109.19199321307527!3d0.32924157053039146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1716382023912!5m2!1sen!2sid");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('branches_cache').select('*').then((res) => {
      if (res.data) setBranches(res.data);
    });
    supabase.from('settings').select('value').eq('key', 'gmaps_iframe_url').single().then((res) => {
      if (res.data?.value) setGlobalGmaps(res.data.value);
    });
  }, []);

  const getMapUrl = () => {
    if (selectedBranch) {
      return "https://maps.google.com/maps?q=" + encodeURIComponent(selectedBranch.name + " " + selectedBranch.address) + "&t=&z=15&ie=UTF8&iwloc=&output=embed";
    }
    return globalGmaps;
  };

  return (
    <>
      <TemplateHeader />
      <main className="store-locator min-h-screen flex flex-col" style={{ paddingTop: '80px' }}>
        <div className="store-locator__header flex justify-between items-center px-6 py-4 bg-black border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Cari <span className="text-yellow-500">Cabang Azuraya</span></h1>
          <Link href="/#cabang" className="text-white hover:text-yellow-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>
        
        <div className="store-locator__content flex-1 flex flex-col md:flex-row">
          <div className="store-locator__sidebar md:w-1/3 bg-[#111] overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            
            <div className="store-locator__list p-4 flex flex-col gap-4">
              <div 
                className={`p-4 rounded-xl cursor-pointer transition border ${!selectedBranch ? 'border-yellow-500 bg-[#1a1a1a]' : 'border-gray-800 bg-black hover:bg-[#1a1a1a]'}`}
                onClick={() => setSelectedBranch(null)}
              >
                <h4 className="text-yellow-500 font-bold text-lg">Semua Cabang (Kalimantan Barat)</h4>
                <p className="text-gray-400 text-sm mt-2">Lihat semua lokasi cabang Azuraya di peta</p>
              </div>

              {branches.map(branch => (
                <div 
                  key={branch.id} 
                  className={`p-4 rounded-xl cursor-pointer transition border ${selectedBranch?.id === branch.id ? 'border-yellow-500 bg-[#1a1a1a]' : 'border-gray-800 bg-black hover:bg-[#1a1a1a]'}`}
                  onClick={() => setSelectedBranch(branch)}
                >
                  <div className="store-locator__item-info">
                    <div className="store-locator__item-header flex justify-between items-start mb-2">
                      <h4 className="text-white font-bold text-lg">{branch.name}</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{branch.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="store-locator__map md:w-2/3 h-[50vh] md:h-auto relative">
            <iframe 
              src={getMapUrl()} 
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </main>
    </>
  );
}


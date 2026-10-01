'use client';

import { useState } from 'react';
import Link from 'next/link';
import './cabang.css';

export default function CabangClient({ branches, branchMaps }: { branches: any[], branchMaps: Record<string, string> }) {
  const [search, setSearch] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(branches.length > 0 ? branches[0].id : null);

  const filteredBranches = branches;
  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const mapUrl = selectedBranchId ? branchMaps[selectedBranchId] : null;

  return (
    <div className="store-locator__content flex gap-10">
      {/* Left Panel */}
      <div className="store-locator__sidebar flex flex-col gap-6 w-[440px] shrink-0">
        

        <div className="store-locator__list flex flex-col gap-6 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
          {filteredBranches.map(branch => {
            const isActive = selectedBranchId === branch.id;
            return (
              <div 
                key={branch.id} 
                className={`store-locator__item flex gap-4 cursor-pointer transition-opacity hover:opacity-80 ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedBranchId(branch.id)}
              >
                
                
                <div className={`store-locator__item-info flex-grow flex flex-col gap-2 ${isActive ? 'border-l-4 border-[#F5C518] pl-3' : 'border-l-4 border-transparent pl-3'}`}>
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-base font-bold text-white leading-tight m-0">{branch.name}</h4>
                    <span className="text-sm text-gray-400 flex items-center gap-1 shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      10 km
                    </span>
                  </div>
                  <p className="text-sm m-0"><span className="text-green-500 font-semibold">Buka</span> <span className="text-gray-400">- Tutup pukul 23.00</span></p>
                  <p className="text-sm text-gray-400 leading-snug m-0">{branch.address || 'Alamat belum diatur'}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1 m-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    0851-0000-0000
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="store-locator__map-panel flex-grow flex flex-col gap-6">
        <div className="store-locator__map-wrapper w-full h-[480px] rounded-3xl overflow-hidden bg-gray-900 border border-gray-800">
          {mapUrl ? (
            <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Peta belum diatur untuk cabang ini.
            </div>
          )}
        </div>
        <button className="w-full bg-yellow-500 text-black font-bold py-4 rounded-full text-lg hover:bg-yellow-400 transition-colors">Pilih Cabang ini</button>
      </div>
    </div>
  );
}



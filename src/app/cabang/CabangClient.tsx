'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './cabang.css';

export default function CabangClient({ branches, branchMaps }: { branches: any[], branchMaps: Record<string, any> }) {
  const [search, setSearch] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(branches.length > 0 ? branches[0].id : null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getBranchData = (branchId: string) => {
    const data = branchMaps[branchId];
    if (typeof data === 'string') {
      return { mapUrl: data, phone: '', openTime: '', closeTime: '' };
    }
    return data || { mapUrl: '', phone: '', openTime: '', closeTime: '' };
  };

  const filteredBranches = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));`n  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const selectedBranchData = selectedBranchId ? getBranchData(selectedBranchId) : null;
  const mapUrl = selectedBranchData?.mapUrl || null;

  return (
    <div className="store-locator__content flex gap-10 w-full">
      {/* Left Panel */}
      <div className="store-locator__sidebar flex flex-col gap-6 w-[440px] shrink-0">
        <div className="store-locator__search flex items-center gap-3 p-4 rounded-xl border border-gray-700 bg-transparent">
          <Link href="/" className="text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </Link>
          <input 
            type="text" 
            placeholder="Cari cabang..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-grow bg-transparent border-none text-white text-lg focus:outline-none"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>

        <div className="store-locator__list flex flex-col gap-6 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
          {filteredBranches.map(branch => {
            const isActive = selectedBranchId === branch.id;
            const bData = getBranchData(branch.id);
            
            // Logic status buka/tutup
            let isOpen = false;
            let statusText = '';
            
            if (bData.openTime && bData.closeTime && currentTimeStr) {
              const open = bData.openTime;
              const close = bData.closeTime;
              
              if (open <= close) {
                // Normal schedule: 09:00 to 22:00
                isOpen = currentTimeStr >= open && currentTimeStr < close;
              } else {
                // Overnight schedule: 18:00 to 02:00
                isOpen = currentTimeStr >= open || currentTimeStr < close;
              }
              
              if (isOpen) {
                statusText = `- Tutup pukul ${bData.closeTime}`;
              } else {
                statusText = `- Buka pukul ${bData.openTime}`;
              }
            } else {
              // Fallback
              isOpen = true; // Assume open if not set
              statusText = '- Jam belum diatur';
            }

            return (
              <div 
                key={branch.id} 
                className={`store-locator__item flex gap-4 cursor-pointer transition-opacity hover:opacity-80 ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedBranchId(branch.id)}
              >
                <div className={`store-locator__checkbox w-6 h-6 shrink-0 mt-1 rounded border-2 transition-colors flex items-center justify-center ${isActive ? 'bg-[#F5C518] border-[#F5C518]' : 'border-white bg-transparent'}`}>
                  {isActive && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                
                <div className="store-locator__item-info flex-grow flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="text-[18px] font-bold text-white leading-tight m-0">{branch.name}</h4>
                  </div>
                  <p className="text-base m-0">
                    {isOpen ? (
                      <span className="text-green-500 font-semibold">Buka</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Tutup</span>
                    )} 
                    <span className="text-gray-400"> {statusText}</span>
                  </p>
                  <p className="text-base text-gray-400 leading-snug m-0">{branch.address || 'Alamat belum diatur'}</p>
                  {bData.phone && (
                    <p className="text-base text-gray-400 flex items-center gap-2 m-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {bData.phone}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="store-locator__map-panel flex-grow flex flex-col gap-6">
        <div className="store-locator__map-wrapper w-full h-[480px] rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 relative">
          {mapUrl ? (
            <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0, position: 'absolute', top: 0, left: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Peta belum diatur untuk cabang ini.
            </div>
          )}
        </div>
        {selectedBranch ? (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBranch.name + " " + (selectedBranch.address || ""))}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#F5C518] text-black font-bold py-5 rounded-full text-xl hover:bg-yellow-400 transition-colors flex items-center justify-center shadow-lg">Pilih Cabang ini</a>
        ) : (
          <button className="w-full bg-gray-700 text-gray-500 font-bold py-5 rounded-full text-xl cursor-not-allowed flex items-center justify-center">Pilih Cabang ini</button>
        )}
      </div>
    </div>
  );
}




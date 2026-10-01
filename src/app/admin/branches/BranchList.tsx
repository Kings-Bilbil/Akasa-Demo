'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type BranchInfo = {
  mapUrl?: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
};

export default function BranchList({ branches, initialData }: { branches: any[], initialData: Record<string, any> }) {
  // Convert legacy string values to objects if needed
  const normalizedInitialData: Record<string, BranchInfo> = {};
  for (const [key, value] of Object.entries(initialData)) {
    if (typeof value === 'string') {
      normalizedInitialData[key] = { mapUrl: value };
    } else {
      normalizedInitialData[key] = value as BranchInfo;
    }
  }

  const [data, setData] = useState<Record<string, BranchInfo>>(normalizedInitialData);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleFieldChange = (branchId: string, field: keyof BranchInfo, value: string) => {
    setData(prev => ({ 
      ...prev, 
      [branchId]: { 
        ...(prev[branchId] || {}), 
        [field]: value 
      } 
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: existing } = await supabase.from('web_settings').select('*').eq('key', 'branch_maps').single();
    let error;
    if (existing) {
      const { error: updateError } = await supabase.from('web_settings').update({ value: JSON.stringify(data) }).eq('key', 'branch_maps');
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('web_settings').insert({ key: 'branch_maps', value: JSON.stringify(data) });
      error = insertError;
    }
      
    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      alert('Pengaturan cabang berhasil disimpan!');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white rounded px-6 py-2 font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(branch => {
          const branchInfo = data[branch.id] || {};
          
          return (
            <div key={branch.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{branch.name}</h3>
              <p className="text-gray-500 text-sm mb-4">Accurate ID: {branch.accurate_branch_id}</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">URL Google Maps Iframe (src)</label>
                  <input 
                    type="url" 
                    value={branchInfo.mapUrl || ''}
                    onChange={(e) => handleFieldChange(branch.id, 'mapUrl', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nomor HP/WA</label>
                  <input 
                    type="text" 
                    value={branchInfo.phone || ''}
                    onChange={(e) => handleFieldChange(branch.id, 'phone', e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Jam Buka</label>
                    <input 
                      type="time" 
                      value={branchInfo.openTime || ''}
                      onChange={(e) => handleFieldChange(branch.id, 'openTime', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Jam Tutup</label>
                    <input 
                      type="time" 
                      value={branchInfo.closeTime || ''}
                      onChange={(e) => handleFieldChange(branch.id, 'closeTime', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-4 h-40 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                {branchInfo.mapUrl ? (
                  <iframe src={branchInfo.mapUrl} width="100%" height="100%" style={{ border: 0 }}></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada peta</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

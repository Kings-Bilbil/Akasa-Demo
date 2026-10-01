'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BranchList({ branches, initialMaps }: { branches: any[], initialMaps: Record<string, string> }) {
  const [maps, setMaps] = useState<Record<string, string>>(initialMaps);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleMapChange = (branchId: string, url: string) => {
    setMaps(prev => ({ ...prev, [branchId]: url }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Periksa apakah web_settings branch_maps sudah ada
    const { data: existing } = await supabase.from('web_settings').select('*').eq('key', 'branch_maps').single();
    
    let error;
    if (existing) {
      const { error: updateError } = await supabase.from('web_settings').update({ value: JSON.stringify(maps) }).eq('key', 'branch_maps');
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('web_settings').insert({ key: 'branch_maps', value: JSON.stringify(maps) });
      error = insertError;
    }
      
    if (error) {
      alert('Gagal menyimpan: ' + error.message);
    } else {
      alert('Peta cabang berhasil disimpan!');
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
          {loading ? 'Menyimpan...' : 'Simpan Semua Peta'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(branch => {
          const mapUrl = maps[branch.id] || '';
          
          return (
            <div key={branch.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{branch.name}</h3>
              <p className="text-gray-500 text-sm mb-4">Accurate ID: {branch.accurate_branch_id}</p>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL Google Maps Iframe (src)</label>
                <input 
                  type="url" 
                  value={mapUrl}
                  onChange={(e) => handleMapChange(branch.id, e.target.value)}
                  placeholder="https://www.google.com/maps/embed?..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black mb-3"
                />
              </div>
              
              {/* Preview */}
              <div className="mt-2 h-40 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                {mapUrl ? (
                  <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }}></iframe>
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

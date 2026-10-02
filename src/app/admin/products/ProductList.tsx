'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Popup from '@/components/Popup';

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const supabase = createClient();

  const handleUpdateImages = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();
    setLoadingId(productId);
    
    const form = e.target as HTMLFormElement;
    const url1 = (form.elements.namedItem('url1') as HTMLInputElement).value;
    const url2 = (form.elements.namedItem('url2') as HTMLInputElement).value;
    
    // Store as comma separated if both exist, otherwise just url1
    const combinedUrl = [url1, url2].filter(Boolean).join(',');
    
    const { error } = await supabase
      .from('products_cache')
      .update({ image_url: combinedUrl || null })
      .eq('id', productId);
      
    if (error) {
      setPopupData({ message: "Gagal menyimpan: " + error.message, type: "error" });
    } else {
      setProducts(products.map(p => p.id === productId ? { ...p, image_url: combinedUrl } : p));
      setPopupData({ message: "Pengaturan gambar berhasil disimpan!", type: "success" });
    }
    setLoadingId(null);
  };

  return (
    <>
      {popupData && <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => {
        const images = product.image_url ? product.image_url.split(',') : [];
        const url1 = images[0] || '';
        const url2 = images[1] || '';
        
        return (
          <div key={product.id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
            <p className="text-gray-500 text-sm mb-4">SKU: {product.accurate_item_id}</p>
            
            <form onSubmit={(e) => handleUpdateImages(product.id, e)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL Gambar Utama</label>
                <input 
                  type="url" 
                  name="url1" 
                  defaultValue={url1}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL Gambar Thumbnail 2 (Opsional)</label>
                <input 
                  type="url" 
                  name="url2" 
                  defaultValue={url2}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-black"
                />
              </div>
              <button 
                type="submit" 
                disabled={loadingId === product.id}
                className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingId === product.id ? 'Menyimpan...' : 'Simpan Gambar'}
              </button>
            </form>
            
            {/* Preview */}
            <div className="mt-4 flex gap-2">
              {url1 && <img src={url1} alt="Preview 1" className="w-16 h-16 object-cover rounded bg-gray-100 border border-gray-200" />}
              {url2 && <img src={url2} alt="Preview 2" className="w-16 h-16 object-cover rounded bg-gray-100 border border-gray-200" />}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}


'use client';
import { useState } from 'react';
import Popup from '@/components/Popup';

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const translateError = (err: string) => {
    const errorString = String(err).toLowerCase();
    if (errorString.includes('fetch') || errorString.includes('network')) {
      return 'Gagal menghubungi server Accurate. Pastikan koneksi internet server stabil.';
    }
    if (errorString.includes('api') || errorString.includes('token') || errorString.includes('unauthorized')) {
      return 'Koneksi ditolak oleh Accurate. Token akses mungkin telah kedaluwarsa, silakan hubungi teknisi.';
    }
    if (errorString.includes('timeout')) {
      return 'Server Accurate terlalu lama merespons (Timeout). Silakan coba lagi nanti.';
    }
    return `Gagal melakukan sinkronisasi karena ada masalah teknis (${err}). Silakan coba lagi atau hubungi teknisi.`;
  };

  const handleSync = async () => {
    setLoading(true);
    setMessage('Menyinkronkan data dengan server Accurate...');
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const successMsg = `Sukses! Berhasil menarik ${data.syncedBranches} cabang & ${data.syncedProducts} produk dari Accurate.`;
        setMessage(successMsg);
        setPopupData({ message: successMsg, type: 'success' });
      } else {
        const failMsg = translateError(data.error);
        setMessage(failMsg);
        setPopupData({ message: failMsg, type: 'error' });
      }
    } catch (e: any) {
      const failMsg = translateError(e.message);
      setMessage(failMsg);
      setPopupData({ message: failMsg, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      {popupData && <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sinkronisasi Data Accurate</h1>
      
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tarik Data Master dari Accurate</h2>
        <div className="text-gray-600 mb-6">
          Gunakan fitur ini HANYA KETIKA:
          <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
            <li>Anda baru saja <strong>menambahkan produk baru</strong> di Accurate.</li>
            <li>Anda <strong>mengubah harga dasar</strong> produk di Accurate.</li>
            <li>Anda <strong>menambahkan gudang/cabang baru</strong> di Accurate.</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-700">
            <strong>Info:</strong> Anda TIDAK PERLU melakukan sync setiap hari hanya untuk meng-update stok (kuantitas) barang. Ketersediaan stok sudah di-update secara <em>live</em> setiap kali pelanggan membuka halaman produk!
          </p>
        </div>

        <button 
          onClick={handleSync}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Mulai Sinkronisasi Data'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-lg font-medium ${message.includes('Sukses') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

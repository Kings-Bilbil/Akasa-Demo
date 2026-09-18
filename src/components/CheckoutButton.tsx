'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Popup from '@/components/Popup';

export default function CheckoutButton({ product, branches, customerId }: { product: any, branches: any[], customerId: string }) {
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branches.find(b => b.stock === undefined || b.stock > 0)?.id || '');
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Muat script Midtrans Snap
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-xxxx'; // Harusnya dari env
    
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => { document.body.removeChild(script); }
  }, []);

  const handleCheckout = async () => {
    if (!selectedBranch) {
      setPopupData({ message: "Pilih cabang pengiriman terlebih dahulu!", type: 'error' });
      return;
    }
    setLoading(true);

    try {
      const orderId = uuidv4();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          total: product.price,
          // Menggunakan ID customer yang sedang login
          customerId: customerId, 
          branchId: selectedBranch,
          items: [{ id: product.id, quantity: 1, price: product.price }]
        })
      });
      
      const data = await res.json();
      if (data.token) {
        // Panggil popup Midtrans Snap
        (window as any).snap.pay(data.token, {
          onSuccess: async function (result: any) {
            // Karena kita di localhost, webhook tidak bisa ditembak oleh Midtrans.
            // Jadi kita picu penyelesaian pesanan langsung dari browser!
            await fetch('/api/checkout/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderId })
            });
            setPopupData({ message: "Pembayaran Berhasil! Mengalihkan...", type: 'success' });
            setTimeout(() => window.location.reload(), 2000);
          },
          onPending: function(result: any){
            setPopupData({ message: "Menunggu pembayaran Anda!", type: 'success' });
          },
          onError: function(result: any){
            setPopupData({ message: "Pembayaran gagal!", type: 'error' });
          },
          onClose: function(){
            setPopupData({ message: "Anda menutup jendela tanpa menyelesaikan pembayaran", type: 'error' });
          }
        });
      } else {
        setPopupData({ message: "Gagal membuat token: " + data.error, type: 'error' });
      }
    } catch (e: any) {
      setPopupData({ message: "Error: " + e.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 border-t pt-6">
      {popupData && <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />}
      <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Cabang Pengambilan:</label>
      <select 
        className="w-full mb-4 p-3 border rounded-lg text-gray-900 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
      >
        {branches.map(b => {
          const isOutOfStock = b.stock !== undefined && b.stock <= 0;
          return (
            <option key={b.id} value={b.id} disabled={isOutOfStock}>
              {b.name} {b.stock !== undefined ? `(Stok: ${b.stock})` : ''} {isOutOfStock ? '- KOSONG' : ''}
            </option>
          );
        })}
      </select>
      
      <button 
        onClick={handleCheckout} 
        disabled={loading || !selectedBranch}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Memproses...' : !selectedBranch ? 'Stok Habis' : 'Beli Sekarang (Checkout)'}
      </button>
    </div>
  );
}

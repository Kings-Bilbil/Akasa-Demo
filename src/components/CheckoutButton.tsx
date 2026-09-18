'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Popup from '@/components/Popup';

export default function CheckoutButton({ product, branches, customerId }: { product: any, branches: any[], customerId: string }) {
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branches.find(b => b.stock === undefined || b.stock > 0)?.id || '');
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [quantity, setQuantity] = useState(1);
  const selectedBranchObj = branches.find(b => b.id === selectedBranch);
  const maxStock = selectedBranchObj?.stock !== undefined ? selectedBranchObj.stock : 999;

  // Pastikan quantity tidak melebihi stok cabang yang dipilih
  useEffect(() => {
    if (quantity > maxStock && maxStock > 0) {
      setQuantity(maxStock);
    }
  }, [selectedBranch, maxStock, quantity]);

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
      setPopupData({ message: "Silakan pilih cabang pengambilan terlebih dahulu.", type: 'error' });
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
          total: product.price * quantity,
          customerId: customerId, 
          branchId: selectedBranch,
          items: [{ id: product.id, quantity: quantity, price: product.price }]
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        (window as any).snap.pay(data.token, {
          onSuccess: function() {
            setPopupData({ message: "Pembayaran berhasil! Sistem sedang memproses pesanan Anda ke Accurate...", type: 'success' });
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 3000);
          },
          onPending: function() {
            setPopupData({ message: "Menunggu pembayaran Anda.", type: 'success' });
          },
          onError: function() {
            setPopupData({ message: "Terjadi kesalahan saat memproses pembayaran.", type: 'error' });
          },
          onClose: function() {
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
      
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Beli:</label>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
          >-</button>
          <span className="text-lg font-bold w-12 text-center text-gray-900">{quantity}</span>
          <button 
            onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            disabled={quantity >= maxStock}
          >+</button>
        </div>
      </div>

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
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Total Belanja:</span>
        <span className="text-xl font-bold text-gray-900">Rp {(product.price * quantity).toLocaleString('id-ID')}</span>
      </div>

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

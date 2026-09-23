'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Popup from '@/components/Popup';

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutButton({ product, branches, customerId }: { product: any, branches: any[], customerId: string }) {
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(branches.find(b => b.stock === undefined || b.stock > 0)?.id || '');
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedBranchData = branches.find(b => b.id === selectedBranch);
  const maxStock = selectedBranchData?.stock !== undefined ? selectedBranchData.stock : 999;

  useEffect(() => {
    setQuantity(1);
  }, [selectedBranch]);

  const handleCheckout = async () => {
    if (!selectedBranch) {
      setPopupData({ message: 'Silakan pilih cabang terlebih dahulu.', type: 'error' });
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
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      
      window.snap.pay(data.token, {
        onSuccess: function(result: any) {
          setPopupData({ message: 'Pembayaran berhasil! Silakan ambil barang Anda di cabang yang dipilih.', type: 'success' });
        },
        onPending: function(result: any) {
          setPopupData({ message: 'Menunggu pembayaran Anda.', type: 'success' });
        },
        onError: function(result: any) {
          setPopupData({ message: 'Pembayaran gagal. Silakan coba lagi.', type: 'error' });
        },
        onClose: function() {
          setLoading(false);
        }
      });
    } catch (err: any) {
      setPopupData({ message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <>
      <div className="product-detail__stock">
        <label>Cek Stok per Cabang</label>
        <div className={`dropdown ${isDropdownOpen ? 'active' : ''}`} id="branch-dropdown">
          <div className="dropdown__header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span id="selected-branch">{selectedBranchData ? `${selectedBranchData.name} - ${selectedBranchData.stock !== undefined ? selectedBranchData.stock + ' unit' : 'Tersedia'}` : 'Pilih Cabang'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          {isDropdownOpen && (
            <div className="dropdown__list" style={{display: 'block'}}>
              {branches.map(b => {
                const isDisabled = b.stock !== undefined && b.stock <= 0;
                return (
                  <div 
                    key={b.id} 
                    className={`dropdown__item ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800'}`}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedBranch(b.id);
                        setIsDropdownOpen(false);
                      }
                    }}
                  >
                    {b.name} - {b.stock !== undefined ? b.stock + ' unit' : 'Tersedia'}
                    {isDisabled && <span className="ml-2 text-red-500 text-xs">(Habis)</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <div className="product-detail__add-to-cart-row mt-6">
        <div className="quantity-selector">
          <button 
            className="qty-btn qty-btn--minus" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >-</button>
          <span className="qty-value">{quantity}</span>
          <button 
            className="qty-btn qty-btn--plus"
            onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
            disabled={quantity >= maxStock}
          >+</button>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={loading || !selectedBranch || maxStock === 0}
          className="btn-primary btn-cart w-full flex justify-center items-center gap-2"
        >
          {loading ? 'Memproses...' : 'Pesan Sekarang'}
        </button>
      </div>

      <button className="btn-primary btn-summary mt-4 bg-gray-800 border-none" style={{backgroundColor: '#222', borderColor: '#222'}}>
        {quantity} Produk<br />Rp {(product.price * quantity).toLocaleString('id-ID')}
      </button>

      {popupData && (
        <Popup 
          message={popupData.message} 
          type={popupData.type} 
          onClose={() => setPopupData(null)} 
        />
      )}
    </>
  );
}

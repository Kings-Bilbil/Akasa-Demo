'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Popup from '@/components/Popup';

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
      
      (window as any).snap.pay(data.token, {
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
        <div className="dropdown " id="branch-dropdown">
          <div className="dropdown__header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span id="selected-branch">{selectedBranchData ? `${selectedBranchData.name}` : 'Pilih Cabang'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          {isDropdownOpen && (
            <div className="dropdown__list" style={{display: 'block'}}>
              {branches.map(b => {
                const isDisabled = b.stock !== undefined && b.stock <= 0;
                return (
                  <div 
                    key={b.id} 
                    className={"dropdown__item "}
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
      
      <div className="product-detail__add-to-cart-row mt-6 flex gap-4">
        <div className="quantity-selector flex items-center justify-between" style={{ backgroundColor: '#1A1C23', borderRadius: '100px', padding: '0 12px', width: '120px', height: '56px' }}>
          <button 
            className="qty-btn qty-btn--minus text-white text-xl font-bold" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{ width: '32px', height: '32px' }}
          >-</button>
          <span className="qty-value text-gold font-bold text-lg" style={{ color: 'var(--color-gold)' }}>{quantity}</span>
          <button 
            className="qty-btn qty-btn--plus text-white text-xl font-bold"
            onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
            disabled={quantity >= maxStock}
            style={{ width: '32px', height: '32px' }}
          >+</button>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={loading || !selectedBranch || maxStock === 0}
          className="btn-primary btn-cart flex-grow flex justify-center items-center gap-2"
          style={{ backgroundColor: 'var(--color-gold)', color: '#000', borderRadius: '100px', height: '56px', fontSize: '16px', fontWeight: 'bold', border: 'none' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          {loading ? 'Memproses...' : 'Add To Cart'}
        </button>
      </div>

      <button className="btn-primary btn-summary w-full mt-4 flex flex-col justify-center items-center" style={{backgroundColor: 'var(--color-gold)', color: '#000', borderRadius: '100px', height: '64px', border: 'none', fontWeight: '700', fontSize: '14px', lineHeight: '1.2'}}>
        <span>{quantity} Produk</span>
        <span>Rp {(product.price * quantity).toLocaleString('id-ID')}</span>
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

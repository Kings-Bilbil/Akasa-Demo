'use client';
import { useState } from 'react';
import Popup from '@/components/Popup';

type Product = {
  id: string;
  name: string;
  price: number;
}

type Branch = {
  id: string;
  name: string;
  stock?: number;
}

export default function CheckoutButton({ product, branches, canCheckout = true, checkoutMessage }: { product: Product, branches: Branch[], customerId?: string, customerEmail?: string, canCheckout?: boolean, checkoutMessage?: React.ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState(branches.find(b => b.stock === undefined || b.stock > 0)?.id || '');
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error', title?: string, actionUrl?: string, actionText?: string, actionIcon?: React.ReactNode} | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedBranchData = branches.find(b => b.id === selectedBranch);
  const maxStock = selectedBranchData?.stock !== undefined ? selectedBranchData.stock : 999;
  const isOutOfStock = maxStock === 0;
  const minusDisabled = quantity <= 1;
  const plusDisabled = quantity >= maxStock;

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    setQuantity(1);
    setIsDropdownOpen(false);
  };

  // Mode pajangan: Add To Cart hanya tampil UI + popup info, tidak checkout / snap.pay.
  // Kalau nanti mau keranjang beneran, ganti isi fungsi ini dengan logic cart (localStorage / API).
  const handleDisplayOnly = () => {
    if (!selectedBranch) {
      setPopupData({ message: 'Silakan pilih cabang terlebih dahulu.', type: 'error' });
      return;
    }
    setPopupData({
      message: 'Fitur keranjang masih pajangan. Nanti tombol ini hanya masuk ke keranjang, bukan langsung membeli.',
      type: 'success',
      title: 'Segera Hadir',
    });
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
                        handleSelectBranch(b.id);
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
      
      {canCheckout ? (
        <>
          <div className="product-detail__add-to-cart-row mt-6 flex gap-4">
            <div className="quantity-selector flex items-center justify-between" style={{ backgroundColor: "#1A1C23", borderRadius: "100px", padding: "0 12px", width: "120px", height: "56px", flexShrink: 0 }}>
              <button
                type="button"
                aria-label="Kurangi jumlah"
                className="qty-btn qty-btn--minus text-white text-xl font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={minusDisabled}
                style={{ width: "32px", height: "32px" }}
              >-</button>
              <span className="qty-value text-gold font-bold text-lg" style={{ color: "var(--color-gold)" }}>{quantity}</span>
              <button
                type="button"
                aria-label="Tambah jumlah"
                className="qty-btn qty-btn--plus text-white text-xl font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                disabled={plusDisabled}
                title={isOutOfStock ? "Stok habis" : `Maks ${maxStock}`}
                style={{ width: "32px", height: "32px" }}
              >+</button>
            </div>

            <button
              type="button"
              onClick={handleDisplayOnly}
              disabled={!selectedBranch}
              className="btn-primary btn-cart flex-grow flex justify-center items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-gold)", color: "#000", borderRadius: "100px", height: "56px", fontSize: "16px", fontWeight: "bold", border: "none" }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Add To Cart
            </button>
          </div>

          <button type="button" onClick={handleDisplayOnly} disabled={!selectedBranch} className="btn-primary btn-summary w-full mt-4 flex flex-col justify-center items-center cursor-pointer disabled:opacity-50" style={{backgroundColor: "var(--color-gold)", color: "#000", borderRadius: "100px", height: "64px", border: "none", fontWeight: "700", fontSize: "14px", lineHeight: "1.2"}}>
            <span>{quantity} Produk</span>
            <span>Rp {(product.price * quantity).toLocaleString("id-ID")}</span>
          </button>
          {isOutOfStock && (
            <p className="text-sm text-red-400 mt-2">Stok di cabang ini habis. Pilih cabang lain.</p>
          )}
        </>
      ) : (
        <div className="mt-8">{checkoutMessage}</div>
      )}

      {popupData && (
        <Popup 
          message={popupData.message} 
          type={popupData.type} 
          title={popupData.title}
          actionUrl={popupData.actionUrl}
          actionText={popupData.actionText}
          actionIcon={popupData.actionIcon}
          onClose={() => setPopupData(null)} 
        />
      )}
    </>
  );
}




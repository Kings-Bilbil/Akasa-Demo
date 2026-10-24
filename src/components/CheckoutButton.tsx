'use client';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  stockError?: boolean;
}

export default function CheckoutButton({ product, branches, customerId, customerEmail, canCheckout = true, checkoutMessage }: { product: Product, branches: Branch[], customerId?: string, customerEmail?: string, canCheckout?: boolean, checkoutMessage?: React.ReactNode }) {
  // Pilih cabang pertama yang memiliki stok > 0, atau fallback ke cabang pertama
  const initialBranch = branches.find(b => typeof b.stock === 'number' && b.stock > 0)?.id || branches[0]?.id || '';
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [popupData, setPopupData] = useState<{message: string, type: 'success' | 'error', title?: string, actionUrl?: string, actionText?: string, actionIcon?: React.ReactNode} | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedBranchData = branches.find(b => b.id === selectedBranch);
  
  // Poin 14 & 15 FIX: Jangan pernah fallback ke 999. Jika data kosong/tidak ada, maxStock adalah 0.
  const maxStock = (selectedBranchData && typeof selectedBranchData.stock === 'number') 
    ? Math.max(0, selectedBranchData.stock) 
    : 0;

  const hasAnyStock = branches.some(b => typeof b.stock === 'number' && b.stock > 0);
  const isOutOfStock = !selectedBranch || maxStock === 0;
  const isStockError = selectedBranchData?.stockError || false;

  // Tombol minus & plus terkunci jika loading atau stok habis
  const minusDisabled = quantity <= 1 || loading || isOutOfStock;
  const plusDisabled = quantity >= maxStock || loading || isOutOfStock || maxStock === 0;

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    setQuantity(1);
    setIsDropdownOpen(false);
  };

  // Keranjang memang belum aktif — tombol ini hanya info, tidak mengarahkan checkout.
  const handleCartInfo = () => {
    if (!selectedBranch) {
      setPopupData({ message: 'Silakan pilih cabang terlebih dahulu.', type: 'error' });
      return;
    }
    setPopupData({
      message: 'Fitur keranjang masih dalam pengembangan. Untuk memesan sekarang, gunakan tombol "Beli Sekarang" di bawah untuk langsung membayar.',
      type: 'success',
      title: 'Segera Hadir',
    });
  };

  // Tombol "pesan barang" yang sebenarnya: langsung checkout via Midtrans (bukan ke keranjang).
  const handleBuyNow = async () => {
    if (!selectedBranch) {
      setPopupData({ message: 'Silakan pilih cabang terlebih dahulu.', type: 'error' });
      return;
    }
    if (isStockError) {
      setPopupData({ message: 'Gagal memverifikasi stok live dari Accurate. Silakan muat ulang halaman.', type: 'error' });
      return;
    }
    if (isOutOfStock) {
      setPopupData({ message: 'Stok di cabang ini habis. Silakan pilih cabang lain.', type: 'error' });
      return;
    }
    if (!customerId) {
      setPopupData({ message: 'Anda harus login untuk melakukan pesanan.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const orderId = uuidv4();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          total: product.price * quantity,
          customerId,
          customerEmail,
          branchId: selectedBranch,
          items: [{ id: product.id, quantity, price: product.price }]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan checkout');

      const snap = (window as unknown as { snap?: { pay: (token: string, opts: Record<string, (result?: unknown) => void>) => void } }).snap;
      if (!snap) throw new Error('Pembayaran Midtrans belum siap. Muat ulang halaman lalu coba lagi.');

      snap.pay(data.token, {
        onSuccess: function() {
          // Localhost bypass: webhook Midtrans tidak bisa menjangkau localhost,
          // jadi panggil fulfillment manual agar invoice Accurate tetap dibuat.
          fetch('/api/checkout/success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          }).catch(() => { /* abaikan, webhook akan menangani di production */ });
          setLoading(false);
          setPopupData({
            message: 'Pembayaran berhasil! Silakan ambil barang Anda di cabang yang dipilih.',
            type: 'success',
            title: 'Pembayaran Berhasil!',
            actionUrl: `/invoice/${orderId}`,
            actionText: 'Lihat Bukti Pembayaran',
            actionIcon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          });
        },
        onPending: function() {
          setLoading(false);
          setPopupData({
            message: 'Menunggu pembayaran Anda. Anda dapat melihat kode pembayaran atau melanjutkan pembayaran kapan saja melalui menu Dashboard.',
            type: 'success',
            title: 'Menunggu Pembayaran',
            actionUrl: '/dashboard',
            actionText: 'Buka Riwayat Pesanan'
          });
        },
        onError: function() {
          setLoading(false);
          setPopupData({ message: 'Pembayaran gagal. Silakan coba lagi.', type: 'error' });
        },
        onClose: function() {
          setLoading(false);
          setPopupData({
            message: 'Jendela pembayaran ditutup sebelum selesai. Pesanan Anda tetap tersimpan di halaman Dashboard jika ingin melanjutkan pembayaran.',
            type: 'success',
            title: 'Pesanan Tersimpan',
            actionUrl: '/dashboard',
            actionText: 'Lanjutkan di Dashboard'
          });
        }
      });
    } catch (err: unknown) {
      setLoading(false);
      setPopupData({ message: err instanceof Error ? err.message : 'Terjadi kesalahan checkout', type: 'error' });
    }
  };

  return (
    <>
      <div className="product-detail__stock">
        <label>Cek Stok per Cabang</label>
        <div className="dropdown " id="branch-dropdown">
          <div className="dropdown__header" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span id="selected-branch">
              {selectedBranchData 
                ? `${selectedBranchData.name} (${selectedBranchData.stock !== undefined ? selectedBranchData.stock + ' unit' : 'Stok Kosong'})`
                : 'Pilih Cabang'}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          {isDropdownOpen && (
            <div className="dropdown__list" style={{display: 'block'}}>
              {branches.map(b => {
                const isItemOutOfStock = b.stock === undefined || b.stock <= 0;
                return (
                  <div 
                    key={b.id} 
                    className="dropdown__item"
                    onClick={() => {
                      handleSelectBranch(b.id);
                    }}
                  >
                    <span>{b.name} - {b.stock !== undefined ? b.stock + ' unit' : '0 unit'}</span>
                    {isItemOutOfStock && <span className="ml-2 text-red-500 text-xs font-semibold">(Habis)</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isStockError && (
        <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-sm">
          ⚠️ Koneksi ke Accurate sedang lambat / gagal memeriksa stok live. Silakan muat ulang halaman.
        </div>
      )}
      
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
              <span className="qty-value text-gold font-bold text-lg" style={{ color: "var(--color-gold)" }}>
                {isOutOfStock ? 0 : quantity}
              </span>
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
              onClick={handleCartInfo}
              disabled={!selectedBranch || isOutOfStock}
              className="btn-primary btn-cart flex-grow flex justify-center items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-gold)", color: "#000", borderRadius: "100px", height: "56px", fontSize: "16px", fontWeight: "bold", border: "none", opacity: isOutOfStock ? 0.4 : 0.85 }}
              title="Fitur keranjang segera hadir"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Add To Cart
            </button>
          </div>

          <button 
            type="button" 
            onClick={handleBuyNow} 
            disabled={loading || !selectedBranch || isOutOfStock || isStockError} 
            className="btn-primary btn-summary w-full mt-4 flex flex-col justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{backgroundColor: isOutOfStock ? "#333" : "var(--color-gold)", color: isOutOfStock ? "#888" : "#000", borderRadius: "100px", height: "64px", border: "none", fontWeight: "700", fontSize: "14px", lineHeight: "1.2"}}
          >
            {loading ? (
              <span>Memproses pembayaran...</span>
            ) : isOutOfStock ? (
              <span>{!hasAnyStock ? 'Stok Habis di Semua Cabang' : 'Stok Habis di Cabang Ini'}</span>
            ) : (
              <>
                <span>Beli Sekarang — {quantity} Produk</span>
                <span>Rp {(product.price * quantity).toLocaleString("id-ID")}</span>
              </>
            )}
          </button>
          {isOutOfStock && hasAnyStock && (
            <p className="text-sm text-red-400 mt-2 text-center">Stok di cabang pilihan habis. Silakan pilih cabang lain yang tersedia.</p>
          )}
          {!hasAnyStock && (
            <p className="text-sm text-red-400 mt-2 text-center">Barang ini sedang habis di seluruh cabang.</p>
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

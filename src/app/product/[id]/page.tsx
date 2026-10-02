import { createClient } from '@/utils/supabase/server';
import { fetchAccurateAPI } from '@/services/accurate';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import CheckoutButton from '@/components/CheckoutButton';
import TemplateHeader from '@/components/TemplateHeader';
import './detail.css';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();


  
  const { data: product, error } = await supabase
    .from('products_cache')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) return notFound();
  
  const images = product.image_url ? product.image_url.split(',') : [];
  const mainImage = images[0] || "/images/product-foom-tangy.png";
  const thumb2 = images[1] || "/images/product-foom-tangy-2.png";

  let stockDetails: any[] = [];
  let accurateError = null;

  try {
    const accurateResponse = await fetchAccurateAPI('/item/detail.do?no=' + product.accurate_item_id);
    stockDetails = accurateResponse.d?.detailWarehouseData || [];
  } catch (err: any) {
    accurateError = "Gagal mengambil stok live dari Accurate.";
  }
  
  const { data: dbBranches } = await supabase.from('branches_cache').select('id, name');
  
  const checkoutBranches = dbBranches?.map(dbBranch => {
    let stock = undefined;
    if (!accurateError) {
      const cleanName = (name: string) => name.toLowerCase().replace('gudang', '').replace('cabang', '').trim();
      const targetName = cleanName(dbBranch.name);
      const stockItem = stockDetails.find((s: any) => cleanName(s.name) === targetName);
      stock = stockItem ? stockItem.balance : 0;
    }
    return { ...dbBranch, stock };
  }) || [];

  return (
    <>
      <TemplateHeader />
      <main className="product-detail pt-24 min-h-screen">
        <div className="mb-6">
          <Link href="/produk" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span className="font-medium">Kembali ke Produk</span>
          </Link>
        </div>
        <div className="product-detail__inner">
          {/* Left Column: Images */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img src={mainImage} alt={product.name} />
            </div>
            <div className="product-detail__thumbnails">
              <button className="gallery-nav gallery-nav--prev" aria-label="Previous image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="thumbnail active">
                <img src={mainImage} alt="Thumbnail 1" />
              </div>
              <div className="thumbnail">
                <img src={thumb2} alt="Thumbnail 2" />
              </div>
              <button className="gallery-nav gallery-nav--next" aria-label="Next image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="product-detail__info">
            <div className="product-detail__header-row">
              <h1 className="product-detail__title">{product.name}</h1>
              <div className="product-detail__actions">
                <button className="btn-action btn-action--like flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg" aria-label="Like" style={{ backgroundColor: '#2a1215', color: '#ff4d4f' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span className="like-count font-bold text-sm">109</span>
                </button>
                <button className="btn-action btn-action--save flex items-center justify-center w-10 h-10 rounded-lg" aria-label="Save" style={{ backgroundColor: '#1A1C23' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>
            </div>
            
            <p className="product-detail__subtitle">Liquid - 60 ml - Nikotin 3%</p>
            
            <div className="product-detail__pricing flex flex-col gap-1 mb-4">
              <span className="price-current text-gold font-bold" style={{ color: 'var(--color-gold)', fontSize: '36px' }}>Rp {product.price.toLocaleString('id-ID')}</span>
              <span className="price-old text-gray-500 line-through" style={{ fontSize: '20px' }}>Rp {(product.price + 10000).toLocaleString('id-ID')}</span>
            </div>
            
            <hr className="product-detail__divider" />
            
            
            <CheckoutButton 
              product={product} 
              branches={checkoutBranches} 
              customerId={user?.id}
              canCheckout={!!user && user.email !== "admin@azuraya.com"}
              checkoutMessage={
                user && user.email === "admin@azuraya.com" ? (
                  <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: "#1A1C23", border: "1px solid rgba(245, 197, 24, 0.2)" }}>
                    <h3 className="font-bold mb-2" style={{ color: "var(--color-gold)" }}>Mode Admin Aktif</h3>
                    <p className="text-gray-400 text-sm">Sebagai admin, Anda dapat mengecek stok produk, tetapi tidak dapat melakukan pesanan.</p>
                  </div>
                ) : (
                  <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: "#1A1C23", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-gray-400 mb-6 text-sm">Anda harus login untuk melakukan pesanan.</p>
                    <Link href="/login" className="w-full flex justify-center items-center font-bold transition-opacity hover:opacity-90 mt-4" style={{ backgroundColor: "var(--color-gold)", color: "#000", borderRadius: "100px", height: "56px", fontSize: "16px" }}>
                      Login Sekarang
                    </Link>
                    <p className="mt-6 text-sm text-gray-500">
                      Belum punya akun? <Link href="/register" className="text-white font-semibold hover:opacity-80 underline underline-offset-4">Daftar di sini</Link>
                    </p>
                  </div>
                )
              }
            />
            
            <div className="product-detail__delivery-info mt-8">
              <div className="delivery-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <div className="delivery-text">
                <h4>Ambil di Toko</h4>
                <p>Produk diambil langsung di cabang pilihan, tidak ada pengiriman</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

















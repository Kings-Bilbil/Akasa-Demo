import { createClient } from '@/utils/supabase/server';
import { fetchAccurateAPI } from '@/services/accurate';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import CheckoutButton from '@/components/CheckoutButton';
import TemplateHeader from '@/components/TemplateHeader';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email === 'admin@azuraya.com') {
    redirect('/admin');
  }
  
  const { data: product, error } = await supabase
    .from('products_cache')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) return notFound();

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
        <div className="flex justify-between items-center px-6 py-4 bg-black border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Detail <span className="text-yellow-500">Produk</span></h1>
          <Link href="/produk" className="text-white hover:text-yellow-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>

        <div className="product-detail__inner">
          {/* Left Column: Images */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img src={product.image_url || "/images/product-foom-tangy.png"} alt={product.name} />
            </div>
            <div className="product-detail__thumbnails">
              <button className="gallery-nav gallery-nav--prev" aria-label="Previous image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="thumbnail active">
                <img src={product.image_url || "/images/product-foom-tangy.png"} alt="Thumbnail 1" />
              </div>
              <div className="thumbnail">
                <img src="/images/product-foom-tangy-2.png" alt="Thumbnail 2" />
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
                <button className="btn-action btn-action--like" aria-label="Like">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span className="like-count">109</span>
                </button>
                <button className="btn-action btn-action--save" aria-label="Save">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>
            </div>
            
            <p className="product-detail__subtitle">Liquid - 60 ml - Nikotin 3%</p>
            
            <div className="product-detail__pricing">
              <span className="price-current">Rp {product.price.toLocaleString('id-ID')}</span>
              <span className="price-old">Rp {(product.price + 10000).toLocaleString('id-ID')}</span>
            </div>
            
            <hr className="product-detail__divider" />
            
            {user ? (
               <CheckoutButton product={product} branches={checkoutBranches} customerId={user.id} />
            ) : (
               <div className="mt-8 pt-6 text-center">
                 <p className="mb-4 text-gray-400">Anda harus login untuk melakukan pesanan.</p>
                 <Link href="/login" className="btn-primary w-full text-center hover:bg-yellow-600 transition" style={{display: 'block'}}>Login Sekarang</Link>
                 <Link href="/register" className="text-yellow-500 text-sm block mt-3 hover:underline">Belum punya akun? Daftar</Link>
               </div>
            )}
            
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

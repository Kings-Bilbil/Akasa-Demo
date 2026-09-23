'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import TemplateHeader from '@/components/TemplateHeader';

export default function ProdukPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('products_cache').select('*').then((res) => {
      if (res.data) setProducts(res.data);
    });
    supabase.from('branches_cache').select('*').then((res) => {
      if (res.data) setBranches(res.data);
    });
  }, []);

  return (
    <>
      <TemplateHeader />
      <main className="products-page min-h-screen flex flex-col" style={{ paddingTop: '80px' }}>
        <div className="products-page__header flex justify-between items-center px-6 py-4 bg-black border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Semua <span className="text-yellow-500">Produk Azuraya</span></h1>
          <Link href="/#produk" className="text-white hover:text-yellow-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
        </div>
        
        <div className="products-page__content px-6 py-8">
          <div className="products-page__grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link href={"/product/"} key={product.id} className="product-card">
                <div className="product-card__image">
                  {/* Handle image from accurate if exists */}
                  <img src={product.image_url || "/images/product-1.png"} alt={product.name} />
                  <div className="product-card__gradient"></div>
                </div>
                <div className="product-card__content">
                  <h3 className="product-card__title">{product.name}</h3>
                  <p className="product-card__desc">Rp {product.price.toLocaleString('id-ID')}<br />Tersedia di {branches.length} cabang</p>
                  <div className="product-card__action">
                    <span>Lihat Detail</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.5 13.5L11 9L6.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}


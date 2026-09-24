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
      <main>
        <section className="products-page">
          {/*  Background Glows  */}
          <div className="flash-separator" style={{ marginTop: '100px' }}>
            <div className="flash-light flash-light--left"></div>
            <div className="flash-light flash-light--right"></div>
          </div>

          <div className="products-page__inner">
            {/*  Top Stroke  */}
            <div className="products-page__top-stroke"></div>
            
            <div className="products-page__header">
              <h1 className="products-page__title">Jelajahi Produk Azuraya</h1>
              <div className="products-page__search-container">
                <input type="text" className="products-page__search-input" placeholder="Cari Produk" />
                <div className="products-page__search-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#ABB7C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="#ABB7C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="products-page__categories">
              <button className="category-btn category-btn--active">Semua</button>
              <button className="category-btn">Liquid</button>
              <button className="category-btn">Device</button>
              <button className="category-btn">Pod System</button>
              <button className="category-btn">Disposable</button>
              <button className="category-btn">Aksesoris</button>
              <button className="category-btn">Sparepart</button>
            </div>

            <div className="products-page__grid">
              {products.map(product => (
                <Link href={"/product/" + product.id} key={product.id} className="product-card">
                  <div className="product-card__image">
                    <img src={product.image_url || "/images/product-1.png"} alt={product.name} />
                    <div className="product-card__gradient"></div>
                  </div>
                  <div className="product-card__content">
                    <h3 className="product-card__title">{product.name}</h3>
                    <p className="product-card__desc">
                      Liquid &middot; 60 ml<br />
                      Rp {product.price.toLocaleString('id-ID')}<br />
                      Tersedia di {branches.length} cabang
                    </p>
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
        </section>
      </main>
    </>
  );
}

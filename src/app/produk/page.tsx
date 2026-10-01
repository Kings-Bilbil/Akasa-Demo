'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import TemplateHeader from '@/components/TemplateHeader';
import './produk.css';

export default function ProdukPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    const supabase = createClient();
    supabase.from('products_cache').select('*').then((res) => {
      if (res.data) setProducts(res.data);
    });
    supabase.from('branches_cache').select('*').then((res) => {
      if (res.data) setBranches(res.data);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

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
            
            <div className="products-page__header" style={{ textAlign: 'center' }}>
              <h1 className="products-page__title">Jelajahi <span style={{ color: 'var(--color-gold)' }}>Produk Azuraya</span></h1>
              <div className="products-page__search-container" style={{ margin: '0 auto' }}>
                <input 
                  type="text" 
                  className="products-page__search-input" 
                  placeholder="Cari Produk" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="products-page__search-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16.65 16.65" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="products-page__categories" style={{ justifyContent: 'center' }}>
              {categories.map((cat: any) => (
                <button 
                  key={cat} 
                  className={`category-btn ${activeCategory === cat ? 'category-btn--active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="products-page__grid">
              {filteredProducts.map(product => {
                const images = product.image_url ? product.image_url.split(',') : [];
                const firstImage = images.length > 0 ? images[0] : "/images/product-1.png";
                
                return (
                  <Link href={"/product/" + product.id} key={product.id} className="product-card">
                    <div className="product-card__image">
                      <img src={firstImage} alt={product.name} />
                      <div className="product-card__gradient"></div>
                    </div>
                    <div className="product-card__content">
                      <h3 className="product-card__title">{product.name}</h3>
                      <p className="product-card__desc">
                        {product.category || 'Uncategorized'}<br />
                        Rp {product.price.toLocaleString('id-ID')}<br />
                        Tersedia di {branches.length} cabang
                      </p>
                      <div className="product-card__action">
                        <span style={{ fontSize: '14px' }}>Lihat Detail</span>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '1.2rem' }}>
                Tidak ada produk yang cocok.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

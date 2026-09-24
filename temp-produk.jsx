
    <section className="products-page">
      {/*  Background Glows  */}
      <div className="flash-separator" >
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
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#ABB7C2" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="#ABB7C2" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round"/>
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
          {/*  Card 1  */}
          <a href="detail-produk.html" className="product-card">
            <div className="product-card__image">
              <img src="/images/product-1.png" alt="FOOM Milk Lychee" />
              <div className="product-card__gradient"></div>
            </div>
            <div className="product-card__content">
              <h3 className="product-card__title">FOOM Milk Lychee</h3>
              <p className="product-card__desc">Liquid &middot; 60 ml<br />Rp 150.000<br />Tersedia di 21 cabang</p>
              <div className="product-card__action">
                <span>Lihat Detail</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 13.5L11 9L6.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </a>

          {/*  Card 2  */}
          <a href="detail-produk.html" className="product-card">
            <div className="product-card__image">
              <img src="/images/product-2.png" alt="FOOM Icy Watermelon" />
              <div className="product-card__gradient"></div>
            </div>
            <div className="product-card__content">
              <h3 className="product-card__title">FOOM Icy Watermelon</h3>
              <p className="product-card__desc">Liquid &middot; 60 ml<br />Rp 150.000<br />Tersedia di 21 cabang</p>
              <div className="product-card__action">
                <span>Lihat Detail</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 13.5L11 9L6.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </a>

          {/*  Card 3  */}
          <a href="detail-produk.html" className="product-card">
            <div className="product-card__image">
              <img src="/images/product-3.png" alt="FOOM Icy Blackcurrant" />
              <div className="product-card__gradient"></div>
            </div>
            <div className="product-card__content">
              <h3 className="product-card__title">FOOM Icy Blackcurrant</h3>
              <p className="product-card__desc">Liquid &middot; 60 ml<br />Rp 150.000<br />Tersedia di 21 cabang</p>
              <div className="product-card__action">
                <span>Lihat Detail</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 13.5L11 9L6.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  
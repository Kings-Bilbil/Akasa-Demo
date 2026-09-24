
    <div className="product-detail__inner">
      {/*  Left Column: Images  */}
      <div className="product-detail__gallery">
        <div className="product-detail__main-image">
          {/*  We can use a placeholder image or an actual product image if available  */}
          <img src="/images/product-foom-tangy.png" alt="FOOM Tangy Milk Lychee" onerror="this.src='images/produk-1.png'" />
        </div>
        <div className="product-detail__thumbnails">
          <button className="gallery-nav gallery-nav--prev" aria-label="Previous image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="thumbnail active">
            <img src="/images/product-foom-tangy.png" alt="Thumbnail 1" onerror="this.src='images/produk-1.png'" />
          </div>
          <div className="thumbnail">
            <img src="/images/product-foom-tangy-2.png" alt="Thumbnail 2" onerror="this.src='images/produk-2.png'" />
          </div>
          <button className="gallery-nav gallery-nav--next" aria-label="Next image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      {/*  Right Column: Info  */}
      <div className="product-detail__info">
        <div className="product-detail__header-row">
          <h1 className="product-detail__title">FOOM Tangy Milk Lychee</h1>
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
          <span className="price-current">Rp 150.000</span>
          <span className="price-old">Rp 159.000</span>
        </div>
        
        <hr className="product-detail__divider">
        
        <div className="product-detail__stock">
          <label>Cek Stok per Cabang</label>
          <div className="dropdown" id="branch-dropdown">
            <div className="dropdown__header">
              <span id="selected-branch">Pilih Cabang</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div className="dropdown__list">
              <div className="dropdown__item">Azuraya Tanjung Raya — 35 unit</div>
              <div className="dropdown__item">Azuraya Serdam — 46 unit</div>
              <div className="dropdown__item">Azuraya Untan — 20 unit</div>
              <div className="dropdown__item">Azuraya Ampera — 27 unit</div>
            </div>
          </div>
        </div>
        
        <div className="product-detail__add-to-cart-row">
          <div className="quantity-selector">
            <button className="qty-btn qty-btn--minus">-</button>
            <span className="qty-value">1</span>
            <button className="qty-btn qty-btn--plus">+</button>
          </div>
          <button className="btn-primary btn-cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Add To Cart
          </button>
        </div>
        
        <button className="btn-primary btn-summary">
          1 Produk<br />Rp 150.000
        </button>
        
        <div className="product-detail__delivery-info">
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
  
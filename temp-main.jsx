
    {/*  ============================================
         HERO SECTION
         ============================================  */}
    <section id="beranda" className="hero">
      {/*  Flash light decoration  */}
      <div className="hero__flash-container">
        <div className="flash-light flash-light--left"></div>
        <div className="flash-light flash-light--right"></div>
      </div>

      <div className="hero__content">
        <div className="hero__top">
          <h1 className="hero__heading">
            Vape Original dengan <span className="hero__heading--gold">Harga</span><br />
            <span className="hero__heading--gold">Terbaik</span>
          </h1>

          <p className="hero__paragraph">
            Toko vape terpercaya dengan produk berkualitas, program loyalitas, dan komunitas yang terus berkembang di seluruh Kalimantan Barat.
          </p>

          <a href="#" className="hero__cta">Pesan Sekarang</a>
        </div>

        {/*  Phone mockups  */}
        <div className="hero__phones">
          <div className="hero__phone hero__phone--left">
            <img src="images/mobile-ui-2.png" alt="Azuraya mobile app interface showing vape products" />
            <div className="hero__phone-gradient"></div>
          </div>
          <div className="hero__phone hero__phone--right">
            <img src="images/301_5672-removebg-preview.png" alt="Azuraya mobile app product detail screen" />
            <div className="hero__phone-gradient"></div>
          </div>
        </div></div>
      </div>
    </section>

    {/*  ============================================
         TENTANG KAMI (ABOUT) SECTION
         ============================================  */}
    <section id="tentang" className="about">
      <div className="about__header">
        <h2 className="about__title">
          Kenali Lebih Dekat Perjalanan <strong>Azuraya Grup</strong>
        </h2>
      </div>

      <div className="about__cards">
        {/*  Card 1: Awal Berdiri  */}
        <article className="about__card">
          <div className="about__card-circle about__card-circle--bg"></div>
          <div className="about__card-circle about__card-circle--img">
            <img src="images/awal-berdiri.png" alt="Awal berdiri Azuraya tahun 2016" />
          </div>
          <span className="about__card-title">Awal Berdiri</span>
          <span className="about__card-year">2016</span>
        </article>

        {/*  Card 2: Ekspansi Cabang  */}
        <article className="about__card">
          <div className="about__card-circle about__card-circle--bg"></div>
          <div className="about__card-circle about__card-circle--img">
            <img src="images/ekspansi-cabang.png" alt="Ekspansi cabang Azuraya tahun 2019" />
          </div>
          <span className="about__card-title">Ekspansi Cabang</span>
          <span className="about__card-year">2019</span>
        </article>

        {/*  Card 3: Kemitraan IQOS  */}
        <article className="about__card">
          <div className="about__card-circle about__card-circle--bg"></div>
          <div className="about__card-circle about__card-circle--img">
            <img src="images/kemitraan-iqos.png" alt="Kemitraan IQOS Azuraya tahun 2025" />
          </div>
          <span className="about__card-title">Kemitraan IQOS</span>
          <span className="about__card-year">2025</span>
        </article>

        {/*  Card 4: Menuju 1 Dekade  */}
        <article className="about__card">
          <div className="about__card-circle about__card-circle--bg"></div>
          <div className="about__card-circle about__card-circle--img">
            <img src="images/menuju-dekade.png" alt="Menuju 1 Dekade Azuraya tahun 2026" />
          </div>
          <span className="about__card-title">Menuju 1 Dekade</span>
          <span className="about__card-year">2026</span>
        </article>
      </div>

      <p className="about__description">
        Berdiri sejak 2016, Azuraya Grup kini menjadi jaringan ritel vape terbesar dan terpercaya di Kalimantan Barat, dengan lebih dari 23 cabang tersebar di seluruh wilayah.
      </p>
    </section>

    {/*  ============================================
         PRODUCTS SECTION
         ============================================  */}
    <section id="produk" className="products">
      {/*  Flash Light Separator  */}
      <div className="flash-separator">
        <div className="flash-light flash-light--left"></div>
        <div className="flash-light flash-light--right"></div>
      </div>
      <div className="products__inner">
        <div className="products__left">
          <h2 className="products__title">
            Jelajahi <span className="products__title--gold">Produk Azuraya</span>
          </h2>
          <a href="produk.html" className="btn-primary">
            Lihat Semua Produk &amp; Ketersediaan
          </a>
        </div>
        <div className="products__image">
          <img src="images/produk-gift-cards.png" alt="Produk vape Azuraya - berbagai pilihan perangkat dan aksesoris" />
        </div></div>
      </div>
    </section>

    {/*  ============================================
         BRANCH / MAP SECTION
         ============================================  */}
    <section id="cabang" className="branch">
      {/*  Flash Light Separator  */}
      <div className="flash-separator">
        <div className="flash-light flash-light--left"></div>
        <div className="flash-light flash-light--right"></div>
      </div>
      <div className="branch__inner">
        <div className="branch__map">
          <img src="images/google-maps.png" alt="Peta lokasi cabang Azuraya di Kalimantan Barat" />
        </div>
        <div className="branch__info" >
          <div className="branch__title-wrapper" >
            <h2 className="branch__title" >
              <span>Temukan</span>
              <span>Cabang</span>
            </h2>
            <h2 className="branch__title branch__title--gold">
              Azuraya Terdekat
            </h2>
          </div>
          <a href="cabang.html" className="btn-primary" >
            Lihat Informasi Cabang
          </a>
        </div>
      </div>
    </section>

        {/*  ============================================
         TESTIMONIALS SECTION
         ============================================  */}
    <section id="testimoni" className="testimonials">
      {/*  Flash Light Separator  */}
      <div className="flash-separator">
        <div className="flash-light flash-light--left"></div>
        <div className="flash-light flash-light--right"></div>
      </div>
      <div className="testimonials__heading-wrapper">
        <span className="testimonials__badge">Dipercaya Ribuan Pelanggan di 23 Cabang Kalimantan Barat</span>
        <h2 className="testimonials__title">Apa Kata Pelanggan Azuraya</h2>
        <p className="testimonials__subtitle">Cerita Langsung dari Pelanggan Setia Azuraya</p>
      </div>

      <div className="testimonials__container">
        {/*  Row 1  */}
        <div className="testimonials__carousel"><div className="testimonials__row">
          {/*  First Set  */}
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"pelayanan ramah, pkokny bagus lah tidak mengecewak..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-1.png" alt="Phillip W." />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Phillip W., Operations Yuezie</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Udah ke-2 kalinya belanja online di sini, rekomen..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-2.png" alt="Agus" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Agus</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Pelayanan ramah.. rekomended tempat belanja kebut..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-3.png" alt="Destu Rizky R" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Destu Rizky R</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Pelayanannya baik, vaporistanya ramah"</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-4.png" alt="Faiq" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Faiq</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          {/*  Duplicate Set for Animation  */}
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"pelayanan ramah, pkokny bagus lah tidak mengecewak..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-1.png" alt="Phillip W." />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Phillip W., Operations Yuezie</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Udah ke-2 kalinya belanja online di sini, rekomen..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-2.png" alt="Agus" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Agus</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Pelayanan ramah.. rekomended tempat belanja kebut..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-3.png" alt="Destu Rizky R" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Destu Rizky R</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Pelayanannya baik, vaporistanya ramah"</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-4.png" alt="Faiq" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Faiq</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div></div>
        {/*  Row 2  */}
        <div className="testimonials__carousel testimonials__carousel--reverse"><div className="testimonials__row">
          {/*  First Set  */}
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Emang mantab dah di azuraya nih, pelayanan bagos, ..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-5.png" alt="Black one project" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Black one project</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Rekomend buat nyari liquid sama yg lain, pelayan ..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-6.png" alt="Arjuna Yogi" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Arjuna Yogi</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Pelayanan yg ramah membuat customer senang Sukses..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-7.png" alt="Rizky Pratama" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Rizky Pratama</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          {/*  Duplicate Set for Animation  */}
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Emang mantab dah di azuraya nih, pelayanan bagos, ..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-5.png" alt="Black one project" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Black one project</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Rekomend buat nyari liquid sama yg lain, pelayan ..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-6.png" alt="Arjuna Yogi" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Arjuna Yogi</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-card__quote">"Pelayanan yg ramah membuat customer senang Sukses..."</p>
            <div className="testimonial-card__footer">
              <img className="testimonial-card__avatar" src="images/testi-7.png" alt="Rizky Pratama" />
              <div className="testimonial-card__info">
                <h4 className="testimonial-card__name">Rizky Pratama</h4>
                <div className="testimonial-card__stars">
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    {/*  ============================================
         FAQ SECTION
         ============================================  */}
    <section id="faq" className="faq">
      {/*  Flash Light Separator  */}
      <div className="flash-separator">
        <div className="flash-light flash-light--left"></div>
        <div className="flash-light flash-light--right"></div>
      </div>
      <div className="faq__heading-wrapper">
        <span className="faq__badge">Ada Pertanyaan? Kami Punya Jawaban</span>
        <h2 className="faq__title">Pertanyaan yang Sering Ditanyakan</h2>
        <p className="faq__subtitle">Temukan jawaban cepat untuk pertanyaan seputar produk dan layanan Azuraya</p>
      </div>

      <div className="faq__list">
        <div className="faq__item">
          <span className="faq__question">Apakah produk di Azuraya original dan bersertifikat cukai?</span>
          <div className="faq__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#F5C518"/>
              <line x1="12" y1="20" x2="28" y2="20" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="20" y2="28" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="faq__item">
          <span className="faq__question">Bagaimana cara mengetahui cabang Azuraya terdekat?</span>
          <div className="faq__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#F5C518"/>
              <line x1="12" y1="20" x2="28" y2="20" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="20" y2="28" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="faq__item">
          <span className="faq__question">Apakah ada batasan usia untuk membeli produk vape di Azuraya?</span>
          <div className="faq__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#F5C518"/>
              <line x1="12" y1="20" x2="28" y2="20" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="20" y2="28" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="faq__item">
          <span className="faq__question">Bagaimana cara bergabung dengan program loyalitas/member Azuraya?</span>
          <div className="faq__icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#F5C518"/>
              <line x1="12" y1="20" x2="28" y2="20" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20" y1="12" x2="20" y2="28" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  
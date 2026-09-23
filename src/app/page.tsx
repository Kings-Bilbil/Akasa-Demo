import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import TemplateHeader from '@/components/TemplateHeader';

export default async function Home() {
  const supabase = await createClient();
  const { data: gmapsData } = await supabase.from('settings').select('value').eq('key', 'gmaps_iframe_url').single();
  const gmapsUrl = gmapsData?.value || "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1020084.7176140683!2d109.19199321307527!3d0.32924157053039146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1716382023912!5m2!1sen!2sid";

  return (
    <>
      <TemplateHeader />
      <main>
        {/* HERO SECTION */}
        <section id="beranda" className="hero" style={{ paddingTop: '100px' }}>
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
              <Link href="/produk" className="hero__cta">Pesan Sekarang</Link>
            </div>
            <div className="hero__phones">
              <div className="hero__phone hero__phone--left">
                <img src="/images/mobile-ui-2.png" alt="Azuraya mobile app" />
                <div className="hero__phone-gradient"></div>
              </div>
              <div className="hero__phone hero__phone--right">
                <img src="/images/301_5672-removebg-preview.png" alt="Azuraya product detail" />
                <div className="hero__phone-gradient"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ABOUT SECTION */}
        <section id="tentang" className="about">
          <div className="about__header">
            <h2 className="about__title">Kenali Lebih Dekat Perjalanan <strong>Azuraya Grup</strong></h2>
          </div>
          <div className="about__cards">
            <article className="about__card">
              <div className="about__card-circle about__card-circle--bg"></div>
              <div className="about__card-circle about__card-circle--img">
                <img src="/images/awal-berdiri.png" alt="Awal berdiri Azuraya tahun 2016" />
              </div>
              <div className="about__card-content">
                <span className="about__card-year">2016</span>
                <h3 className="about__card-title">Awal Berdiri</h3>
                <p className="about__card-desc">Azuraya Grup memulai perjalanan sebagai salah satu pelopor toko vape di Kalimantan Barat, dengan komitmen menyediakan produk berkualitas dan edukasi bagi perokok dewasa yang ingin beralih.</p>
              </div>
            </article>
            <article className="about__card">
              <div className="about__card-circle about__card-circle--bg"></div>
              <div className="about__card-circle about__card-circle--img">
                <img src="/images/ekspansi-cabang.png" alt="Ekspansi cabang Azuraya" />
              </div>
              <div className="about__card-content">
                <span className="about__card-year">2018 - 2021</span>
                <h3 className="about__card-title">Ekspansi Cabang</h3>
                <p className="about__card-desc">Merespon tingginya antusiasme komunitas, kami mulai berekspansi secara agresif, membuka cabang di berbagai titik strategis di Pontianak dan kota-kota sekitarnya.</p>
              </div>
            </article>
            <article className="about__card">
              <div className="about__card-circle about__card-circle--bg"></div>
              <div className="about__card-circle about__card-circle--img">
                <img src="/images/market-leader.png" alt="Azuraya sebagai market leader" />
              </div>
              <div className="about__card-content">
                <span className="about__card-year">2024 - Sekarang</span>
                <h3 className="about__card-title">Market Leader</h3>
                <p className="about__card-desc">Kini Azuraya Grup telah berkembang menjadi 23 cabang yang tersebar di seluruh Kalimantan Barat, mengukuhkan posisi sebagai pemimpin pasar retail vape terbesar di wilayah ini.</p>
              </div>
            </article>
          </div>
        </section>
        
        {/* PRODUCTS SECTION */}
        <section id="produk" className="products">
          <div className="flash-separator">
            <div className="flash-light flash-light--left"></div>
            <div className="flash-light flash-light--right"></div>
          </div>
          <div className="products__inner">
            <div className="products__content">
              <h2 className="products__title">
                Temukan Liquid Favorit &amp;<br />
                Jelajahi <span className="products__title--gold">Produk Azuraya</span>
              </h2>
              <Link href="/produk" className="btn-primary">Lihat Semua Produk &amp; Ketersediaan</Link>
            </div>
            <div className="products__image">
              <img src="/images/produk-gift-cards.png" alt="Produk vape Azuraya" />
            </div>
          </div>
        </section>
        
        {/* BRANCH SECTION */}
        <section id="cabang" className="branch">
          <div className="flash-separator">
            <div className="flash-light flash-light--left"></div>
            <div className="flash-light flash-light--right"></div>
          </div>
          <div className="branch__inner">
            <div className="branch__map" style={{position: 'relative', overflow: 'hidden'}}>
              <iframe 
                src={gmapsUrl} 
                className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="branch__info" style={{flex: 1}}>
              <div className="branch__title-wrapper" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <h2 className="branch__title" style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>Temukan</span>
                  <span>Cabang</span>
                </h2>
                <h2 className="branch__title branch__title--gold">Azuraya Terdekat</h2>
              </div>
              <Link href="/cabang" className="btn-primary" style={{alignSelf: 'flex-end'}}>Lihat Informasi Cabang</Link>
            </div>
          </div>
        </section>
        
        {/* FOOTER */}
        <footer className="footer">
          <div className="footer__inner">
            <div className="footer__brand">
              <h3 className="footer__brand-title">Azuraya</h3>
              <p className="footer__brand-text">Toko vape terbesar dan terpercaya di Kalimantan Barat dengan 23 cabang yang siap melayani kebutuhan vaping Anda.</p>
            </div>
          </div>
          <div className="footer__bottom">
            <p>&copy; 2024 Azuraya Grup. Hak Cipta Dilindungi.</p>
          </div>
        </footer>
      </main>
    </>
  );
}

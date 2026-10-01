import Link from 'next/link';
import TemplateHeader from '@/components/TemplateHeader';
import './cabang.css';

import { createClient } from '@/utils/supabase/server';

export default async function CabangPage() {
  const supabase = await createClient();
  const { data: gmapsData } = await supabase.from('web_settings').select('value').eq('key', 'gmaps_iframe_url').single();
  const gmapsUrl = gmapsData?.value || "https://www.google.com/maps/d/embed?mid=1aBcdE_...&ehbc=2E312F";
  return (
    <>
      <TemplateHeader />
      <main className="store-locator-page bg-black text-white min-h-screen pt-[140px] px-8 md:px-16">
        
    <div className="store-locator__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '24px', margin: 0 }}>Cari <span style={{ color: '#F5C518' }}>Cabang Azuraya</span></h2>
      <Link href="/#cabang" className="store-locator__close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Link>
    </div>
    
    <div className="store-locator__content">
      {/*  Left Panel  */}
      <div className="store-locator__sidebar">
        <div className="store-locator__list">
          {/*  Item 1  */}
          <div className="store-locator__item">
            
            <div className="store-locator__item-info">
              <div className="store-locator__item-header">
                <h4>Azuraya Vapor Store Tanjung Raya</h4>
                <span className="store-locator__distance">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  4.5 km
                </span>
              </div>
              <p className="store-locator__status"><span className="text-green">Buka</span> - Tutup pukul 00.00</p>
              <p className="store-locator__address">Jl. Tanjung Raya 2 No C54, Samping Komp. Cendana Permai, Saigon, Pontianak Timur, Kalimantan Barat 78232</p>
              <p className="store-locator__phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                0823-5783-4284
              </p>
            </div>
          </div>
          
          {/*  Item 2  */}
          <div className="store-locator__item">
            
            <div className="store-locator__item-info">
              <div className="store-locator__item-header">
                <h4>Azuraya Vapor Store Serdam</h4>
                <span className="store-locator__distance">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  10 km
                </span>
              </div>
              <p className="store-locator__status"><span className="text-green">Buka</span> - Tutup pukul 00.00</p>
              <p className="store-locator__address">Jl. Sungai Raya Dalam, Samping Jl. Komp. Permata Agung No.26, Bangka Belitung Darat, Pontianak Tenggara, Kalimantan Barat</p>
              <p className="store-locator__phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                0851-7166-8654
              </p>
            </div>
          </div>
          
          {/*  Item 3  */}
          <div className="store-locator__item">
            
            <div className="store-locator__item-info">
              <div className="store-locator__item-header">
                <h4>Azuraya Vapor Store Untan</h4>
                <span className="store-locator__distance">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  15 km
                </span>
              </div>
              <p className="store-locator__status"><span className="text-red">Tutup</span> - Tutup pukul 23.00</p>
              <p className="store-locator__address">Jl. Daya Nasional, Bansir Laut, Pontianak Tenggara, Kalimantan Barat 78124</p>
              <p className="store-locator__phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                0851-7687-6975
              </p>
            </div>
          </div>
          
          {/*  Item 4  */}
          <div className="store-locator__item">
            
            <div className="store-locator__item-info">
              <div className="store-locator__item-header">
                <h4>Azuraya Vapor Store Ampera</h4>
                <span className="store-locator__distance">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  35 km
                </span>
              </div>
              <p className="store-locator__status"><span className="text-red">Tutup</span> - Tutup pukul 23.00</p>
              <p className="store-locator__address">Jl. Ampera Gg. Permai 3 No. 1 Samping, Sungai Bangkong, Pontianak Kota, Kalimantan Barat 78116</p>
              <p className="store-locator__phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                0851-7683-1731
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/*  Right Panel  */}
      <div className="store-locator__map-panel">
        <div className="store-locator__map-wrapper" style={{ overflow: 'hidden', position: 'relative', width: '100%', height: '480px', borderRadius: '12px' }}>
          <div style={{ position: 'absolute', top: '-65px', height: 'calc(100% + 65px)', width: '100%' }}>
            <iframe src={gmapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
        <button className="btn-primary store-locator__btn">Pilih Cabang ini</button>
      </div>
    </div>
  
      </main>
    </>
  );
}




'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function TemplateHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase.from('customers').select('full_name').eq('id', data.user.id).single().then((res) => {
          setUser({ ...data.user, fullName: res.data?.full_name || 'User' });
        });
      }
    });
  }, []);

  return (
    <header className="header">
      <div className="header__inner">
        <nav className="header__nav" role="navigation" aria-label="Main navigation">
          <Link href="/#beranda" className="header__nav-link">Beranda</Link>
          <Link href="/#tentang" className="header__nav-link">Tentang Kami</Link>
          <Link href="/#produk" className="header__nav-link">Produk</Link>
          <Link href="/#cabang" className="header__nav-link">Cabang</Link>
          <Link href="/#faq" className="header__nav-link">FAQ</Link>
        </nav>
  
        <div className="header__logo">
          <Link href="/">
            <img src="/images/logo.png" alt="Azuraya Grup Logo" />
          </Link>
        </div>
  
        <div className="header__actions flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/login" className="header__btn header__btn--login">Login</Link>
              <Link href="/register" className="header__btn header__btn--daftar">Daftar</Link>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <button className="relative w-12 h-12 bg-[#F6F4F0] rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              
              <button className="relative w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span className="absolute top-0 right-0 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></span>
              </button>

              <Link href="/dashboard" className="flex items-center gap-3">
                <img src="/images/user-profile.jpg" alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=" + user.fullName; }} />
                <span className="text-yellow-500 font-bold text-xl font-secondary">{user.fullName.split(' ')[0]}</span>
              </Link>
            </div>
          )}
        </div>
  
        <button 
          className="header__hamburger" 
          aria-label="Toggle navigation menu" 
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
  
        <div className={"header__mobile-menu "} role="navigation" aria-label="Mobile navigation">
          <Link href="/#beranda" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Beranda</Link>
          <Link href="/#tentang" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Tentang Kami</Link>
          <Link href="/#produk" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Produk</Link>
          <Link href="/#cabang" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>Cabang</Link>
          <Link href="/#faq" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
          
          <div className="header__mobile-actions mt-4 flex flex-col gap-2">
            {!user ? (
              <>
                <Link href="/login" className="header__btn header__btn--login w-full text-center">Login</Link>
                <Link href="/register" className="header__btn header__btn--daftar w-full text-center">Daftar</Link>
              </>
            ) : (
              <Link href="/dashboard" className="header__btn header__btn--daftar w-full text-center">Dashboard</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


import type { Metadata } from "next";
import { Afacad, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const afacad = Afacad({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-secondary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Azuraya Grup",
  description: "Vape Original dengan Harga Terbaik",
};

// Script blocking yang menempelkan class `dark` di <html> SEBELUM browser
// menggambar pertama kali (anti kedip putih di /admin & /dashboard).
// Harus di root layout (server component): inline <script> mentah di dalam
// component client tidak dieksekusi React (error "Encountered a script tag").
// Dibatasi ke rute admin/dashboard agar halaman publik tidak terpengaruh
// class `dark` global (mengubah var --background di body).
const ADMIN_THEME_INIT_SCRIPT = `(function(){try{var p=window.location.pathname;var isAdmin=p==='/admin'||p.indexOf('/admin/')===0||p==='/dashboard'||p.indexOf('/dashboard/')===0;if(!isAdmin)return;var s=null;try{s=localStorage.getItem('azuraya-admin-theme')}catch(_){}if(s!=='light'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${afacad.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="azuraya-admin-theme-init" strategy="beforeInteractive">
          {ADMIN_THEME_INIT_SCRIPT}
        </Script>
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}

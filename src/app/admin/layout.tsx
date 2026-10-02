import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== "admin@azuraya.com") {
    // Return a clean 403 Access Denied page without the admin sidebar
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4">
        <div className="bg-[#18181b] p-10 rounded-2xl border border-red-900/50 shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Akses Ditolak</h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Halaman ini berada dalam zona terlarang (Admin Only).<br/>
            Anda tidak memiliki izin untuk mengakses area ini.
          </p>
          <a href="/" className="inline-block w-full py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-yellow-400 transition-colors">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded hover:bg-gray-700">Daftar Pesanan</a>
          <a href="/admin/products" className="block px-4 py-2 rounded hover:bg-gray-700">Pengaturan Produk</a>
          <a href="/admin/branches" className="block px-4 py-2 rounded hover:bg-gray-700">Pengaturan Peta Cabang</a>
          <a href="/admin/sync" className="block px-4 py-2 rounded hover:bg-gray-700">Sync Data Accurate</a>
          <a href="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-700">Pengaturan Web</a>
          <div className="pt-8 mt-8 border-t border-gray-800">
            <a href="/" className="block px-4 py-2 rounded hover:bg-gray-700 text-gray-400 mb-2">&larr; Kembali ke Web</a>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="w-full text-left block px-4 py-2 rounded bg-red-900/50 text-red-300 hover:bg-red-800 hover:text-white transition">
                &times; Logout
              </button>
            </form>
          </div>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}


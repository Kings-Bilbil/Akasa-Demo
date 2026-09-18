export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin" className="block px-4 py-2 rounded hover:bg-gray-700">Daftar Pesanan</a>
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

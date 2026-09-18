import Link from 'next/link';

export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-gray-500 hover:text-gray-800 font-medium transition">&larr; Kembali ke Beranda</Link>
      </div>
      <form action="/api/auth/register" method="POST" className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar</h1>
        <p className="text-gray-500 mb-6">Buat akun pelanggan baru</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error === 'true' ? 'Gagal mendaftar. Silakan coba lagi.' : error}
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input name="name" type="text" required className="w-full mb-4 p-3 border border-gray-300 text-gray-900 rounded-lg outline-none" />
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input name="email" type="email" required className="w-full mb-4 p-3 border border-gray-300 text-gray-900 rounded-lg outline-none" />
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input name="password" type="password" required className="w-full mb-8 p-3 border border-gray-300 text-gray-900 rounded-lg outline-none" />
        
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
          Daftar Sekarang
        </button>
      </form>
    </div>
  );
}

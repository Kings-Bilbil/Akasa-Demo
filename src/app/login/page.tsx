import Link from 'next/link';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 relative">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-gray-500 hover:text-gray-800 font-medium transition">&larr; Kembali ke Beranda</Link>
      </div>
      <form action="/api/auth/login" method="POST" className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
        <p className="text-gray-500 mb-6">Masuk ke akun Azuraya Anda</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error === 'true' ? 'Email atau Password salah.' : error}
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input name="email" type="email" required className="w-full mb-4 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input name="password" type="password" required className="w-full mb-8 p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
        
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
          Login Sekarang
        </button>
      </form>
    </div>
  );
}

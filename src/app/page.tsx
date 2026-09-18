import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import MidtransSuccessHandler from '@/components/MidtransSuccessHandler';

export default async function Home({ searchParams }: { searchParams: Promise<{ transaction_status?: string, order_id?: string }> }) {
  const { transaction_status, order_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email === 'admin@azuraya.com') {
    redirect('/admin');
  }
  
  // Ambil data produk dari Supabase cache
  const { data: products, error } = await supabase
    .from('products_cache')
    .select('*')
    .order('name');

  // Ambil URL Google Maps dari pengaturan
  const { data: gmapsData } = await supabase
    .from('web_settings')
    .select('value')
    .eq('key', 'gmaps_iframe_url')
    .single();
  const gmapsUrl = gmapsData?.value || "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1020084.7176140683!2d109.19199321307527!3d0.32924157053039146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1716382023912!5m2!1sen!2sid";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Blok penangkap Redirect Midtrans */}
        {(transaction_status === 'settlement' || transaction_status === 'capture' || transaction_status === 'success') && order_id && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 shadow-sm">
            <h3 className="font-bold text-lg mb-2">🎉 Pembayaran Berhasil!</h3>
            <p>Memproses pesanan Anda ke Accurate Online...</p>
            
            {/* Auto-trigger API sukses di client side */}
            <MidtransSuccessHandler orderId={order_id} />
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Azuraya Vape Store</h1>
            <p className="text-gray-600 mt-2">Katalog Produk Resmi terintegrasi dengan Accurate</p>
          </div>
          <div className="flex gap-4">
            {user ? (
              <>
                {user.email !== 'admin@azuraya.com' && (
                  <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                    Dashboard Saya
                  </Link>
                )}
                {user.email === 'admin@azuraya.com' && (
                  <Link href="/admin" className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium transition">
                    Admin Panel
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-200">
            Gagal memuat produk: {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {/* Placeholder Image */}
                <span className="text-gray-400 text-5xl">💨</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-bold mt-3 text-xl">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <Link href={`/product/${product.id}`} className="w-full mt-4 block text-center bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition">
                  Lihat Detail & Stok
                </Link>
              </div>
            </div>
          ))}
          
          {(!products || products.length === 0) && !error && (
            <div className="col-span-full text-center py-20 text-gray-500">
              <p className="text-xl">Belum ada produk.</p>
              <p className="mt-2">Silakan klik tombol "Sync Data Accurate" di atas.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="max-w-6xl mx-auto mt-20 pt-10 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lokasi Cabang Kami</h2>
        <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden shadow-inner relative">
          <iframe 
            src={gmapsUrl} 
            className="absolute left-0 w-full"
            style={{ top: '-70px', height: 'calc(100% + 70px)', border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Seluruh Cabang Azuraya"
          ></iframe>
        </div>
        <p className="text-center text-gray-500 mt-8 pb-8 text-sm">
          &copy; {new Date().getFullYear()} Azuraya B2B. Terintegrasi dengan Accurate Online.
        </p>
      </footer>
    </main>
  );
}

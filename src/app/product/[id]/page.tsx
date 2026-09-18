import { createClient } from '@/utils/supabase/server';
import { fetchAccurateAPI } from '@/services/accurate';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import CheckoutButton from '@/components/CheckoutButton';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Cek user yang sedang login
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email === 'admin@azuraya.com') {
    redirect('/admin');
  }
  
  const { data: product, error } = await supabase
    .from('products_cache')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) return notFound();

  let stockDetails: any[] = [];
  let accurateError = null;

  try {
    const accurateResponse = await fetchAccurateAPI(`/item/detail.do?no=${product.accurate_item_id}`);
    stockDetails = accurateResponse.d?.detailWarehouseData || [];
  } catch (err: any) {
    accurateError = "Gagal mengambil stok live dari Accurate. Sistem sedang sibuk.";
  }
  
  // 3. Ambil data cabang dari Supabase untuk daftar dropdown
  const { data: dbBranches } = await supabase.from('branches_cache').select('id, name');
  
  // Siapkan cabang untuk tombol checkout beserta informasi stok live-nya
  const checkoutBranches = dbBranches?.map(dbBranch => {
    let stock = undefined;
    if (!accurateError) {
      // Cari stok berdasarkan nama gudang yang sinkron dengan nama cabang
      const stockItem = stockDetails.find((s: any) => s.name === dbBranch.name);
      stock = stockItem ? stockItem.balance : 0;
    }
    return {
      ...dbBranch,
      stock
    };
  }) || [];

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Kembali ke Katalog
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-200 min-h-[300px] flex items-center justify-center">
             <span className="text-gray-400 text-8xl">💨</span>
          </div>
          
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-blue-600 mb-8">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Ketersediaan Stok Live
              </h2>
              
              {accurateError ? (
                <p className="text-red-500 text-sm">{accurateError}</p>
              ) : stockDetails.length > 0 ? (
                <ul className="space-y-3">
                  {stockDetails.map((stock: any, index: number) => (
                    <li key={index} className="flex justify-between items-center bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <span className="font-medium text-gray-700">
                        {stock.name || 'Gudang Pusat'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${stock.balance > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stock.balance} Pcs
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">Stok kosong di semua cabang.</p>
              )}
            </div>

            {user ? (
               user.email === 'admin@azuraya.com' ? (
                 <div className="mt-8 border-t pt-6 text-center">
                   <p className="mb-4 text-red-600 font-bold bg-red-50 p-4 rounded-lg">Admin tidak dapat melakukan pembelian.</p>
                 </div>
               ) : (
                 <CheckoutButton product={product} branches={checkoutBranches} customerId={user.id} />
               )
            ) : (
               <div className="mt-8 border-t pt-6 text-center">
                 <p className="mb-4 text-gray-600">Anda harus login untuk melakukan pesanan.</p>
                 <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg block w-full text-center hover:bg-blue-700 transition">Login Sekarang</Link>
                 <Link href="/register" className="text-blue-600 text-sm block mt-3 hover:underline">Belum punya akun? Daftar</Link>
               </div>
            )}
            
          </div>
        </div>
      </div>
    </main>
  );
}

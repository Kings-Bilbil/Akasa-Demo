import Link from 'next/link';

export default function Popup({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  if (!message) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111317] border border-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          {type === 'success' ? (
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-5 border border-yellow-500/20">
              <svg className="w-10 h-10 text-[#F5C518]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-5 border border-red-500/20">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h3 className={`text-2xl font-bold mb-3 ${type === 'success' ? 'text-[#F5C518]' : 'text-red-500'}`}>
            {type === 'success' ? 'Pembayaran Berhasil!' : 'Gagal'}
          </h3>
          
          <p className="text-gray-300 mb-8 text-base leading-relaxed">{message}</p>
          
          <div className="w-full flex flex-col gap-3">
            {type === 'success' && (
              <Link 
                href="/dashboard"
                className="w-full bg-[#F5C518] hover:bg-yellow-400 text-black font-bold py-4 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Unduh Bukti Pembayaran
              </Link>
            )}
            <button 
              onClick={onClose}
              className={`w-full font-bold py-4 px-6 rounded-full transition-colors ${type === 'success' ? 'bg-transparent text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

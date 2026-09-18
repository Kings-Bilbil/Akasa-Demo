export default function Popup({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {type === 'success' ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          )}
          <h3 className={`text-xl font-bold mb-2 ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {type === 'success' ? 'Berhasil!' : 'Peringatan'}
          </h3>
          <p className="text-gray-600 mb-8">{message}</p>
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

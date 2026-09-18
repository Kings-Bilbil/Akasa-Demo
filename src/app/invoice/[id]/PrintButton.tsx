'use client';
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg font-bold print:hidden hover:bg-black">
      Cetak PDF (Print)
    </button>
  )
}

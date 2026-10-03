'use client';
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      type="button"
      className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold text-black print:hidden"
      style={{ backgroundColor: "var(--color-gold, #F5C518)" }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Cetak PDF (Print)
    </button>
  )
}

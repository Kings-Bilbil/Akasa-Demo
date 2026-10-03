export const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value || 0)

/** Format ringkas untuk angka besar, mis. Rp 1,2 jt */
export const formatRupiahCompact = (value: number) => {
  const abs = Math.abs(value || 0)

  if (abs >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (abs >= 1_000) return `Rp ${(value / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`

  return formatRupiah(value)
}

export const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

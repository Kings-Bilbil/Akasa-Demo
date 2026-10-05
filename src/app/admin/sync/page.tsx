'use client'

import { useState } from 'react'

import { InfoIcon, RefreshCwIcon } from 'lucide-react'

import PageHeader from '@/components/layout/PageHeader'
import Popup from '@/components/Popup'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [popupData, setPopupData] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const translateError = (err: string) => {
    const errorString = String(err).toLowerCase()
    if (errorString.includes('fetch') || errorString.includes('network')) {
      return 'Gagal menghubungi server Accurate. Pastikan koneksi internet server stabil.'
    }
    if (errorString.includes('api') || errorString.includes('token') || errorString.includes('unauthorized')) {
      return 'Koneksi ditolak oleh Accurate. Token akses mungkin telah kedaluwarsa, silakan hubungi teknisi.'
    }
    if (errorString.includes('timeout')) {
      return 'Server Accurate terlalu lama merespons (Timeout). Silakan coba lagi nanti.'
    }
    return `Gagal melakukan sinkronisasi karena ada masalah teknis (${err}). Silakan coba lagi atau hubungi teknisi.`
  }

  const handleSync = async () => {
    setLoading(true)
    setMessage('Menyinkronkan data dengan server Accurate...')
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const successMsg = data.message || 'Berhasil menarik data dari Accurate.'
        setMessage(successMsg)
        setPopupData({ message: successMsg, type: 'success' })
      } else {
        const failMsg = translateError(data.error)
        setMessage(failMsg)
        setPopupData({ message: failMsg, type: 'error' })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const failMsg = translateError(msg)
      setMessage(failMsg)
      setPopupData({ message: failMsg, type: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className='max-w-2xl'>
      {popupData && <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />}

      <PageHeader
        title='Sinkronisasi Data Accurate'
        description='Tarik data master produk dan cabang dari Accurate Online.'
      />

      <Card>
        <CardHeader>
          <CardTitle>Tarik Data Master dari Accurate</CardTitle>
          <CardDescription>Gunakan fitur ini HANYA KETIKA:</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <ul className='text-muted-foreground ml-5 list-disc space-y-1 text-sm'>
            <li>
              Anda baru saja <strong className='text-foreground'>menambahkan produk baru</strong> di Accurate.
            </li>
            <li>
              Anda <strong className='text-foreground'>mengubah harga dasar</strong> produk di Accurate.
            </li>
            <li>
              Anda <strong className='text-foreground'>menambahkan gudang/cabang baru</strong> di Accurate.
            </li>
            <li>
              Anda <strong className='text-foreground'>menghapus produk/cabang</strong> di Accurate (data yang
              sudah tidak ada di Accurate akan ikut dihapus dari website).
            </li>
          </ul>

          <Alert>
            <InfoIcon />
            <div className='col-start-2 text-sm'>
              <strong>Info:</strong> Anda TIDAK PERLU melakukan sync setiap hari hanya untuk meng-update stok (kuantitas)
              barang. Ketersediaan stok sudah di-update secara <em>live</em> setiap kali pelanggan membuka halaman produk!
            </div>
          </Alert>

          <Button onClick={handleSync} disabled={loading}>
            <RefreshCwIcon className={loading ? 'animate-spin' : ''} />
            {loading ? 'Memproses...' : 'Mulai Sinkronisasi Data'}
          </Button>

          {message && (
            <div
              className={`rounded-md border p-4 text-sm font-medium ${
                message.includes('Sukses') ? 'border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400' : 'bg-muted'
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

import { ImageIcon, SaveIcon, UploadIcon, XIcon } from 'lucide-react'

import Popup from '@/components/Popup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { createClient } from '@/utils/supabase/client'

type Product = {
  id: string
  name: string
  accurate_item_id: string
  image_url?: string | null
}

const BUCKET = 'product-images'
const MAX_FILE_MB = 5

function getExt(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg'
}

export default function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [popupData, setPopupData] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  return (
    <>
      {popupData && <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />}

      {products.length === 0 && (
        <Card>
          <CardContent className='text-muted-foreground py-10 text-center'>
            Belum ada produk. Jalankan Sync Data Accurate terlebih dahulu.
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {products.map(product => (
          <ProductImageCard
            key={product.id}
            product={product}
            onSaved={imageUrl => {
              setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, image_url: imageUrl } : p)))
            }}
            notify={setPopupData}
          />
        ))}
      </div>
    </>
  )
}

function ProductImageCard({
  product,
  onSaved,
  notify
}: {
  product: Product
  onSaved: (imageUrl: string) => void
  notify: (d: { message: string; type: 'success' | 'error' }) => void
}) {
  const supabase = createClient()

  const existing = product.image_url ? product.image_url.split(',') : []
  const existingMain = existing[0] || ''
  const existingThumb = existing[1] || ''

  const [mainFile, setMainFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState(existingMain)
  const [thumbPreview, setThumbPreview] = useState(existingThumb)
  const [saving, setSaving] = useState(false)

  const mainInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const pickFile = (slot: 'main' | 'thumb', file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      notify({ message: 'File harus berupa gambar (JPG/PNG/WebP).', type: 'error' })
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      notify({ message: `Ukuran gambar maksimal ${MAX_FILE_MB}MB.`, type: 'error' })
      return
    }
    const objectUrl = URL.createObjectURL(file)
    if (slot === 'main') {
      if (mainPreview.startsWith('blob:')) URL.revokeObjectURL(mainPreview)
      setMainFile(file)
      setMainPreview(objectUrl)
    } else {
      if (thumbPreview.startsWith('blob:')) URL.revokeObjectURL(thumbPreview)
      setThumbFile(file)
      setThumbPreview(objectUrl)
    }
  }

  const clearSlot = (slot: 'main' | 'thumb') => {
    if (slot === 'main') {
      if (mainPreview.startsWith('blob:')) URL.revokeObjectURL(mainPreview)
      setMainFile(null)
      setMainPreview('')
      if (mainInputRef.current) mainInputRef.current.value = ''
    } else {
      if (thumbPreview.startsWith('blob:')) URL.revokeObjectURL(thumbPreview)
      setThumbFile(null)
      setThumbPreview('')
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  const uploadOne = async (file: File, slot: string) => {
    const path = `${product.id}/${slot}-${Date.now()}.${getExt(file.name)}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type
    })
    if (error) {
      // Pesan ramah kalau bucket belum dibuat
      if (error.message.toLowerCase().includes('bucket') || error.message.toLowerCase().includes('not found')) {
        throw new Error(`Bucket "${BUCKET}" belum ada di Supabase Storage. Jalankan SQL pembuatan bucket di supabase.sql lalu coba lagi.`)
      }
      throw error
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let url1 = existingMain
      let url2 = existingThumb

      // Kalau user menekan Hapus (preview kosong & tidak ada file baru), kosongkan slot
      if (!mainFile && mainPreview === '') url1 = ''
      if (!thumbFile && thumbPreview === '') url2 = ''

      if (mainFile) url1 = await uploadOne(mainFile, 'utama')
      if (thumbFile) url2 = await uploadOne(thumbFile, 'thumb2')

      if (!url1 && !url2) {
        // Boleh kosong = hapus semua gambar
      }

      const combinedUrl = [url1, url2].filter(Boolean).join(',')

      const { error } = await supabase
        .from('products_cache')
        .update({ image_url: combinedUrl || null })
        .eq('id', product.id)

      if (error) throw error

      onSaved(combinedUrl)
      setMainFile(null)
      setThumbFile(null)
      notify({ message: 'Gambar produk berhasil disimpan!', type: 'success' })
    } catch (err: unknown) {
      notify({ message: 'Gagal menyimpan: ' + (err instanceof Error ? err.message : String(err)), type: 'error' })
    }
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{product.name}</CardTitle>
        <CardDescription>SKU: {product.accurate_item_id}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form onSubmit={handleSave} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={`file1-${product.id}`}>Gambar Utama (dari file)</Label>
            <Input
              ref={mainInputRef}
              id={`file1-${product.id}`}
              type='file'
              accept='image/*'
              onChange={e => pickFile('main', e.target.files?.[0])}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor={`file2-${product.id}`}>Gambar Thumbnail 2 (Opsional, dari file)</Label>
            <Input
              ref={thumbInputRef}
              id={`file2-${product.id}`}
              type='file'
              accept='image/*'
              onChange={e => pickFile('thumb', e.target.files?.[0])}
            />
          </div>
          <Button type='submit' disabled={saving} className='w-full'>
            {saving ? <UploadIcon className='animate-pulse' /> : <SaveIcon />}
            {saving ? 'Mengunggah...' : 'Simpan Gambar'}
          </Button>
        </form>

        {/* Preview */}
        <div className='flex gap-2'>
          {[
            { url: mainPreview, slot: 'main' as const, label: 'Utama' },
            { url: thumbPreview, slot: 'thumb' as const, label: 'Thumb 2' }
          ].map((item, index) =>
            item.url ? (
              <div key={index} className='relative'>
                <Image
                  src={item.url}
                  alt={`Preview ${item.label}`}
                  width={64}
                  height={64}
                  unoptimized
                  className='bg-muted size-16 rounded-md border object-cover'
                />
                <button
                  type='button'
                  onClick={() => clearSlot(item.slot)}
                  title={`Hapus gambar ${item.label}`}
                  className='absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-500'
                >
                  <XIcon className='size-3' />
                </button>
              </div>
            ) : (
              <div
                key={index}
                className='bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-md border border-dashed'
                title={`Belum ada gambar ${item.label}`}
              >
                <ImageIcon className='size-5' />
              </div>
            )
          )}
        </div>
        <p className='text-muted-foreground text-xs'>Pilih file gambar (JPG/PNG/WebP, maks {MAX_FILE_MB}MB), lalu klik Simpan Gambar. Gambar lama otomatis diganti.</p>
      </CardContent>
    </Card>
  )
}

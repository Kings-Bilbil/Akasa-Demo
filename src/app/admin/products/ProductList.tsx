'use client'

import { useState } from 'react'

import { ImageIcon, SaveIcon } from 'lucide-react'

import Popup from '@/components/Popup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { createClient } from '@/utils/supabase/client'

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [popupData, setPopupData] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  const handleUpdateImages = async (productId: string, e: React.FormEvent) => {
    e.preventDefault()
    setLoadingId(productId)

    const form = e.target as HTMLFormElement
    const url1 = (form.elements.namedItem('url1') as HTMLInputElement).value
    const url2 = (form.elements.namedItem('url2') as HTMLInputElement).value

    // Disimpan dipisah koma jika ada dua gambar, jika tidak hanya url1
    const combinedUrl = [url1, url2].filter(Boolean).join(',')

    const { error } = await supabase
      .from('products_cache')
      .update({ image_url: combinedUrl || null })
      .eq('id', productId)

    if (error) {
      setPopupData({ message: 'Gagal menyimpan: ' + error.message, type: 'error' })
    } else {
      setProducts(products.map(p => (p.id === productId ? { ...p, image_url: combinedUrl } : p)))
      setPopupData({ message: 'Pengaturan gambar berhasil disimpan!', type: 'success' })
    }
    setLoadingId(null)
  }

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
        {products.map(product => {
          const images = product.image_url ? product.image_url.split(',') : []
          const url1 = images[0] || ''
          const url2 = images[1] || ''

          return (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className='text-base'>{product.name}</CardTitle>
                <CardDescription>SKU: {product.accurate_item_id}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <form onSubmit={e => handleUpdateImages(product.id, e)} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor={`url1-${product.id}`}>URL Gambar Utama</Label>
                    <Input id={`url1-${product.id}`} type='url' name='url1' defaultValue={url1} placeholder='https://...' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor={`url2-${product.id}`}>URL Gambar Thumbnail 2 (Opsional)</Label>
                    <Input id={`url2-${product.id}`} type='url' name='url2' defaultValue={url2} placeholder='https://...' />
                  </div>
                  <Button type='submit' disabled={loadingId === product.id} className='w-full'>
                    <SaveIcon />
                    {loadingId === product.id ? 'Menyimpan...' : 'Simpan Gambar'}
                  </Button>
                </form>

                {/* Preview */}
                <div className='flex gap-2'>
                  {[url1, url2].map((url, index) =>
                    url ? (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className='bg-muted size-16 rounded-md border object-cover'
                      />
                    ) : (
                      <div
                        key={index}
                        className='bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-md border border-dashed'
                      >
                        <ImageIcon className='size-5' />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

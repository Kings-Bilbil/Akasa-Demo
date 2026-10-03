'use client'

import { useState } from 'react'

import { SaveIcon } from 'lucide-react'

import Popup from '@/components/Popup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { saveBranchMapsAction } from './actions'

type BranchInfo = {
  mapUrl?: string
  phone?: string
  openTime?: string
  closeTime?: string
}

export default function BranchList({
  branches,
  initialData,
  initialGlobalMap
}: {
  branches: any[]
  initialData: Record<string, any>
  initialGlobalMap: string
}) {
  // Convert legacy string values to objects if needed
  const normalizedInitialData: Record<string, BranchInfo> = {}
  for (const [key, value] of Object.entries(initialData)) {
    if (typeof value === 'string') {
      normalizedInitialData[key] = { mapUrl: value }
    } else {
      normalizedInitialData[key] = value as BranchInfo
    }
  }

  const [data, setData] = useState<Record<string, BranchInfo>>(normalizedInitialData)
  const [globalMap, setGlobalMap] = useState(initialGlobalMap)
  const [loading, setLoading] = useState(false)
  const [popupData, setPopupData] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const handleFieldChange = (branchId: string, field: keyof BranchInfo, value: string) => {
    setData(prev => ({
      ...prev,
      [branchId]: {
        ...(prev[branchId] || {}),
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveBranchMapsAction(data, globalMap)
      setPopupData({ message: 'Pengaturan berhasil disimpan!', type: 'success' })
    } catch (err: any) {
      setPopupData({ message: 'Gagal menyimpan: ' + err.message, type: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className='space-y-6'>
      {popupData && <Popup message={popupData.message} type={popupData.type} onClose={() => setPopupData(null)} />}

      <div className='flex justify-end'>
        <Button onClick={handleSave} disabled={loading}>
          <SaveIcon />
          {loading ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lokasi Google Maps Global (Footer Website)</CardTitle>
          <CardDescription>
            Masukkan URL <strong>src</strong> dari iframe Google Maps. Peta ini akan muncul di bagian bawah Halaman Utama.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <Label htmlFor='gmaps_url'>URL Google Maps Iframe (src)</Label>
            <Input
              id='gmaps_url'
              type='url'
              value={globalMap}
              onChange={e => setGlobalMap(e.target.value)}
              placeholder='https://www.google.com/maps/embed?pb=...'
            />
          </div>
        </CardContent>
      </Card>

      <div className='space-y-2 pt-4'>
        <h2 className='text-lg font-semibold tracking-tight'>Pengaturan Per-Cabang</h2>
        <p className='text-muted-foreground text-sm'>
          Informasi ini digunakan pada halaman Pemesanan saat cabang dipilih.
        </p>
      </div>

      {branches.length === 0 && (
        <Card>
          <CardContent className='text-muted-foreground py-10 text-center'>
            Belum ada cabang. Jalankan Sync Data Accurate terlebih dahulu.
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {branches.map(branch => {
          const branchInfo = data[branch.id] || {}

          return (
            <Card key={branch.id}>
              <CardHeader>
                <CardTitle className='text-base'>{branch.name}</CardTitle>
                <CardDescription>Accurate ID: {branch.accurate_branch_id}</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor={`map-${branch.id}`}>URL Google Maps Iframe (src)</Label>
                  <Input
                    id={`map-${branch.id}`}
                    type='url'
                    value={branchInfo.mapUrl || ''}
                    onChange={e => handleFieldChange(branch.id, 'mapUrl', e.target.value)}
                    placeholder='https://www.google.com/maps/embed?...'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`phone-${branch.id}`}>Nomor HP/WA</Label>
                  <Input
                    id={`phone-${branch.id}`}
                    type='text'
                    value={branchInfo.phone || ''}
                    onChange={e => handleFieldChange(branch.id, 'phone', e.target.value)}
                    placeholder='Contoh: 0812-3456-7890'
                  />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-2'>
                    <Label htmlFor={`open-${branch.id}`}>Jam Buka</Label>
                    <Input
                      id={`open-${branch.id}`}
                      type='time'
                      value={branchInfo.openTime || ''}
                      onChange={e => handleFieldChange(branch.id, 'openTime', e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor={`close-${branch.id}`}>Jam Tutup</Label>
                    <Input
                      id={`close-${branch.id}`}
                      type='time'
                      value={branchInfo.closeTime || ''}
                      onChange={e => handleFieldChange(branch.id, 'closeTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className='bg-muted relative h-40 overflow-hidden rounded-md border'>
                  {branchInfo.mapUrl ? (
                    <iframe src={branchInfo.mapUrl} width='100%' height='100%' style={{ border: 0 }}></iframe>
                  ) : (
                    <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                      Belum ada peta
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

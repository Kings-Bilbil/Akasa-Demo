import { revalidatePath } from 'next/cache'
import { SaveIcon } from 'lucide-react'

import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('web_settings').select('*').eq('key', 'gmaps_iframe_url').single()
  const currentUrl = data?.value || ''

  async function saveSettings(formData: FormData) {
    'use server'
    const url = formData.get('gmaps_url') as string
    const adminSupabase = createAdminClient()
    await adminSupabase.from('web_settings').upsert({ key: 'gmaps_iframe_url', value: url })
    revalidatePath('/')
    revalidatePath('/admin/settings')
  }

  return (
    <div className='max-w-2xl'>
      <PageHeader title='Pengaturan Web' description='Atur konten dinamis yang tampil di website Azuraya.' />

      <Card>
        <CardHeader>
          <CardTitle>Lokasi Google Maps (Footer)</CardTitle>
          <CardDescription>
            Masukkan URL <strong>src</strong> dari iframe Google Maps (Google My Maps atau Google Maps biasa). Ini akan
            memperbarui peta yang tampil di bagian bawah Halaman Utama.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSettings} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='gmaps_url'>URL Google Maps Iframe (src)</Label>
              <Input
                id='gmaps_url'
                type='text'
                name='gmaps_url'
                defaultValue={currentUrl}
                placeholder='https://www.google.com/maps/embed?pb=...'
                required
              />
            </div>
            <Button type='submit'>
              <SaveIcon />
              Simpan Pengaturan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

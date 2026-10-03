import { Geist } from 'next/font/google'
import { redirect } from 'next/navigation'

import AppShell from '@/components/layout/AppShell'
import { userNavItems } from '@/configs/navConfig'
import { createClient } from '@/utils/supabase/server'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.email === 'admin@azuraya.com') {
    redirect('/admin')
  }

  const { data: customer } = await supabase.from('customers').select('full_name').eq('id', user.id).single()

  return (
    <AppShell
      navItems={userNavItems}
      subtitle='Dashboard Pelanggan'
      userName={customer?.full_name || 'Pelanggan'}
      userEmail={user.email ?? ''}
      fontClassName={geistSans.variable}
    >
      {children}
    </AppShell>
  )
}

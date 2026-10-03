import { Geist } from 'next/font/google'
import { redirect } from 'next/navigation'

import AppShell from '@/components/layout/AppShell'
import { adminNavItems } from '@/configs/navConfig'
import { createClient } from '@/utils/supabase/server'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@azuraya.com') {
    redirect('/')
  }

  return (
    <AppShell
      navItems={adminNavItems}
      subtitle='Admin Panel'
      userName='Administrator'
      userEmail={user.email ?? ''}
      fontClassName={geistSans.variable}
    >
      {children}
    </AppShell>
  )
}

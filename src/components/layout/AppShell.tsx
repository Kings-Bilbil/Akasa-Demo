'use client'

// React Imports
import { Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'

// Type Imports
import type { NavItem } from '@/configs/navConfig'

// Component Imports
import AdminHeader from '@/components/layout/AdminHeader'
import Sidebar from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

// Util Imports
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: ReactNode
  navItems: NavItem[]
  subtitle: string
  userName: string
  userEmail: string
  /** Class variabel font (Geist) dari next/font */
  fontClassName: string
}

const THEME_KEY = 'azuraya-admin-theme'

// useLayoutEffect hanya di browser agar tidak muncul warning saat SSR
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Shell layout AdminCN untuk /admin dan /dashboard.
 * - Memasang class `admincn` + font pada <html> agar dropdown/dialog (portal) ikut ter-theme.
 * - Tema gelap/terang disimpan di localStorage dan hanya berlaku di area ini.
 */
const AppShell = ({ children, navItems, subtitle, userName, userEmail, fontClassName }: AppShellProps) => {
  const [isDark, setIsDark] = useState(false)

  // Baca preferensi tema tersimpan
  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY)
    if (saved) setIsDark(saved === 'dark')
    else setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  // Sinkronkan class ke <html> (untuk portal) dan bersihkan saat keluar dari area admin
  useIsoLayoutEffect(() => {
    const root = document.documentElement
    const fontClasses = fontClassName.split(' ').filter(Boolean)

    root.classList.add('admincn', ...fontClasses)
    root.classList.toggle('dark', isDark)

    return () => {
      root.classList.remove('admincn', 'dark', ...fontClasses)
    }
  }, [isDark, fontClassName])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev
      window.localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
      return next
    })
  }, [])

  return (
    <div
      className={cn(
        'admincn bg-background text-foreground flex min-h-screen w-full font-sans antialiased',
        fontClassName,
        isDark && 'dark'
      )}
    >
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <Suspense>
            <Sidebar navItems={navItems} subtitle={subtitle} />
          </Suspense>
          <SidebarInset className='flex min-w-0 flex-1 flex-col'>
            <AdminHeader userName={userName} userEmail={userEmail} isDark={isDark} onToggleTheme={toggleTheme} />
            <main className='mx-auto size-full max-w-360 flex-1 px-4 py-6 sm:px-6'>{children}</main>
            <footer className='text-muted-foreground mx-auto w-full max-w-360 px-4 py-3 text-sm sm:px-6'>
              &copy; {new Date().getFullYear()} Azuraya Grup
            </footer>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}

export default AppShell

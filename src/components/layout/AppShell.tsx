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
  const [isDark, setIsDark] = useState(true)

  // Baca preferensi tema tersimpan
  useEffect(() => {
    // Tema Azuraya: gelap (hitam + emas) adalah default
    const saved = window.localStorage.getItem(THEME_KEY)
    if (saved) setIsDark(saved === 'dark')
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
          <SidebarInset className='relative flex min-w-0 flex-1 flex-col'>
            {/* Cahaya segitiga khas Azuraya (hanya tampil di tema gelap) */}
            {isDark && (
              <div className='pointer-events-none absolute inset-x-0 top-0 z-0 h-161 overflow-hidden opacity-70' aria-hidden>
                <div className='flash-light flash-light--left' />
                <div className='flash-light flash-light--right' />
              </div>
            )}
            <AdminHeader userName={userName} userEmail={userEmail} isDark={isDark} onToggleTheme={toggleTheme} />
            <div className='relative z-10 mx-auto size-full max-w-360 flex-1 px-4 py-6 sm:px-6'>{children}</div>
            <footer className='text-muted-foreground relative z-10 mx-auto w-full max-w-360 px-4 py-3 text-sm sm:px-6'>
              &copy; {new Date().getFullYear()} Azuraya Grup
            </footer>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}

export default AppShell

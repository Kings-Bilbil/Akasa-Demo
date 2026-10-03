'use client'

// React Imports
import { Fragment } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'

// Third-party Imports
import { LogOutIcon, MoonStarIcon, SunIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  products: 'Gambar Produk',
  branches: 'Peta Cabang',
  sync: 'Sync Accurate',
  settings: 'Pengaturan Web'
}

type HeaderProps = {
  userName: string
  userEmail: string
  isDark: boolean
  onToggleTheme: () => void
}

const AdminHeader = ({ userName, userEmail, isDark, onToggleTheme }: HeaderProps) => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const initials = (userName || userEmail || 'U').trim().slice(0, 2).toUpperCase()

  return (
    <header className='bg-card sticky top-0 z-50 border-b'>
      <div className='mx-auto flex max-w-360 items-center justify-between gap-6 px-4 py-2 sm:px-6'>
        <div className='flex items-center gap-4'>
          <SidebarTrigger className='[&_svg]:size-5!' />
          <Separator orientation='vertical' className='hidden h-4! data-vertical:self-center sm:block' />
          <Breadcrumb className='hidden sm:block'>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1
                const label =
                  SEGMENT_LABELS[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                const href = '/' + segments.slice(0, index + 1).join('/')

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem>
                      {isLast ? <BreadcrumbPage>{label}</BreadcrumbPage> : <BreadcrumbLink href={href}>{label}</BreadcrumbLink>}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button variant='ghost' size='icon' className='relative' onClick={onToggleTheme}>
            <MoonStarIcon className={isDark ? 'scale-0' : 'scale-100'} />
            <SunIcon className={isDark ? 'absolute scale-100' : 'absolute scale-0'} />
            <span className='sr-only'>Ganti tema</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant='ghost' size='icon' className='relative rounded-full hover:bg-transparent' />}>
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-60'>
              <DropdownMenuGroup>
                <DropdownMenuLabel className='flex items-center gap-4 px-2 py-2.5 font-normal'>
                  <Avatar className='size-10'>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='flex min-w-0 flex-1 flex-col items-start'>
                    <span className='text-foreground max-w-full truncate text-base font-semibold'>{userName}</span>
                    <span className='text-muted-foreground max-w-full truncate text-sm'>{userEmail}</span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <form action='/api/auth/logout' method='POST'>
                  <DropdownMenuItem
                    variant='destructive'
                    render={<button type='submit' className='w-full' />}
                  >
                    <LogOutIcon />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader

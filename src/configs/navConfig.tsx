// Third-party Imports
import type * as Icon from 'lucide-react'

type IconName = keyof typeof Icon

export type MenuLeafSubItem = {
  label: string
  href: string
  activePath?: string
  badge?: string
  badgeClassName?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export type MenuGroupSubItem = {
  label: string
  childItems: MenuLeafSubItem[]
}

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem

export type MenuItem = {
  icon: IconName
  label: string
} & (
  | {
      href: string
      target?: '_blank' | '_self' | '_parent' | '_top'
      badge?: string
      badgeClassName?: string
      childItems?: never
    }
  | {
      href?: never
      target?: never
      badge?: string
      badgeClassName?: string
      childItems: MenuSubItem[]
    }
)

export type NavItem = {
  groupLabel?: string
  items: MenuItem[]
}

// Menu panel admin
export const adminNavItems: NavItem[] = [
  {
    groupLabel: 'Dashboard',
    items: [{ icon: 'LayoutDashboardIcon', label: 'Pesanan', href: '/admin' }]
  },
  {
    groupLabel: 'Katalog',
    items: [
      { icon: 'PackageIcon', label: 'Gambar Produk', href: '/admin/products' },
      { icon: 'MapPinIcon', label: 'Pengaturan Web & Cabang', href: '/admin/branches' }
    ]
  },
  {
    groupLabel: 'Sistem',
    items: [
      { icon: 'RefreshCwIcon', label: 'Sync Data Accurate', href: '/admin/sync' }
    ]
  },
  {
    groupLabel: 'Lainnya',
    items: [
      { icon: 'GlobeIcon', label: 'Kembali ke Website', href: '/' }
    ]
  }
]

// Menu dashboard pelanggan
export const userNavItems: NavItem[] = [
  {
    groupLabel: 'Akun Saya',
    items: [{ icon: 'ReceiptTextIcon', label: 'Riwayat Pesanan', href: '/dashboard' }]
  },
  {
    groupLabel: 'Belanja',
    items: [
      { icon: 'ShoppingBagIcon', label: 'Produk', href: '/produk' },
      { icon: 'MapPinIcon', label: 'Cabang', href: '/cabang' },
      { icon: 'HouseIcon', label: 'Beranda', href: '/' }
    ]
  }
]

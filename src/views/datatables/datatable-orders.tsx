'use client'

import { useMemo, useState } from 'react'

import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { ReceiptTextIcon, SearchIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { formatRupiah, formatTanggal } from '@/lib/format'
import { cn } from '@/lib/utils'

export type OrderRow = {
  id: string
  shortId: string
  createdAt: string
  customerName: string
  customerEmail: string
  branchName: string
  isPaid: boolean
  total: number
  /** Nomor Sales Order di Accurate (jika sudah terkirim) */
  accurateSo?: string | null
  /** Pesan error sinkronisasi ke Accurate (jika gagal) */
  syncError?: string | null
  /** Ringkasan item, mis. "2x Produk A, 1x Produk B" */
  items?: string
}

type Variant = 'admin' | 'user'



const AccurateBadge = ({ row }: { row: OrderRow }) => {
  if (row.accurateSo) {
    return (
      <Badge variant='outline' className='h-auto rounded-sm px-1.5 font-normal'>
        SO: {row.accurateSo}
      </Badge>
    )
  }

  if (row.isPaid && row.syncError) {
    return (
      <div className='flex max-w-48 flex-col gap-0.5' title={row.syncError}>
        <Badge variant='destructive' className='h-auto rounded-sm px-1.5'>
          Gagal kirim ke Accurate
        </Badge>
        <span className='text-destructive line-clamp-2 text-[11px] leading-tight whitespace-normal'>{row.syncError}</span>
      </div>
    )
  }

  return <span className='text-muted-foreground text-sm'>-</span>
}

const RowActions = ({ row }: { row: OrderRow }) => {
  if (!row.isPaid) {
    return <span className='text-muted-foreground text-xs'>Belum Dibayar</span>
  }
  
  return (
    <a 
      href={`/invoice/${row.id}`} 
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'whitespace-nowrap')}
    >
      <ReceiptTextIcon className='mr-2 size-4' aria-hidden='true' />
      Lihat Bukti Pembayaran
    </a>
  )
}

const adminColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'shortId',
    header: 'Pesanan',
    cell: ({ row }) => (
      <div className='flex flex-col text-sm'>
        <span className='text-card-foreground font-medium'>#{row.original.shortId.toUpperCase()}</span>
        <span className='text-muted-foreground'>{formatTanggal(row.original.createdAt)}</span>
      </div>
    )
  },
  {
    accessorKey: 'customerName',
    header: 'Pelanggan',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Avatar className='size-9'>
          <AvatarFallback className='text-xs'>{row.original.customerName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col text-sm'>
          <span className='text-card-foreground font-medium'>{row.original.customerName}</span>
          <span className='text-muted-foreground'>{row.original.customerEmail}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'branchName',
    header: 'Cabang',
    cell: ({ row }) => <span className='text-sm'>{row.original.branchName || '-'}</span>
  },
  {
    id: 'accurate',
    header: 'Accurate',
    enableSorting: false,
    cell: ({ row }) => <AccurateBadge row={row.original} />
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <span className='font-medium'>{formatRupiah(row.original.total)}</span>
  },
  {
    id: 'actions',
    header: () => <span className='sr-only'>Aksi</span>,
    cell: ({ row }) => <RowActions row={row.original} />,
    size: 60,
    enableHiding: false
  }
]

const userColumns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'shortId',
    header: 'Pesanan',
    cell: ({ row }) => (
      <div className='flex flex-col text-sm'>
        <span className='text-card-foreground font-medium'>#{row.original.shortId.toUpperCase()}</span>
        <span className='text-muted-foreground'>{formatTanggal(row.original.createdAt)}</span>
      </div>
    )
  },
  {
    accessorKey: 'items',
    header: 'Item Dipesan',
    cell: ({ row }) => (
      <div className='flex max-w-80 flex-col text-sm'>
        <span className='line-clamp-2 whitespace-normal'>{row.original.items || '-'}</span>
        <span className='text-muted-foreground'>Ambil di {row.original.branchName || '-'}</span>
      </div>
    )
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <span className='font-medium'>{formatRupiah(row.original.total)}</span>
  },
  {
    id: 'actions',
    header: () => <span className='sr-only'>Aksi</span>,
    cell: ({ row }) => <RowActions row={row.original} />,
    size: 60,
    enableHiding: false
  }
]

const OrdersDatatable = ({
  data,
  variant,
  emptyText = 'Belum ada pesanan.'
}: {
  data: OrderRow[]
  variant: Variant
  emptyText?: string
}) => {
  const [search, setSearch] = useState('')

  const columns = variant === 'admin' ? adminColumns : userColumns

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()

    return data.filter(order => {
      if (!q) return true

      return [order.shortId, order.customerName, order.customerEmail, order.branchName, order.items, order.accurateSo]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q))
    })
  }, [data, search])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <div className='w-full'>
      <div className='flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full sm:max-w-xs'>
          <SearchIcon className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={event => {
              setSearch(event.target.value)
            }}
            placeholder={variant === 'admin' ? 'Cari ID, pelanggan, cabang...' : 'Cari pesanan...'}
            className='pl-8'
          />
        </div>
      </div>

      <div className='border-b'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className='text-muted-foreground h-14 first:pl-4'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className='first:pl-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='text-muted-foreground h-24 text-center'>
                  {data.length === 0 ? emptyText : 'Tidak ada pesanan yang cocok.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='px-6 py-4'>
        <p className='text-muted-foreground text-sm' aria-live='polite'>
          Total <span>{filteredData.length} pesanan</span>
        </p>
      </div>
    </div>
  )
}

export default OrdersDatatable

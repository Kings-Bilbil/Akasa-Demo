'use client'

import { useMemo, useState } from 'react'

import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, ReceiptTextIcon, SearchIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { usePagination } from '@/hooks/use-pagination'
import { formatRupiah, formatTanggal } from '@/lib/format'

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

type StatusFilter = 'all' | 'paid' | 'pending'

const StatusBadge = ({ row }: { row: OrderRow }) => (
  <div className='flex flex-col items-start gap-1'>
    {row.isPaid ? (
      <Badge className='h-auto rounded-sm bg-green-600/10 px-1.5 text-green-700 dark:bg-green-400/10 dark:text-green-400'>
        Lunas
      </Badge>
    ) : (
      <Badge className='h-auto rounded-sm bg-amber-500/10 px-1.5 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400'>
        Menunggu Pembayaran
      </Badge>
    )}
  </div>
)

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

const RowActions = ({ row }: { row: OrderRow }) => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button size='icon' variant='ghost' aria-label='Aksi pesanan' />}>
      <EllipsisVerticalIcon className='size-5' aria-hidden='true' />
    </DropdownMenuTrigger>
    <DropdownMenuContent align='end'>
      <DropdownMenuGroup>
        {row.isPaid ? (
          <DropdownMenuItem render={<a href={`/invoice/${row.id}`} target='_blank' rel='noreferrer' />}>
            <ReceiptTextIcon />
            <span>Lihat Invoice</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>
            <ReceiptTextIcon />
            <span>Invoice belum tersedia</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)

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
    accessorKey: 'isPaid',
    header: 'Status',
    cell: ({ row }) => <StatusBadge row={row.original} />
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
    accessorKey: 'isPaid',
    header: 'Status',
    cell: ({ row }) => <StatusBadge row={row.original} />
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

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'paid', label: 'Lunas' },
  { key: 'pending', label: 'Menunggu' }
]

const OrdersDatatable = ({
  data,
  variant,
  pageSize = 10,
  emptyText = 'Belum ada pesanan.'
}: {
  data: OrderRow[]
  variant: Variant
  pageSize?: number
  emptyText?: string
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize })

  const columns = variant === 'admin' ? adminColumns : userColumns

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()

    return data.filter(order => {
      if (statusFilter === 'paid' && !order.isPaid) return false
      if (statusFilter === 'pending' && order.isPaid) return false
      if (!q) return true

      return [order.shortId, order.customerName, order.customerEmail, order.branchName, order.items, order.accurateSo]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(q))
    })
  }, [data, search, statusFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: { pagination }
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 2
  })

  const resetPage = () => setPagination(prev => ({ ...prev, pageIndex: 0 }))

  const from = filteredData.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredData.length)

  return (
    <div className='w-full'>
      <div className='flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full sm:max-w-xs'>
          <SearchIcon className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              resetPage()
            }}
            placeholder={variant === 'admin' ? 'Cari ID, pelanggan, cabang...' : 'Cari pesanan...'}
            className='pl-8'
          />
        </div>
        <div className='flex items-center gap-2'>
          {FILTERS.map(filter => (
            <Button
              key={filter.key}
              size='sm'
              variant={statusFilter === filter.key ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter(filter.key)
                resetPage()
              }}
            >
              {filter.label}
            </Button>
          ))}
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

      <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
        <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
          Menampilkan{' '}
          <span>
            {from} - {to}
          </span>{' '}
          dari <span>{filteredData.length} pesanan</span>
        </p>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                className='disabled:pointer-events-none disabled:opacity-50'
                variant='ghost'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label='Halaman sebelumnya'
              >
                <ChevronLeftIcon aria-hidden='true' />
                Sebelumnya
              </Button>
            </PaginationItem>

            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {pages.map(page => {
              const isActive = page === table.getState().pagination.pageIndex + 1

              return (
                <PaginationItem key={page}>
                  <Button
                    size='icon'
                    className={`${!isActive && 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40'}`}
                    onClick={() => table.setPageIndex(page - 1)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              )
            })}

            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <Button
                className='disabled:pointer-events-none disabled:opacity-50'
                variant='ghost'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label='Halaman berikutnya'
              >
                Berikutnya
                <ChevronRightIcon aria-hidden='true' />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export default OrdersDatatable

// Component Imports
import { StoreIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type Props = {
  className?: string
  title: string
  totalLabel: string
  description: string
  /** Daftar peringkat (mis. cabang) beserta nilai dan persentase progres */
  rows: {
    name: string
    subtitle: string
    valueLabel: string
    progressPercentage: number
  }[]
  emptyText?: string
}

const RankingCard = ({ className, title, totalLabel, description, rows, emptyText = 'Belum ada data.' }: Props) => {
  return (
    <Card className={className}>
      <CardContent className='flex flex-col gap-6'>
        <div className='text-lg font-semibold'>{title}</div>
        <div className='flex flex-col gap-1'>
          <span className='text-2xl font-semibold'>{totalLabel}</span>
          <span className='text-muted-foreground text-sm'>{description}</span>
        </div>
      </CardContent>
      <CardContent className='flex flex-1 flex-col gap-4'>
        <div className='flex flex-1 flex-col justify-evenly gap-4'>
          {rows.length === 0 && <p className='text-muted-foreground text-sm'>{emptyText}</p>}
          {rows.map(row => (
            <div key={row.name} className='flex items-center justify-between gap-2.5'>
              <div className='flex min-w-0 items-center gap-2.5'>
                <Avatar className='size-11 rounded-sm after:rounded-[inherit] after:border-0'>
                  <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                    <StoreIcon className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-col gap-1'>
                  <span className='truncate text-base font-medium'>{row.name}</span>
                  <span className='text-muted-foreground truncate text-sm'>{row.subtitle}</span>
                </div>
              </div>
              <div className='space-y-2'>
                <p className='text-right text-sm'>{row.valueLabel}</p>
                <Progress value={row.progressPercentage} className='w-28 **:data-[slot=progress-track]:h-1.5' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RankingCard

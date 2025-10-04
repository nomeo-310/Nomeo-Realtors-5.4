'use client'

import { Skeleton } from '../ui/skeleton'
import { cn } from '@/lib/utils'

const NotificationsSkeleton = () => {
  const NotificationSkeleton = () => {
    return (
      <div className='w-full border-b dark:border-b-white/70 flex gap-2 items-start py-2 md:py-3'>
        <Skeleton className={cn('size-9 md:size-10 lg:size-12 flex items-center justify-center rounded-md bg-[#d4d4d4] dark:bg-[#424242]','')}/>
        <div className="flex-1 mt-1">
          <Skeleton className='lg:h-3 text-black/70 h-2 bg-[#d4d4d4] dark:bg-[#424242] w-40 rounded-md mb-1'/>
          <Skeleton className='font-semibold font-quicksand lg:h-3 h-2 bg-[#d4d4d4] dark:bg-[#424242] w-64 rounded-md'/>
          <Skeleton className='h-12 lg:h-16 w-full text-wrap text-black/60 dark:text-white/80 rounded-md bg-[#d4d4d4] dark:bg-[#424242] mt-2'/>
        </div>
      </div>
    )
  }
  return (
    <div className='mt6'>
      <NotificationSkeleton/>
      <NotificationSkeleton/>
      <NotificationSkeleton/>
    </div>
  )
}

export default NotificationsSkeleton;
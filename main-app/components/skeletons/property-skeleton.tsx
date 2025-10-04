import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

const PropertySkeletons = ({use_three}:{use_three?: boolean}) => {

  const PropertySkeleton = ({hide_one}:{hide_one?:boolean}) => {

    return (
      <div className={cn('flex flex-col', hide_one && 'lg:hidden hidden md:flex')}>
        <div className='relative w-full h-[220px] lg:h-[240px] rounded-lg overflow-hidden'>
          <Skeleton className='w-full h-full bg-[#d4d4d4] dark:bg-[#424242] rounded-none'/>
        </div>
        <div className='pt-2 text-black/60 dark:text-white/80 dark:bg-[#424242]'>
          <div className='flex items-center gap-2'>
            <Skeleton className='size-6 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className='bg-[#d4d4d4] dark:bg-[#424242] flex-1 h-[10px] rounded-full'/>
          </div>
          <div className="flex items-center justify-between pt-2 dark:border-t-white/70 w-full">
            <div className='flex items-center gap-2 w-full'>
              <Skeleton className='size-6 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='size-6 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='size-6 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='bg-[#d4d4d4] dark:bg-[#424242] flex-1 h-[10px] rounded-full'/>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className={cn("grid lg:grid-cols-4 xl:gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-6 lg:gap-y-4 grid-cols-1 gap-5", use_three && 'lg:grid-cols-3')}>
      <PropertySkeleton/>
      <PropertySkeleton/>
      <PropertySkeleton/>
      <PropertySkeleton hide_one={use_three}/>
    </div>
  )
};

export default PropertySkeletons;
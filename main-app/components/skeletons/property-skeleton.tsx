import React from 'react'
import { Skeleton } from '../ui/skeleton';

const PropertySkeletons = () => {

  const PropertySkeleton = () => {

    return (
      <div className='flex flex-col shadow-md rounded-xl overflow-hidden'>
        <div className='relative w-full h-[220px] overflow-hidden'>
          <Skeleton className='w-full h-full bg-[#d4d4d4] dark:bg-[#424242] rounded-none'/>
        </div>
        <div className='p-3 text-black/60 dark:text-white/80 dark:bg-[#424242]'>
          <div className='flex items-center gap-2'>
            <Skeleton className='size-6 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className='bg-[#d4d4d4] dark:bg-[#424242] flex-1 h-[10px] rounded-full'/>
          </div>
          <div className="flex items-center justify-between  mt-2 pt-2 border-t dark:border-t-white/70 w-full">
            <div className='flex items-center gap-2 w-full'>
              <Skeleton className='size-6 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='bg-[#d4d4d4] dark:bg-[#424242] flex-1 h-[10px] rounded-full'/>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="grid xl:grid-cols-4 xl:gap-3 md:grid-cols-2 md:gap-x-4 md:gap-y-6 lg:gap-y-4 grid-cols-1 gap-5">
      <PropertySkeleton/>
      <PropertySkeleton/>
      <PropertySkeleton/>
      <PropertySkeleton/>
    </div>
  )
};

export default PropertySkeletons;
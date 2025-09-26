'use client'

import React from 'react'
import { Skeleton } from '../ui/skeleton'

const ProfileSkeletons = () => {
  return (
    <React.Fragment>
      <div className='flex flex-col md:gap-6 lg:gap-8 gap-4'>
      <div className="flex items-center gap-4">
        <Skeleton className='block w-28 lg:w-40 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
        <hr className='flex-1 dark:border-white/70'/>
      </div>
      <div className="flex gap-4 md:gap-6  lg:gap-8 flex-col md:flex-row">
        <div className="md:size-44 lg:size-48 xl:size-52 size-36 rounded-lg overflow-hidden mx-auto md:mx-0">
          <Skeleton className='w-full h-full block rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <Skeleton className='block w-full bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-40 lg:w-52 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-52 lg:w-64 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-40 lg:w-52 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-52 lg:w-64 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-40 lg:w-52 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className='block w-full bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-52 lg:w-64 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-40 lg:w-52 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className='lg:size-6 size-5 bg-[#d4d4d4] dark:bg-[#424242] block rounded-full'/>
              <Skeleton className='block w-52 lg:w-64 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className='flex flex-col md:gap-6 lg:gap-8 gap-4'>
        <div className="flex items-center gap-4">
          <Skeleton className='block w-28 lg:w-40 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
          <hr className='flex-1 dark:border-white/70'/>
        </div>
        <Skeleton className='block w-full h-28 lg:h-32 rounded-md bg-[#d4d4d4] dark:bg-[#424242]'/>
      </div>
      <div className="flex items-center gap-3">
        <hr className='flex-1 dark:border-white/70'/>
        <Skeleton className='block w-20 lg:w-28 bg-[#d4d4d4] dark:bg-[#424242] rounded-full lg:h-3 h-2'/>
      </div>
    </React.Fragment>
  )
}

export default ProfileSkeletons
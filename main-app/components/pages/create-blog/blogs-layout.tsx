'use client'


import { ArrowUpRight03Icon, Search01Icon } from '@hugeicons/core-free-icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'

type buttonProps = {
  tab: string; 
  counts: number
  label: string;
}

const BlogsLayout = ({children}:{children: React.ReactNode}) => {
  const pathname = usePathname();

  const TabButton = ({tab, counts, label}:buttonProps) => {
    return (
      <Link className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase flex items-center justify-center gap-4", tab === pathname ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} href={tab}>{label} { counts > 0 && <span className='tabular-nums text-sm bg-red-500 text-white size-6 rounded-full flex items-center justify-center'>{counts}</span>}
      </Link>
    )
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Blogs</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="w-full md:w-[60%] xl:w-[40%] flex gap-1 mb-6">
          <InputWithIcon 
            type='text' 
            icon={Search01Icon}
            iconClassName='text-black/60 dark:text-white/70'
            className=' dark:border-white/70 rounded-r-none'
            placeholder='search transaction history'
            inputClassName='placeholder:text-black/70 border dark:border-white/70 rounded-lg rounded-r-none dark:placeholder:text-white'
          />
          <button type="button" className='lg:h-12 h-10 aspect-square rounded-lg flex items-center justify-center border dark:border-white/70 rounded-l-none'>
              <HugeiconsIcon icon={ArrowUpRight03Icon} className='rotate-45 text-black/60 dark:text-white/70'/>
          </button>
        </div>
        <div className="h-10 w-full flex">
          <TabButton tab='/admin-dashboard/created-blog' label='Create' counts={0}/>
          <TabButton tab='/admin-dashboard/created-blog/draft' label='Rentals' counts={3}/>
          <TabButton tab='/admin-dashboard/created-blog/deleted' label='Apartments' counts={3}/>
          <div className="flex-1 border-b dark:border-b-white/80"/>
        </div>
      <div>
      {children}
        </div>
      </div>
    </div>
  )
};

export default BlogsLayout
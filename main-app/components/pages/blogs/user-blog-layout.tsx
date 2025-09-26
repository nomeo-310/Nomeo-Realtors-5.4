'use client'

import { ArrowUpRight03Icon, Search01Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon';
import React from 'react'
import TabButton from './tab-button';
import { HugeiconsIcon } from '@hugeicons/react';


const UserBlogLayout = ({children}:{children:React.ReactNode}) => {

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
        <div className="h-10 w-full flex flex-wrap">
          <TabButton label='All Blogs' counts={3} tab='/user-dashboard/blogs'/>
          <TabButton label='Drafts' tab='/user-dashboard/blogs/drafts' counts={0}/>
          <TabButton label='Deleted' counts={2} tab='/user-dashboard/blogs/deleted'/>
          <TabButton label='Collaboration' counts={2} tab='/user-dashboard/blogs/collaboration' className='hidden md:flex'/>
          <div className="flex-1 border-b dark:border-b-white/80 hidden md:block"/>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
};

export default UserBlogLayout
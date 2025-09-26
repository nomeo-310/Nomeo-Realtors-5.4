'use client'
import React from 'react'
import { about_texts } from '@/assets/texts/about_texts'
import { Briefcase02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const PropertyManagement = () => {
  return (
    <div className="rounded-xl dark:bg-[#424242] bg-white p-4 flex flex-col justify-between md:gap-3 gap-2 lg:gap-0">
    <div className="flex gap-4 items-center">
      <div className="size-12 rounded-md bg-secondary-blue/50 dark:bg-secondary-blue/80 flex items-center justify-center">
        <HugeiconsIcon icon={Briefcase02Icon} className='text-black/80 dark:text-white/80'/>
      </div>
      <h2 className='font-quicksand font-semibold text-lg'>Properties Management</h2>
    </div>
    <p className='line-clamp-4 text-black/60 dark:text-white/70  text-sm lg:text-base'>{about_texts.service_prop_mgt}</p>
  </div>
  )
}

export default PropertyManagement
'use client'

import React from 'react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { about_texts } from '@/assets/texts/about_texts'
import { HugeiconsIcon } from '@hugeicons/react'

const PropertySearch = () => {
  return (
    <div className="rounded-xl dark:bg-[#424242] bg-white p-4 flex flex-col justify-between md:gap-3 gap-2 lg:gap-0">
      <div className="flex gap-4 items-center">
        <div className="size-12 rounded-md bg-secondary-blue/50 dark:bg-secondary-blue/80 flex items-center justify-center">
          <HugeiconsIcon icon={Search01Icon} className='text-black/80 dark:text-white/80'/>
        </div>
        <h2 className='font-quicksand font-semibold text-lg'>Property Search & Acquisition</h2>
      </div>
      <p className='line-clamp-4 text-black/60 dark:text-white/70 text-sm lg:text-base'>{about_texts.service_prop_search}</p>
    </div>
  )
}

export default PropertySearch
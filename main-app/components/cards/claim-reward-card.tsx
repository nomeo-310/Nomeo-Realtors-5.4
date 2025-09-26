'use client'

import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, GiftIcon, Medal04Icon } from '@hugeicons/core-free-icons';
import { nairaSign } from '@/lib/utils';



const ClaimRewardCard = () => {
  const claimed = false;

  const propetyTag = 'for-rent';
  const rentalPercentage = 3;

  return (
    <div className='w-full border-b dark:border-b-white/70 last:border-b-0 flex gap-3 flex-col py-3'>
      <p className='text-black/60 dark:text-white/70 text-xs lg:text-sm mb-3'>17th May, 2025.</p>
      <div className="w-full flex items-center justify-between">
        <p className='text-xs font-semibold text-black/60 dark:text-white/70'>CASH BACK AND POINTS</p>
        <p className='text-xs uppercase underline font-semibold'>View Property</p>
      </div>
      <div className="flex items-enter gap-3">
        <div className="items-center gap-2 lg:gap-3 flex">
          <HugeiconsIcon icon={GiftIcon} className='dark:text-white xl:size-8 lg:size-6 size-5 text-black/70 dark:text-white/80'/>
          <p className='font-semibold text-sm lg:text-base'>{nairaSign} 125,000.00</p>
        </div>
        <div className="items-center gap-2 lg:gap-3 flex">
          <HugeiconsIcon icon={Medal04Icon} className='dark:text-white xl:size-8 lg:size-6 size-5 text-black/70 dark:text-white/80'/>
          <p className='font-semibold text-sm lg:text-base'>20 points</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className='text-sm lg:text-base text-black/60 dark:text-white/70'>Commission fee + <span className='py-0.5 px-2 rounded-full dark:bg-white bg-[#d4d4d4] text-black/70 mx-1'>{rentalPercentage}%</span> motivation cut on property {propetyTag === 'for-rent' ? 'rentals' : 'sale'}.</p>
        <button type="button" className='items-center flex gap-1.5 text-xs hover:font-semibold group flex-none font-semibold'>
          CLAIM NOW
          <HugeiconsIcon icon={ArrowRight01Icon} className='size-4'/>
        </button>
      </div>
    </div>
  )
}

export default ClaimRewardCard;
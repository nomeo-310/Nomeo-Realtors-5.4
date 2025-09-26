'use client'

import React from 'react'
import { cn } from '@/lib/utils';
import PropertySearch from './property-search';
import SalesManagement from './sales-management';
import PropertyManagement from './property-management';
import Link from 'next/link';
import { about_texts } from '@/assets/texts/about_texts';

const WhyUs = () => {

  return (
    <section className={cn('w-full xl:h-[700px] lg:h-[650px] h-auto flex xl:gap-16 xl:p-16 md:p-10 p-6 lg:flex-row flex-col gap-6 bg-neutral-200 dark:bg-inherit')}>
      <div className="xl:w-[480px] lg:w-[350px] md:w-full md:h-auto h-full flex flex-col justify-center gap-6">
        <h2 className='xl:text-3xl md:text-2xl text-lg font-quicksand font-semibold'>Why use Nomeo Realtors?</h2>
        <p className='text-black/60 dark:text-white/70 text-sm md:text-base text-justify'>{about_texts.why_us.substring(0, 500)}... <Link href={'/about'} className='ml-4 text-secondary-blue font-semibold'>Find out more</Link></p>
      </div>
      <div className="flex-1 h-full grid md:grid-cols-2 grid-rows-3 grid-cols-1 gap-5 md:gap-0">
        <div className='hidden md:block' />
        <PropertySearch/>
        <SalesManagement/>
        <div className='hidden md:block' />
        <div className='hidden md:block' />
        <PropertyManagement/>
      </div>
    </section>
  )
}

export default WhyUs
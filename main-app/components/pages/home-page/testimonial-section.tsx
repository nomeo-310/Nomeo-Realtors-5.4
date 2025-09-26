'use client'

import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'
import TestimonialCarousel from './testimonial-carousel';

const TestimonialSection = () => {
  return (
    <section className={cn('w-full xl:h-[700px] lg:h-[650px] md:h-[700px] h-[680px]')} id="testimonials">
      <div className="w-full h-full relative">
        <Image src={'/images/hero-banner.jpg'} alt='banner' fill className='object-cover'/>
        <div className="bg-black/80 absolute left-0 top-0 w-full h-full z-50 xl:p-16 md:p-10 p-6 flex flex-col xl:gap-16 md:gap-10 gap-6 pt-[84px]">
          <h2 className='xl:text-3xl md:text-2xl text-lg font-quicksand font-semibold text-white text-center lg:mt-10 md:mt-10'>What Our Clients Are Saying</h2>
          <TestimonialCarousel/>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection;
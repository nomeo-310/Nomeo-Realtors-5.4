'use client'


import { QuoteUpIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import React from 'react'

type testimonialCard = {
  content: string;
  image: string;
  name: string;
  role: string;
};

const TestimonialCard = ({content, image, name, role}:testimonialCard) => {
  return (
  <div className=" text-white text-sm flex flex-col gap-4">
    <div className="flex w-full lg:h-[120px] md:h-[160px] h-[140px] gap-1 items-center">
      <div className="w-4 h-full flex justify-center items-start">
        <HugeiconsIcon icon={QuoteUpIcon} className='size-4'/>
      </div>
      <p className='flex-1 text-justify'>{content}</p>
    </div>
    <div className="flex-1 pl-5">
      <div className="h-full flex gap-3 py-1 w-full items-center">
        <div className="size-12 relative rounded-full flex-none">
          <Image src={image} fill className='object-cover object-center rounded-full' alt='profile'/>
        </div>
        <div className="flex flex-col justify-center gap-1 font-quicksand text-sm">
          <p className='capitalize font-semibold'>{name}</p>
          <p className='capitalize'>{role}</p>
        </div>
      </div>
    </div>
  </div>
  )
}

export default TestimonialCard
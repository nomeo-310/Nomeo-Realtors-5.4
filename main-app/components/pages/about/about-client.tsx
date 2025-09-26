'use client'

import Image from 'next/image'
import React from 'react'
import { about_texts } from '@/assets/texts/about_texts'

const AboutClient = () => {
  return (
    <div className='pt-[60px] lg:pt-[70px] xl:px-16 md:px-10 px-6'>
      <div className="relative w-full xl:h-[530px] md:h-[430px] h-[250px] rounded-xl overflow-hidden mt-5">
        <div className='bg-black/20 absolute left-0 top-0 w-full h-full z-[500]'/>
        <Image src={'/images/about_banner.jpeg'} alt='about_banner' fill className='object-cover object-top'/>
      </div>
      <div className='flex flex-col lg:gap-8 gap-6 py-10'>
        <div className='flex flex-col w-full lg:gap-8 gap-6 py-2'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>About Us</h1>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{about_texts.intro}</p>
        </div>
        <div className='flex flex-col w-full lg:gap-8 gap-6 py-2'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>Our Vision & Mission</h1>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{about_texts.our_vision}</p>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{about_texts.our_mission}</p>
        </div>
        <div className='flex flex-col w-full lg:gap-8 gap-6 py-2'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>What Sets Us Apart?</h1>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{about_texts.our_uniqueness_intro} <br/>What sets us apart include:</p>
          <ul className="mt-2 flex flex-col lg:gap-8 gap-6 list-disc list-inside">
            {about_texts.our_uniqueness.map((item, index) =>(
              <li key={index} className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>
                <span className='font-quicksand text-black dark:text-white font-medium lg:text-lg text-base'>{item.title}:</span> {item.description}
              </li>
            ))}
          </ul>
        </div>
        <div className='flex flex-col w-full lg:gap-8 gap-6 py-2'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>What Services Do We Render?</h1>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{about_texts.our_services} <br/>We offer a comprehensive range of services, including:</p>
          <ul className="mt-2 flex flex-col lg:gap-8 gap-6 list-disc list-inside">
            <li className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>
              <span className='font-quicksand text-black dark:text-white font-medium lg:text-lg text-base'>Property Search & Acquisition:</span> {about_texts.service_prop_search}
            </li>
            <li className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>
              <span className='font-quicksand text-black dark:text-white font-medium lg:text-lg text-base'>Sales & Marketing:</span> {about_texts.service_sales_mgt}
            </li>
            <li className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>
              <span className='font-quicksand text-black dark:text-white font-medium lg:text-lg text-base'>Properties Management:</span> {about_texts.service_prop_mgt}
            </li>
            <li className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>
              <span className='font-quicksand text-black dark:text-white font-medium lg:text-lg text-base'>Relocation:</span> {about_texts.service_relocation}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AboutClient
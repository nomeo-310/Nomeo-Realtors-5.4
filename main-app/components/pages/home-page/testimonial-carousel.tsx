'use client'

import React from 'react'
import { ArrowRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { paginate_array } from '@/lib/paginate-array';
import { testimonies } from '@/assets/texts/testimonies';
import TestimonialCard from './testimonial-card';
import { HugeiconsIcon } from '@hugeicons/react';

type itemProps = {
  title: string;
  testimony: string;
  name: string;
  career: string;
  profileImage: string;
}

const TestimonialCarousel = () => {
  const [currentDesktopIndex, setCurrentDesktopIndex] = React.useState(1);
  const [currentMobileIndex, setCurrentMobileIndex] = React.useState(1);
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right'>('right');
  const desktop_page_data = paginate_array(testimonies, 4, currentDesktopIndex);
  const mobile_page_data = paginate_array(testimonies, 2, currentMobileIndex);
  const mobile_gridRef = React.useRef<HTMLDivElement>(null);
  const desktop_gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (desktop_gridRef.current) {
      desktop_gridRef.current.style.transition = 'transform 0.5s ease-in-out';
      desktop_gridRef.current.style.transform = `translateX(${slideDirection === 'right' ? '-100%' : '100%'})`;

      setTimeout(() => {
        if (desktop_gridRef.current) {
          desktop_gridRef.current.style.transition = 'none';
          desktop_gridRef.current.style.transform = 'translateX(0)';
        }
      }, 500);
    }
  }, [desktop_page_data, slideDirection]);

  React.useEffect(() => {
    if (mobile_gridRef.current) {
      mobile_gridRef.current.style.transition = 'transform 0.5s ease-in-out';
      mobile_gridRef.current.style.transform = `translateX(${slideDirection === 'right' ? '-100%' : '100%'})`;

      setTimeout(() => {
        if (mobile_gridRef.current) {
          mobile_gridRef.current.style.transition = 'none';
          mobile_gridRef.current.style.transform = 'translateX(0)';
        }
      }, 500);
    }
  }, [mobile_page_data, slideDirection]);

  const desktopNextButton = () => {
    if (currentDesktopIndex < desktop_page_data.totalPages) {
      setCurrentDesktopIndex(currentDesktopIndex + 1);
      setSlideDirection('right');
    }
  }

  const desktopPreviousButton = () => {
    if (currentDesktopIndex > 1) {
      setCurrentDesktopIndex(currentDesktopIndex - 1);
      setSlideDirection('left');
    }
  }

  const mobilePreviousButton = () => {
    if (currentMobileIndex > 1) {
      setCurrentMobileIndex(currentMobileIndex - 1);
      setSlideDirection('left');
    }
  }

  const mobileNextButton = () => {
    if (currentMobileIndex < mobile_page_data.totalPages) {
      setCurrentMobileIndex(currentMobileIndex + 1);
      setSlideDirection('right');
    }
  }

  return (
    <React.Fragment>
      <div className="w-full flex-1 md:flex md:flex-row flex-col xl:gap-16 md:gap-10 gap-6 items-end hidden">
        <div className="flex-1 h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2  md:gap-8 xl:gap-14 gap-6" ref={desktop_gridRef}>
          {desktop_page_data.items.map((item:itemProps, index:number) => (
            <TestimonialCard
              key={index}
              content={item.testimony}
              image={item.profileImage}
              name={item.name}
              role={item.career}
            />
          ))}
        </div>
        <div className='flex flex-col gap-6'>
          <button className="border xl:size-12 size-10 rounded-md border-white items-center flex justify-center text-white disabled:hidden" onClick={desktopNextButton} disabled={currentDesktopIndex === desktop_page_data.totalPages}>
            <HugeiconsIcon icon={ArrowRight01Icon} className='xl:size-10 size-7'/>
          </button>
          <button className="border xl:size-12 size-10 rounded-md border-white items-center flex justify-center text-white disabled:hidden" onClick={desktopPreviousButton} disabled={currentDesktopIndex === 1}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className='xl:size-10 size-7'/>
          </button>
        </div>
      </div>
      <div className="w-full flex-1 flex md:flex-row flex-col xl:gap-16 md:gap-10 gap-6 items-end md:hidden">
        <div className="flex-1 h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2  md:gap-8 xl:gap-14 gap-6" ref={mobile_gridRef}>
          {mobile_page_data.items.map((item:itemProps, index:number) => (
            <TestimonialCard
              key={index}
              content={item.testimony}
              image={item.profileImage}
              name={item.name}
              role={item.career}
            />
          ))}
        </div>
        <div className="flex items-center justify-between w-full">
          <button className="border xl:size-12 size-10 rounded-md border-white items-center flex justify-center text-white md:hidden disabled:hidden" onClick={mobileNextButton} disabled={currentMobileIndex === mobile_page_data.totalPages}>
            <HugeiconsIcon icon={ArrowRight01Icon}  className='size-7'/>
          </button>
          <button className="border xl:size-12 size-10 rounded-md border-white items-center flex justify-center text-white md:hidden disabled:hidden" onClick={mobilePreviousButton} disabled={currentMobileIndex === 1}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className='size-7'/>
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default TestimonialCarousel
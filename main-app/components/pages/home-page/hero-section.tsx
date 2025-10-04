'use client'
import React from "react";
import { useOpenMobileMenu } from "@/hooks/general-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import HomeSearchBar from "@/components/pages/home-page/home-searchbar";

const HeroSection = () => {
  const {isOpen } = useOpenMobileMenu();

  return (
    <main className="pt-[61px] lg:pt-[71px] lg:px-8 px-4 xl:h-screen lg:h-[800px] md:h-[700px] h-[calc(100vh_+_100px)] w-full">
      <div className="h-full lg:pt-0 lg:pb-16 md:py-14 py-10">
        <div className="h-full flex flex-col gap-8 lg:gap-0">
          <div className="h-[24%] lg:h-[37%] md:h-[35%] w-full flex lg:flex-row flex-col lg:justify-between pb-10 gap-5 lg:gap-0 xl:items-end lg:items-center">
            <div className={cn("xl:w-[46%] lg:w-[55%] w-full", isOpen && '-z-10')}>
              <h2 className="font-semibold text-[16px] md:text-[18px] lg:text-[32px] xl:text-[34px] leading-normal font-quicksand">Discover a curated selection of modern apartments in Lagos, Oyo, and Ondo. Your ideal home is just a tap away.</h2>
            </div>
            <div className={cn("xl:w-[54%] lg:w-[45%] w-full flex flex-col justify-end", isOpen && '-z-10')}>
              <p className="ml-auto xl:w-[60%] lg:w-[75%] w-full text-sm md:text-base text-black/60 dark:text-white/70">Find the perfect space for your lifestyle. Browse verified listings, schedule inspections, and secure your next apartment in Lagos, Oyo, or Ondo, all within our app. <br/><br/><span className="font-bold text-black dark:text-white font-quicksand">We know the area, We have the best agents so you can say goodbye to stress and settling for less.</span></p>
            </div>
          </div>
          <div className={cn("h-[76%] lg:h-[63%] md:h-[65%] w-full rounded-xl relative", isOpen && '-z-10')}>
            <div className="absolute left-0 top-0 bg-black/30 z-10 w-full h-full rounded-xl"/>
            <Image src={'/images/hero-banner.jpg'} fill alt="hero_banner" className="lg:object-bottom object-center object-cover rounded-xl" priority/>
            <div className="absolute left-0 w-full h-full lg:p-6 p-4 z-30 flex items-end">
              <HomeSearchBar/>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HeroSection
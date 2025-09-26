import { ArrowUpRight03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const LatestBlogs = () => {
  return (
    <div id='latestBlogs' className='w-full flex xl:gap-16 xl:p-16 md:p-10 p-6 flex-col gap-6 pt-[84px] md:pt-[84px] xl:pt-[84px]'>
      <div className='flex flex-col gap-3'>
        <div className="w-full flex items-center justify-between">
          <h2 className='xl:text-3xl md:text-2xl text-lg font-quicksand font-semibold'>Featured Blogs</h2>
          <Link className='text-sm lg:text-base font-semibold text-secondary-blue' href={'/blogs'}>Read more...</Link>
        </div>
        <p className='text-black/60 dark:text-white/70 text-sm md:text-base'>Your one-stop information center for navigating the exciting and ever-changing world of Lagos real estate. Whether you&apos;re a seasoned investor, a first-time homebuyer, a curious renter, or simply someone with a dream of owning property, we&apos;ve got you covered. Here at Nomeo Suites, we&apos;re passionate about empowering you with the knowledge and insights you need to make informed decisions on your real estate journey.</p>
      </div>
      <div className="w-full xl:h-[450px] lg:h-[420px] flex lg:gap-3 flex-col lg:flex-row gap-8">
        <div className="rounded-xl lg:w-1/4 flex flex-col overflow-hidden w-full h-[360px] md:h-[420px] lg:h-full">
          <div className="relative overflow-hidden rounded-xl flex-1">
            <Image src={'/images/blog_2.jpg'} alt='blog_banner' fill className='object-cover object-center'/>
          </div>
          <div className="w-full h-[200px] md:h-[160px] lg:h-[200px] pt-2 justify-between flex flex-col">
            <h2 className='text-base font-quicksand line-clamp-2 font-semibold'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repudiandae aliquam molestiae at dicta iste voluptatum sed velit rem, laboriosam minima suscipit veritatis, vel ratione inventore nostrum magni earum autem atque.</h2>
            <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vero, dolorem recusandae assumenda quis debitis cupiditate quidem error id magni blanditiis sapiente nihil repellendus iure molestias, nesciunt dolores totam exercitationem atque necessitatibus? Adipisci accusantium quo illo amet, sequi harum ab voluptatum libero! Voluptatem saepe quod velit tenetur quibusdam nesciunt, iusto optio.</div>
            <div className='flex lg:flex flex-col gap-1 md:hidden'>
              <p className='text-sm font-semibold'>Adeniyi Adetokumbo.</p>
              <p className='text-sm'>24 May, 2024.</p>
              <div className="flex items-center justify-between">
                <p className='text-sm'>3 Mins Read.</p>
                <HugeiconsIcon icon={ArrowUpRight03Icon}/>
              </div>
            </div>
            <div className='md:flex md:items-center items-end justify-between lg:hidden hidden '>
              <div className='flex md:flex-row md:items-center md:gap-3 gap-1 flex-col items-stretch'>
                <p className='text-sm font-semibold'>Adeniyi Adetokumbo.</p>
                <p className='text-sm'>24 May, 2024.</p>
                <p className='text-sm'>3 Mins Read.</p>
              </div>
              <HugeiconsIcon icon={ArrowUpRight03Icon}/>
            </div>
          </div>
        </div>
        <div className="rounded-xl flex flex-col overflow-hidden lg:w-1/2 w-full  h-[360px] md:h-[420px] lg:h-full">
          <div className="relative overflow-hidden rounded-xl flex-1">
            <Image src={'/images/blog_1.jpg'} alt='blog_banner' fill className='object-cover object-center'/>
          </div>
          <div className="w-full h-[200px] md:h-[160px] pt-2 flex flex-col justify-between">
            <h2 className='font-semibold xl:text-lg text-base font-quicksand line-clamp-2'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repudiandae aliquam molestiae at dicta iste voluptatum sed velit rem, laboriosam minima suscipit veritatis, vel ratione inventore nostrum magni earum autem atque.</h2>
            <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vero, dolorem recusandae assumenda quis debitis cupiditate quidem error id magni blanditiis sapiente nihil repellendus iure molestias, nesciunt dolores totam exercitationem atque necessitatibus? Adipisci accusantium quo illo amet, sequi harum ab voluptatum libero! Voluptatem saepe quod velit tenetur quibusdam nesciunt, iusto optio.</div>
            <div className='md:flex items-center justify-between hidden lg:flex'>
              <div className='flex items-center gap-3'>
                <p className='text-sm font-semibold'>Adeniyi Adetokumbo.</p>
                <p className='text-sm'>24 May, 2024.</p>
                <p className='text-sm'>3 Mins Read.</p>
              </div>
              <HugeiconsIcon icon={ArrowUpRight03Icon}/>
            </div>
            <div className='flex flex-col gap-1 md:hidden'>
              <p className='text-sm font-semibold'>Adeniyi Adetokumbo.</p>
              <p className='text-sm'>24 May, 2024.</p>
              <div className="flex items-center justify-between">
                <p className='text-sm'>3 Mins Read.</p>
                <HugeiconsIcon icon={ArrowUpRight03Icon}/>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl lg:w-1/4 flex flex-col overflow-hidden w-full h-[360px] md:h-[420px] lg:h-full">
          <div className="relative overflow-hidden rounded-xl flex-1">
            <Image src={'/images/blog_3.jpg'} alt='blog_banner' fill className='object-cover object-center'/>
          </div>
          <div className="w-full lg:h-[200px] md:h-[160px] h-[200px] pt-2 justify-between flex flex-col">
            <h2 className='text-base font-quicksand line-clamp-2 font-semibold'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Repudiandae aliquam molestiae at dicta iste voluptatum sed velit rem, laboriosam minima suscipit veritatis, vel ratione inventore nostrum magni earum autem atque.</h2>
            <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vero, dolorem recusandae assumenda quis debitis cupiditate quidem error id magni blanditiis sapiente nihil repellendus iure molestias, nesciunt dolores totam exercitationem atque necessitatibus? Adipisci accusantium quo illo amet, sequi harum ab voluptatum libero! Voluptatem saepe quod velit tenetur quibusdam nesciunt, iusto optio.</div>
            <div className='lg:flex flex-col gap-1 md:hidden flex '>
              <p className='text-sm font-semibold'>Adeniyi Adetokumbo.</p>
              <p className='text-sm'>24 May, 2024.</p>
              <div className="flex items-center justify-between">
                <p className='text-sm'>3 Mins Read.</p>
                <HugeiconsIcon icon={ArrowUpRight03Icon}/>
              </div>
            </div>
            <div className='md:flex items-center justify-between lg:hidden hidden'>
              <div className='flex items-center gap-3'>
                <p className='text-sm font-semibold'>Adeniyi Adetokumbo.</p>
                <p className='text-sm'>24 May, 2024.</p>
                <p className='text-sm'>3 Mins Read.</p>
              </div>
              <HugeiconsIcon icon={ArrowUpRight03Icon}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LatestBlogs
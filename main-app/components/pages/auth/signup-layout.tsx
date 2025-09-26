'use client'

import React from 'react'
import Image from 'next/image'
import AnimationWrapper from './animation-wrapper'

const SignUpLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <section className='relative w-full h-screen'>
      <div className='absolute left-0 top-0 w-full h-full bg-black/50 z-10'/>
      <Image src={'/images/sign-up-banner.jpg'} alt='signup_banner' fill className='object-cover object-center' priority/>
      <div className='absolute left-0 top-0 z-30 md:p-10 p-3 lg:p-20 text-white w-full h-full flex items-center'>
        <AnimationWrapper className="w-full flex items-center flex-col lg:flex-row gap-6 md:gap-12">
          {children}
        </AnimationWrapper>
      </div>
    </section>
  )
}

export default SignUpLayout
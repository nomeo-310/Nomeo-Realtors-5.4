'use client'

import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, CopyrightIcon, EntranceStairsIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCookiesModal, usePrivacyPolicyModal, useTermsOfServiceModal } from '@/hooks/general-store';

const AuthLayout = ({children}:{children:React.ReactNode}) => {
  const router = useRouter();
    const date:Date = new Date();
    const cookieControl = useCookiesModal();
    const privacyControl = usePrivacyPolicyModal();
    const termsControl = useTermsOfServiceModal()

  return (
    <React.Fragment>
      <div className="pl-0 xl:pl-0 absolute md:top-10 top-8 lg:top-12 md:left-10 left-3 lg:left-20 z-[4000] flex items-center text-white gap-2 lg:gap-3 py-2 px-3 xl:px-4 rounded-full">
        <HugeiconsIcon icon={EntranceStairsIcon} className='size-5 md:size-6'/>
        <p className='text-sm md:text-base'>Nomeo Realtors</p>
      </div>
      <button type="button" className='absolute md:top-10 top-8 lg:top-12 md:right-10 right-3 lg:right-20 z-[4000] text-white py-2 px-3 xl:px-4 pr-0 xl:pr-0' onClick={() => router.back()}>
        <HugeiconsIcon icon={Cancel01Icon} className='size-5 md:size-6'/>
      </button>
      {children}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 absolute left-0 md:bottom-8 lg:bottom-10 bottom-6 w-full md:px-10 lg:px-20 px-3 text-white z-[4000]">
        <div className='flex items-center gap-1 md:justify-start justify-center'>
          <HugeiconsIcon icon={CopyrightIcon} className='size-4'/>
          <h2 className='text-sm'>{date.getFullYear()} Nomeo Realtors. All Rights Reserved.</h2>
        </div>
        <div className="flex gap-4 md:justify-start justify-center">
          <button className='hover:underline text-sm' onClick={() => termsControl.onOpen()}>Terms of Service</button>
          <button className='hover:underline text-sm' onClick={() => privacyControl.onOpen()}>Privacy Policy</button>
          <button className='hover:underline text-sm' onClick={() => cookieControl.onOpen()}>Cookies</button>
        </div>
      </div>
    </React.Fragment>
  )
};

export default AuthLayout
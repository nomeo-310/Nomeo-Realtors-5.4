'use client'

import { useCookiesModal, usePrivacyPolicyModal, useTermsOfServiceModal } from '@/hooks/general-store';
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { CopyrightIcon } from '@hugeicons/core-free-icons';

const FooterBottom = () => {

  const date:Date = new Date();
  const cookieControl = useCookiesModal();
  const privacyControl = usePrivacyPolicyModal();
  const termsControl = useTermsOfServiceModal()
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between gap-4 pt-10">
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
  )
};

export default FooterBottom
'use client'

import { useCookiesModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import { cookies_settings } from '@/assets/texts/terms';

const Cookies = () => {
  const cookieControl = useCookiesModal();
  
  return (
    <Modal
      isOpen={cookieControl.isOpen}
      onClose={cookieControl.onClose}
      useCloseButton
      title={cookies_settings.title}
      useSeparator
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
    >
      <p className="text-sm lg:mt-5 mt-3">{cookies_settings.content}</p>
    </Modal>
  )
}

export default Cookies;
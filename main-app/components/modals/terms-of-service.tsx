'use client'

import { useTermsOfServiceModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import { terms_of_service } from '@/assets/texts/terms';

const TermsOfService = () => {
  const serviceControl = useTermsOfServiceModal();
  return (
    <Modal
      isOpen={serviceControl.isOpen}
      useCloseButton
      onClose={serviceControl.onClose}
      title={terms_of_service.title}
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
    >
      <p className="text-sm lg:mt-5 mt-3">{terms_of_service.content}</p>
    </Modal>
  )
}

export default TermsOfService
'use client'

import { useTermsAndConditionModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import { terms_and_conditions } from '@/assets/texts/terms';

const TermsAndCondition = () => {
  const termsControl = useTermsAndConditionModal();

  return (
    <Modal
      useCloseButton
      title={terms_and_conditions.title}
      isOpen={termsControl.isOpen}
      onClose={termsControl.onClose}
      useSeparator
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
    >
      <p className='text-sm lg:mt-5 mt-3'>{terms_and_conditions.content}</p>
    </Modal>
  )
}

export default TermsAndCondition
'use client'

import { usePrivacyPolicyModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import { privacy_policy } from '@/assets/constants/terms';

const PrivacyPolicy = () => {
  const privacyPolicyControl = usePrivacyPolicyModal();

  return (
    <Modal
      useCloseButton
      title={privacy_policy.title}
      isOpen={privacyPolicyControl.isOpen}
      onClose={privacyPolicyControl.onClose}
      width='lg:w-[600px] xl:w-[700px] md:w-[550px]'
    >
      <p className='text-sm lg:mt-5 mt-3'>{privacy_policy.content}</p>
    </Modal>
  )
}

export default PrivacyPolicy
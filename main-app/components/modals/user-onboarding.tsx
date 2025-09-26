'use client'

import { useUserOnboardingModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import UserMultiStepForm from '../on-boarding/user-multistep-form';
import { userDetails } from '@/lib/types';

const UserOnBoarding = ({user}:{user:userDetails}) => {
  const onboardingControl = useUserOnboardingModal();

  return (
    <Modal
      isOpen={onboardingControl.isOpen}
      onClose={onboardingControl.onClose}
      useCloseButton={false}
      title='Create User Profile'
      useSeparator
      width='xl:w-[600px] lg:w-[550px] md:w-[550px]'
    >
     <UserMultiStepForm user={user}/>
    </Modal>
  )
}

export default UserOnBoarding;
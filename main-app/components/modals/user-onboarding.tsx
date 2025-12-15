'use client'

import { useUserOnboardingModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import UserMultiStepForm from '../on-boarding/user-multistep-form';
import { userDetails } from '@/lib/types';
import ScrollableWrapper from '../ui/scrollable-wrapper';

const UserOnBoarding = ({user}:{user:userDetails}) => {
  const onboardingControl = useUserOnboardingModal();

  React.useEffect(() => {
    if (user && !user.userOnboarded) {
      onboardingControl.onOpen();
    }
  }, [user, onboardingControl]);

  return (
    <Modal
      isOpen={onboardingControl.isOpen}
      onClose={onboardingControl.onClose}
      useCloseButton={false}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      title=''
      width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
    >
      <ScrollableWrapper>
        <UserMultiStepForm user={user}/>
      </ScrollableWrapper>
    </Modal>
  )
}

export default UserOnBoarding;
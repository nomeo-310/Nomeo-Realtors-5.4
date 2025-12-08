'use client'

import { useAgentOnboardingModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import AgentMultiStepForm from '../on-boarding/agent-multistep-form';
import { userDetails } from '@/lib/types';
import ScrollableWrapper from '../ui/scrollable-wrapper';

const AgentOnBoarding = ({user}:{user:userDetails}) => {
  const onboardingControl = useAgentOnboardingModal();

  React.useEffect(() => {
    if (user && !user.userOnboarded) {
      onboardingControl.onOpen();
    }
  }, [user]);

  return (
    <Modal
      isOpen={onboardingControl.isOpen}
      onClose={onboardingControl.onClose}
      useCloseButton={false}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      title= ''
      width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
    >
      <ScrollableWrapper>
        <AgentMultiStepForm user={user}/>
      </ScrollableWrapper>
    </Modal>
  )
}

export default AgentOnBoarding;
'use client'

import { useAgentOnboardingModal } from '@/hooks/general-store';
import React from 'react'
import Modal from '../ui/modal';
import AgentMultiStepForm from '../on-boarding/agent-multistep-form';
import { userDetails } from '@/lib/types';

const AgentOnBoarding = ({user}:{user:userDetails}) => {
  const onboardingControl = useAgentOnboardingModal();

  return (
    <Modal
      isOpen={onboardingControl.isOpen}
      onClose={onboardingControl.onClose}
      useCloseButton={false}
      title= 'Create Agent Profile'
      useSeparator
      width='xl:w-[600px] lg:w-[550px] md:w-[550px]'
    >
      <AgentMultiStepForm user={user}/>
    </Modal>
  )
}

export default AgentOnBoarding;
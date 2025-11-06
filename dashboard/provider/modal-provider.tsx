import React from 'react'
import Cookies from '@/components/modals/cookies'
import PrivacyPolicy from '@/components/modals/privacy-policy'
import TermsAndCondition from '@/components/modals/terms-and-condition'
import TermsOfService from '@/components/modals/terms-of-service'
import AgentRejectionModal from '@/components/modals/agent-rejection-modal'
import PropertyRejectionModal from '@/components/modals/property-rejection-modal'

const ModalProvider = async () => {

  return (
    <React.Fragment>
      <Cookies/>
      <TermsAndCondition/>
      <TermsOfService/>
      <PrivacyPolicy/>
      <AgentRejectionModal/>
      <PropertyRejectionModal/>
    </React.Fragment>
  )
}

export default ModalProvider
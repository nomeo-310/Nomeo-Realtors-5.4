import React from 'react'
import Cookies from '@/components/modals/cookies'
import PrivacyPolicy from '@/components/modals/privacy-policy'
import TermsAndCondition from '@/components/modals/terms-and-condition'
import TermsOfService from '@/components/modals/terms-of-service'

const ModalProvider = async () => {

  return (
    <React.Fragment>
      <Cookies/>
      <TermsAndCondition/>
      <TermsOfService/>
      <PrivacyPolicy/>
    </React.Fragment>
  )
}

export default ModalProvider
import Cookies from '@/components/modals/cookies'
import PrivacyPolicy from '@/components/modals/privacy-policy'
import TermsAndCondition from '@/components/modals/terms-and-condition'
import TermsOfService from '@/components/modals/terms-of-service'
import React from 'react'
import UserOnBoarding from '@/components/modals/user-onboarding'
import AgentOnBoarding from '@/components/modals/agent-onboarding'
import { userDetails } from '@/lib/types'
import InspectionTerms from '@/components/modals/inspection-terms'
import StartRentOut from '@/components/modals/start-rentout'
import TransactionModal from '@/components/modals/transaction-modal'
import PaymentModal from '@/components/modals/payment-modal'
import DeleteAccount from '@/components/modals/delete-account'
import TransferAccount from '@/components/modals/transfer-account'
import DeleteProperty from '@/components/modals/delete-property'
import { getCurrentUserDetails } from '@/actions/user-actions'
import RenewalReminder from '@/components/modals/renewal-reminder'
import ContactUserModal from '@/components/modals/contact-user'
import RentExtensionsModal from '@/components/modals/rent-extension'
import ContactAgent from '@/components/modals/contact-agent'

const ModalProvider = async () => {
  const user:userDetails = await getCurrentUserDetails();

  return (
    <React.Fragment>
      <Cookies/>
      <TermsAndCondition/>
      <TermsOfService/>
      <PrivacyPolicy/>
      {user && user.role === 'user' && <UserOnBoarding user={user}/>}
      {user && user.role === 'agent' && <AgentOnBoarding user={user}/>}
      <InspectionTerms/>
      <StartRentOut/>
      <TransactionModal user={user}/>
      <PaymentModal/>
      {user && <DeleteAccount />}
      {user && user.role === 'agent' &&<TransferAccount/>}
      <TransferAccount/>
      {user && user.role === 'agent' && <DeleteProperty user={user}/>}
      <RenewalReminder/>
      <ContactUserModal/>
      <ContactAgent/>
      <RentExtensionsModal/>
    </React.Fragment>
  )
}

export default ModalProvider
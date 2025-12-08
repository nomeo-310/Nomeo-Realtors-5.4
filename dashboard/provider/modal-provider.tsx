import React from 'react'
import Cookies from '@/components/modals/cookies'
import PrivacyPolicy from '@/components/modals/privacy-policy'
import TermsAndCondition from '@/components/modals/terms-and-condition'
import TermsOfService from '@/components/modals/terms-of-service'
import AgentRejectionModal from '@/components/modals/agent-rejection-modal'
import PropertyRejectionModal from '@/components/modals/property-rejection-modal'
import MessageUserModal from '@/components/modals/message-user-modal'
import RoleAssignmentModal from '@/components/modals/role-assignment-modal'
import RevokeVerificationModal from '@/components/modals/revoke-verification-modal'
import BlockUserModal from '@/components/modals/delete-user-modal'
import SuspendUserModal from '@/components/modals/suspend-user-modal'
import VerificationReminderModal from '@/components/modals/verification-reminder-modal'
import DeletionReminderModal from '@/components/modals/deletion-reminder-modal'
import CreateAdminModal from '@/components/modals/create-admin-modal'
import OnboardingModal from '@/components/modals/onboarding-modal'
import { getCurrentUser } from '@/actions/auth-actions'
import DeactivateUserModal from '@/components/modals/deactivate-user-modal'

const ModalProvider = async () => {
  const currentUser = await getCurrentUser();

  return (
    <React.Fragment>
      <Cookies/>
      <TermsAndCondition/>
      <TermsOfService/>
      <PrivacyPolicy/>
      <AgentRejectionModal/>
      <PropertyRejectionModal/>
      <MessageUserModal/>
      <RoleAssignmentModal/>
      <RevokeVerificationModal/>
      <BlockUserModal/>
      <SuspendUserModal/>
      <VerificationReminderModal/>
      <DeletionReminderModal/>
      <CreateAdminModal/>
      { currentUser && <OnboardingModal user={currentUser}/> }
      <DeactivateUserModal/>
    </React.Fragment>
  )
}

export default ModalProvider
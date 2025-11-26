import AppealSuspensionForm from '@/components/pages/auth/appeal-suspension-form'
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Suspension Appeal',
}

const AppealSuspension = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/agent-sign-up-banner.jpg'} altText='agent_signup_banner'>
      <AppealSuspensionForm/>
    </AuthContentWrapper>
  )
}

export default AppealSuspension
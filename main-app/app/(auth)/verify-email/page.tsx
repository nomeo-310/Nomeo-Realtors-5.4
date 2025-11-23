import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'
import VerifyAccountForm from '@/components/pages/auth/verify-account'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Verification',
}

const VerifyEmail = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/agent-sign-up-banner.jpg'} altText='agent_signup_banner'>
      <VerifyAccountForm/>
    </AuthContentWrapper>
  )
}

export default VerifyEmail
import React from 'react'
import { Metadata } from 'next'
import AgentSignUpForm from '@/components/pages/auth/agent-sign-up-form'
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'

export const metadata: Metadata = {
  title: 'Sign Up',
}

const SignUp = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/agent-sign-up-banner.jpg'} altText='agent_signup_banner'>
      <AgentSignUpForm/>
    </AuthContentWrapper>
  )
}

export default SignUp
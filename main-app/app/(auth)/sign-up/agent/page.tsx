import React from 'react'
import { Metadata } from 'next'
import SignUpLayout from '@/components/pages/auth/signup-layout'
import AgentSignUpForm from '@/components/pages/auth/agent-sign-up-form'

export const metadata: Metadata = {
  title: 'Sign Up',
}

const SignUp = () => {
  return (
    <SignUpLayout>
      <AgentSignUpForm/>
    </SignUpLayout>
  )
}

export default SignUp
import React from 'react'
import { Metadata } from 'next'
import SignUpLayout from '@/components/pages/auth/signup-layout'
import SignUpForm from '@/components/pages/auth/user-sign-up-form'

export const metadata: Metadata = {
  title: 'Sign Up',
}

const SignUp = () => {
  return (
    <SignUpLayout>
      <SignUpForm/>
    </SignUpLayout>
  )
}

export default SignUp
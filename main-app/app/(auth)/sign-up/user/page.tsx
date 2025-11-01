import React from 'react'
import { Metadata } from 'next'
import SignUpForm from '@/components/pages/auth/user-sign-up-form'
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'

export const metadata: Metadata = {
  title: 'Sign Up',
}

const SignUp = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/sign-up-banner.jpg'} altText='user_signup_banner'>
      <SignUpForm/>
    </AuthContentWrapper>
  )
}

export default SignUp
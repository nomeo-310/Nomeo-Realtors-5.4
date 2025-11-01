import ForgotPasswordForm from '@/components/pages/auth/forgot-password-form'
import { Metadata } from 'next'
import React from 'react'
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'

export const metadata: Metadata = {
  title: 'Forgot Password',
}

const ResetPassword = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/log-in-banner.jpg'} altText='login_banner'>
      <ForgotPasswordForm/>
    </AuthContentWrapper>
  )
}

export default ResetPassword
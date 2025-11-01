import React from 'react'
import { Metadata } from 'next'
import SendOtpForm from '@/components/pages/auth/send-otp-form'
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'

export const metadata: Metadata = {
  title: 'Reset Pasword',
}

const ResetPassword = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/log-in-banner.jpg'} altText='login_banner'>
      <SendOtpForm/>
    </AuthContentWrapper>
  )
}

export default ResetPassword
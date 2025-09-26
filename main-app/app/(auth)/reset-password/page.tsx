import React from 'react'
import LoginLayout from '@/components/pages/auth/login-layout'
import { Metadata } from 'next'
import SendOtpForm from '@/components/pages/auth/send-otp-form'

export const metadata: Metadata = {
  title: 'Reset Pasword',
}

const ResetPassword = () => {
  return (
    <LoginLayout>
      <SendOtpForm/>
    </LoginLayout>
  )
}

export default ResetPassword
import LoginLayout from '@/components/pages/auth/login-layout'
import ForgotPasswordForm from '@/components/pages/auth/forgot-password-form'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Forgot Password',
}

const ResetPassword = () => {
  return (
    <LoginLayout>
      <ForgotPasswordForm/>
    </LoginLayout>
  )
}

export default ResetPassword
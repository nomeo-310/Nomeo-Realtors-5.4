import React from 'react'
import { Metadata } from 'next'
import AuthContentWrapper from '@/components/auth-features/auth-content-wrapper'
import SetPasswordForm from '@/components/auth-features/set-password-form'

export const metadata: Metadata = {
  title: 'Set Password',
}

const SetPasswordPage = () => {
  return (
    <AuthContentWrapper bannerImage='/images/banner_2.jpg' altText='setup_banner'>
      <SetPasswordForm/>
    </AuthContentWrapper>
  )
}

export default SetPasswordPage
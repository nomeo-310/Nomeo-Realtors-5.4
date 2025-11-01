import React from 'react'
import { Metadata } from 'next'
import AuthContentWrapper from '@/components/auth-features/auth-content-wrapper'
import LoginForm from '@/components/auth-features/log-in-form'

export const metadata: Metadata = {
  title: 'Login',
}

const LoginPage = () => {
  return (
    <AuthContentWrapper bannerImage='/images/banner_2.jpg' altText='setup_banner'>
      <LoginForm/>
    </AuthContentWrapper>
  )
}

export default LoginPage
import React from 'react'
import { Metadata } from 'next'
import LoginForm from '@/components/pages/auth/login-form'
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'

export const metadata: Metadata = {
  title: 'Login',
}

const Login = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/log-in-banner.jpg'} altText='login_banner'>
      <LoginForm/>
    </AuthContentWrapper>
  )
}

export default Login
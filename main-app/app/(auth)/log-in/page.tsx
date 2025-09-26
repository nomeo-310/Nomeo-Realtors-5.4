import React from 'react'
import { Metadata } from 'next'
import LoginLayout from '@/components/pages/auth/login-layout'
import LoginForm from '@/components/pages/auth/login-form'

export const metadata: Metadata = {
  title: 'Login',
}

const Login = () => {
  return (
    <LoginLayout>
      <LoginForm/>
    </LoginLayout>
  )
}

export default Login
import AuthContentWrapper from '@/components/pages/auth/auth-content-wrapper'
import RestoreAccountForm from '@/components/pages/auth/restore-account'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Restore Account',
}

const page = () => {
  return (
    <AuthContentWrapper bannerImage={'/images/sign-up-banner.jpg'} altText='user_signup_banner'>
      <RestoreAccountForm/>
    </AuthContentWrapper>
  )
}

export default page
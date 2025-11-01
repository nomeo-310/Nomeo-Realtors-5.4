import React from 'react'
import { Metadata } from 'next'
import AuthContentWrapper from '@/components/auth-features/auth-content-wrapper'
import SetUpForm from '@/components/auth-features/set-up-form'

export const metadata: Metadata = {
  title: 'Account SetUp',
}

const SetUpPage = () => {
  return (
    <AuthContentWrapper bannerImage='/images/banner_2.jpg' altText='setup_banner'>
      <SetUpForm/>
    </AuthContentWrapper>
  )
}

export default SetUpPage
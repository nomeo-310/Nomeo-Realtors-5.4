import React from 'react'
import { Metadata } from 'next'
import AuthContentWrapper from '@/components/auth-features/auth-content-wrapper'
import AppealForm from '@/components/auth-features/appeal-form'

export const metadata: Metadata = {
  title: 'Appeal',
}

const AppealPage = () => {
  return (
    <AuthContentWrapper bannerImage='/images/banner_2.jpg' altText='setup_banner'>
      <AppealForm/>
    </AuthContentWrapper>
  )
}

export default AppealPage
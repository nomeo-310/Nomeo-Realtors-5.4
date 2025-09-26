import SignUpLayout from '@/components/pages/auth/signup-layout'
import VerifyAccountForm from '@/components/pages/auth/verify-account'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Verification',
}

const VerifyEmail = () => {
  return (
    <SignUpLayout>
      <VerifyAccountForm/>
    </SignUpLayout>
  )
}

export default VerifyEmail
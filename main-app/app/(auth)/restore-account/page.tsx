import RestoreAccountForm from '@/components/pages/auth/restore-account'
import SignUpLayout from '@/components/pages/auth/signup-layout'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Restore Account',
}

const page = () => {
  return (
    <SignUpLayout>
      <RestoreAccountForm/>
    </SignUpLayout>
  )
}

export default page
import React from 'react'
import UserTransactionClient from '@/components/pages/dashboard/user-transaction-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transctions',
};

const TransactionPage = () => {
  return <UserTransactionClient/>
}

export default TransactionPage
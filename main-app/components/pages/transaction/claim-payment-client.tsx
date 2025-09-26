'use client'

import React from 'react'
import TransactionLayout from './transaction-layout'
import ClaimRewardCard from '@/components/cards/claim-reward-card'

const ClaimPaymentClient = () => {
  return (
    <TransactionLayout>
      <div className="flex flex-col">
        <ClaimRewardCard/>
        <ClaimRewardCard/>
      </div>
    </TransactionLayout>
  )
}

export default ClaimPaymentClient
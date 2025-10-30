'use client'

import React from 'react'
import TransactionLayout from './transaction-layout'
import ClaimRewardCard from '@/components/cards/claim-reward-card'

const ClaimPaymentClient = () => {
  return (
    <TransactionLayout>
      <div className="flex flex-col w-full lg:w-[80%] xl:w-[70%] md:w-[80%]">
        <ClaimRewardCard/>
        <ClaimRewardCard/>
      </div>
    </TransactionLayout>
  )
}

export default ClaimPaymentClient
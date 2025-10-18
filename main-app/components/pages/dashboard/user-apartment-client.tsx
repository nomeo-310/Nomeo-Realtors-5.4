'use client'

import { clients } from '@/assets/test_data'
import AgentCard from '@/components/cards/agent-card'
import { userProps } from '@/lib/types'
import React from 'react'

const UserApartmentClient = ({user}:{user:userProps}) => {
  const property = clients.splice(0, 3)
  return (
    <div className='w-full lg:w-[80%] xl:w-[70%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Apartments</h2>
      </div>
      <div>
        {property.map((item) => (
          <AgentCard client={item} key={item._id} />
        ))}  
      </div>
    </div>
  )
}

export default UserApartmentClient
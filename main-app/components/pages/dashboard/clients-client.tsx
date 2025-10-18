'use client'

import { clients } from '@/assets/test_data';
import ClientCard from '@/components/cards/client-card';
import { userProps } from '@/lib/types';
import React from 'react'

const ClientsClient = ({user}:{user:userProps}) => {

  return (
    <div className='w-full lg:w-[80%] xl:w-[70%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Clients</h2>
      </div>
      <div>
        {clients.splice(0, 3).map((item) => (
          <ClientCard client={item} key={item._id} />
        ))}  
      </div>
    </div>
  )
}

export default ClientsClient;
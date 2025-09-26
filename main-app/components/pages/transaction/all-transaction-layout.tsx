'use client'

import { ArrowUpRightIcon, SearchIcon } from '@/components/ui/icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const TransactionLayout = ({children}:{children: React.ReactNode}) => {
  const pathname = usePathname();

  const TabButton = ({path, label}:{path:string, label:string}) => {
    return (
      <Link className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase", path === pathname ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} href={path}>{label}
      </Link>
    )
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Transactions</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full flex">
          <TabButton path='/admin-dashboard/transactions' label='Rentals'/>
          <TabButton path='/agent-dashboard/transactions/payment-history' label='Sales'/>
        </div>
        { pathname === '/agent-dashboard/transactions/payment-history' &&
          <div className="w-full md:w-[60%] xl:w-[40%] flex gap-1 mb-6">
            <InputWithIcon 
              type='text' 
              icon={SearchIcon}
              iconClassName='text-black/60 dark:text-white/70'
              className=' dark:border-white/70 rounded-r-none'
              placeholder='search transaction history'
              inputClassName='placeholder:text-black/70 border dark:border-white/70 rounded-lg rounded-r-none dark:placeholder:text-white'
            />
            <button type="button" className='lg:h-12 h-10 aspect-square rounded-lg flex items-center justify-center border dark:border-white/70 rounded-l-none'>
              <ArrowUpRightIcon className='rotate-45 text-black/60 dark:text-white/70'/>
            </button>
          </div>
        }
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default TransactionLayout
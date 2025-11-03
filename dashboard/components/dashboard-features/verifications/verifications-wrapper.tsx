'use client'


import { AdminDetailsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { apiRequestHandler } from '@/utils/apiRequestHandler';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

type buttonProps = {
  tab: string; 
  counts: number
  label: string;
}

type countProps = {
  unverifiedAgents: number;
  pendingProperties: number;
  pendingRentals: number;
}

const VerificationsWrapper = ({children, user}:{children:React.ReactNode, user: AdminDetailsProps}) => {

  const pathname = usePathname();

  const countRequest = () => axios.get('/api/admin/verification-counts');

  const { data } = useQuery({
    queryKey: ['verification-counts'],
    queryFn: () => apiRequestHandler(countRequest),
    refetchInterval: 3000,
    refetchIntervalInBackground: true
  })

  const totalCounts = data?.data as countProps;

  const TabButton = ({tab, counts, label}:buttonProps) => {
    return (
      <Link className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase flex items-center justify-center gap-4", tab === pathname ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} href={tab}>{label} { counts > 0 && <span className='tabular-nums text-sm bg-red-500 text-white size-6 rounded-full flex items-center justify-center'>{counts}</span>}
      </Link>
    )
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Verifications</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full flex">
          <TabButton label='Agents' counts={totalCounts?.unverifiedAgents} tab={`/${user.role === 'superAdmin' ? 'superadmin': user.role}-dashboard/verifications`}/>
          <TabButton label='Rentals' tab={`/${user.role === 'superAdmin' ? 'superadmin': user.role}-dashboard/verifications/rentals`} counts={totalCounts?.pendingRentals}/>
          <TabButton label='Apartments' counts={totalCounts?.pendingProperties} tab={`/${user.role === 'superAdmin' ? 'superadmin': user.role}-dashboard/verifications/apartments`}/>
          <div className="flex-1 border-b dark:border-b-white/80"/>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default VerificationsWrapper
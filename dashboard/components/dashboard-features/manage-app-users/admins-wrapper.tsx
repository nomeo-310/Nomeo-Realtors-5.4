'use client'

import { AdminDetailsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import { SearchSort } from '../search-sort';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { useCreateAdminModal } from '@/hooks/general-store';

type buttonProps = {
  tab: string; 
  counts: number
  label: string;
  className?: string;
}

interface wrapperProps {
  children:React.ReactNode, 
  user: AdminDetailsProps
}

interface WrapperProps extends wrapperProps {
  placeholder?: string;
  searchDelay?: number;
  namespace?: string;
  maxWidth?: string; 
}

const AdminsWrapper = ({children, user}:wrapperProps) => {

  const pathname = usePathname();
  const { onOpen } = useCreateAdminModal();

  const TabButton = ({tab, counts, label, className}:buttonProps) => {
    return (
      <Link className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase flex items-center justify-center gap-4", tab === pathname ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70', className)} href={tab} prefetch>{label} { counts > 0 && <span className='tabular-nums text-sm bg-red-500 text-white size-6 rounded-full flex items-center justify-center'>{counts}</span>}
      </Link>
    )
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Manage Admins</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full flex">
          <button className='h-full rounded-md border border-secondary-blue bg-secondary-blue text-white  text-xs lg:text-sm uppercase px-2 lg:px-3 mr-4 flex items-center sm:gap-3 cursor-pointer ' title='Create Admin' onClick={() => onOpen()}>
            <HugeiconsIcon icon={PlusSignIcon} className='size-5'/>
            <span className='hidden sm:block'>Create Admin</span>
          </button>
          <TabButton label='Active' counts={0} tab={`/${user.role === 'superAdmin' ? 'superadmin': user.role}-dashboard/manage-admins`}/>
          <TabButton label='Suspended' counts={0} tab={`/${user.role === 'superAdmin' ? 'superadmin': user.role}-dashboard/manage-admins/suspended`}/>
          <TabButton label='Deactivated' counts={0} tab={`/${user.role === 'superAdmin' ? 'superadmin': user.role}-dashboard/manage-admins/deactivated`}/>
          <div className="flex-1 border-b dark:border-b-white/80"/>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminsWrapper
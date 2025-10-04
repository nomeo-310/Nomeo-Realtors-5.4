'use client'



import { userProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ViewIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react'

  const ReadsIndicator = ({reads, user, total_reads}:{reads: string[], user?:userProps, total_reads: number}) => {

    const alreadyRead = user && reads.includes(user?._id as string)
    return (
      <div className='flex items-center gap-2'>
        <div className={cn('size-8 lg:size-9 text-gray-500 items-center justify-center rounded-full flex bg-gray-200', alreadyRead && 'text-secondary-blue bg-blue-200')}>
          <HugeiconsIcon icon={ViewIcon} className='lg:size-6 size-5'/>
        </div>
        <p className={cn('text-sm')}>{total_reads}</p>
      </div>
    );
  };

export default ReadsIndicator;
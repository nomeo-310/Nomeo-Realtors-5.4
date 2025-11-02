'use client'

import { cn } from '@/lib/utils';
import React from 'react'

type emptyStateProps = {
  className?:string;
  message:string;
}

const EmptyState = ({className, message}:emptyStateProps) => {
  return (
    <p className={cn('text-sm md:text-base text-center my-6 bg-[#d4d4d4] dark:bg-[#42424242] mx-auto px-16 py-2 rounded-full',className )}>
      {message}
    </p>
  )
}

export default EmptyState
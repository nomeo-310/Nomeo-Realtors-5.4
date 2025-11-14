'use client'

import { cn } from '@/lib/utils';
import React from 'react'

type emptyStateProps = {
  className?:string;
  message:string;
}

const EmptyState = ({className, message}:emptyStateProps) => {
  return (
    <p className={cn('text-sm md:text-base text-center my-6 mx-auto px-16 py-2 rounded-full text-black/70 dark:text-white/80',className )}>
      {message}
    </p>
  )
}

export default EmptyState
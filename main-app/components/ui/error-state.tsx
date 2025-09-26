'use client'

import { cn } from '@/lib/utils';
import React from 'react'

type emptyStateProps = {
  className?:string;
  message:string;
}

const ErrorState = ({className, message}:emptyStateProps) => {
  return (
    <div>
      <p className={cn('text-sm md:text-base text-center my-6 bg-red-500 mx-auto px-16 py-2 rounded-full text-white',className )}>
        {message}
      </p>
    </div>
  )
}

export default ErrorState
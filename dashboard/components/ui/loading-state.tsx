'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const LoadingState = ({iconStyle, className}:{iconStyle?:string,className?:string}) => {
  return (
    <div className={cn('w-full h-screen flex items-center justify-center bg-transparent', className)}>
      <Loader2 className={cn('size-8 lg:size-9 xl:size-10 animate-spin dark:text-white', iconStyle)}/>
    </div>
  )
}

export default LoadingState
'use client'

import { Comment01Icon } from '@hugeicons/core-free-icons';
import { userProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react'

  const CommentsIndicator = ({total_comments}:{total_comments: number, user?:userProps}) => {
    return (
      <div className='flex items-center gap-2'>
        <div className={cn('size-8 lg:size-9 border-white/60 items-center justify-center rounded-full flex bg-gray-200 text-gray-700')}>
          <HugeiconsIcon icon={Comment01Icon} className='size-5'/>
        </div>
        <p className={cn('text-sm')}>{total_comments}</p>
      </div>
    );
  };

export default CommentsIndicator
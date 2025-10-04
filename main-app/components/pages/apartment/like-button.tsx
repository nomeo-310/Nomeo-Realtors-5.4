'use client'

import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, HeartAddIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { propertyProps, userProps } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { likeProperty } from '@/actions/property-actions';

type Props = {
  property: Partial<propertyProps>;
  user:userProps
};

const LikeButton = ({property, user}: Props) => {
  const pathname = usePathname();
  const alreadyLiked = property.likes?.includes(user?._id);
  const router = useRouter();

  const handleClick = async () => {

    const values = {
      path: pathname,
      propertyId: property._id ?? '',
    };

    if (!user) {
      localStorage.setItem('nextUrl', pathname);
      router.push('/log-in');
    };
    
    await likeProperty(values);
  };

  return (
    <button className={cn("size-8 lg:size-9 flex items-center justify-center rounded-full cursor-pointer", alreadyLiked ? 'bg-red-200' : 'bg-gray-200')} onClick={handleClick}>
      {alreadyLiked ? <HugeiconsIcon icon={FavouriteIcon} className='fill fill-red-500 text-red-700 lg:size-5 size-4'/> : <HugeiconsIcon icon={HeartAddIcon} className='fill fill-gray-500 text-gray-700 md:size-5 size-4'/> }
    </button>
  )
}

export default LikeButton
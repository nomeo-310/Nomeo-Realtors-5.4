'use client'


import { bookmarkProperty } from '@/actions/property-actions';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark01Icon, BookmarkAdd01Icon } from '@hugeicons/core-free-icons';
import { propertyProps, userProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'

type Props = {
  property: Partial<propertyProps>;
  user:userProps
};

const BookmarkButton = ({property, user}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const alreadyBookmarked = property.bookmarks?.includes(user?._id);

  const handleClick = async () => {

    const values = {
      path: pathname,
      propertyId: property._id ?? '',
    };

    if (!user) {
      localStorage.setItem('nextUrl', pathname);
      router.push('/log-in');
    }
    await bookmarkProperty(values)
  };
   
  return (
    <button className={cn("size-8 lg:size-9 flex items-center justify-center rounded-full cursor-pointer", alreadyBookmarked ? 'bg-blue-200': 'bg-gray-200')} onClick={handleClick}>
      <p></p>
      {alreadyBookmarked ? <HugeiconsIcon icon={Bookmark01Icon}  className='fill fill-blue-500 text-blue-700 lg:size-5 size-4'/> : <HugeiconsIcon icon={BookmarkAdd01Icon} className='fill fill-gray-500 text-gray-700 md:size-5 size-4'/> }
    </button>
  )
}

export default BookmarkButton; 
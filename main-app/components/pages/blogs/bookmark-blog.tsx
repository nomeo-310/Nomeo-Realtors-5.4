'use client'


import { bookmarkProperty } from '@/actions/property-actions';
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark01Icon, BookmarkAdd01Icon } from '@hugeicons/core-free-icons';
import { SingleBlog, userProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import { saveBlog } from '@/actions/blog-actions';

type Props = {
  blog: Partial<SingleBlog>;
  user?:userProps
};

const BookmarkBlog = ({blog, user}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const alreadyBookmarked = user && blog.saves?.includes(user?._id);

  const handleClick = async () => {

    const values = {
      path: pathname,
      blogId: blog._id ?? '',
    };

    if (!user) {
      localStorage.setItem('nextUrl', pathname);
      router.push('/log-in');
    }
    await saveBlog(values)
  };
   
  return (
    <div className='flex items-center gap-2'>
      <button className={cn("size-8 lg:size-9 flex items-center justify-center rounded-full cursor-pointer", alreadyBookmarked ? 'bg-blue-200': 'bg-gray-200')} onClick={handleClick}>
        {alreadyBookmarked ? <HugeiconsIcon icon={Bookmark01Icon}  className='fill fill-blue-500 text-blue-700 lg:size-5 size-4'/> : <HugeiconsIcon icon={BookmarkAdd01Icon} className='fill text-gray-700 md:size-5 size-4'/> }
      </button>
      <p className={cn('text-sm')}>{blog?.total_saves}</p>
    </div>
  )
}

export default BookmarkBlog; 
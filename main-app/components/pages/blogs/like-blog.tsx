'use client'

import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, HeartAddIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils'
import { SingleBlog, userProps } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import { likeBlog } from '@/actions/blog-actions';

type Props = {
  blog: Partial<SingleBlog>;
  user?:userProps
};

const LikeBlog = ({blog, user}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const alreadyLiked = user && blog.likes?.includes(user?._id);

  const handleClick = async () => {

    const values = {
      path: pathname,
      blogId: blog._id ?? '',
    };

    if (!user) {
      localStorage.setItem('nextUrl', pathname);
      router.push('/log-in');
    }

    await likeBlog(values);
  };

  return (
    <div className='flex items-center gap-2'>
      <button className={cn("size-8 lg:size-9 flex items-center justify-center rounded-full cursor-pointer", alreadyLiked ? 'bg-red-200' : 'bg-gray-200')} onClick={handleClick}>
        {alreadyLiked ? <HugeiconsIcon icon={FavouriteIcon} className='fill fill-red-500 text-red-700 lg:size-5 size-4'/> : <HugeiconsIcon icon={HeartAddIcon} className='fill text-gray-700 md:size-5 size-4'/> }
      </button>
      <p className={cn('text-sm')}>{blog?.total_likes}</p>
    </div>
  )
}

export default LikeBlog
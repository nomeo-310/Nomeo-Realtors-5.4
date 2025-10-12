'use client'

import React from 'react'
import TabButton from './tab-button';
import { userProps } from '@/lib/types';

const SavesLayout = ({children, user}:{children:React.ReactNode, user:userProps}) => {

  const { bookmarkedApartments, bookmarkedABlogs, showBookmarkedApartments, showBookmarkedBlogs } = user

  const savedBlogsCount = bookmarkedABlogs?.length || 0;
  const savedApartmentCounts = bookmarkedApartments?.length || 0;

  const adminRoles = ['admin', 'superAdmin', 'creator'];

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Saves</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full flex">
          { showBookmarkedBlogs &&
            <TabButton label='Saved Blogs' counts={savedBlogsCount} tab={`/${ adminRoles.includes(user.role) ? 'admin': user.role }-dashboard/saves/blogs`}  className='lg:w-[200px] md:w-[170px] w-[160px]'/>
          }
          { showBookmarkedApartments &&
            <TabButton label='Saved Apartments' counts={savedApartmentCounts} tab={`/${ adminRoles.includes(user.role) ? 'admin': user.role }-dashboard/saves/apartments`} className='lg:w-[200px] md:w-[170px] w-[160px]' />
          }
          <div className="flex-1 border-b dark:border-b-white/80"/>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
};

export default SavesLayout
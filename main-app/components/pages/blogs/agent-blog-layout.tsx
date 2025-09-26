'use client'


import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'
import TabButton from './tab-button';

type countProps = {
  collaboration: number;
  published: number;
  draft: number;
  deleted: number;
}

const AgentBlogLayout = ({children}:{children:React.ReactNode}) => {

  const countRequest = () => axios.get('/api/blog/user-blog-count') 

  const { data } = useQuery({
    queryKey: ['blog-counts'],
    queryFn: () => apiRequestHandler(countRequest)
  })

  const totalCounts = data?.data as countProps;

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Blogs</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-10 w-full flex">
          <TabButton label='All Blogs' counts={totalCounts?.published} tab='/agent-dashboard/created-blogs'/>
          <TabButton label='Drafts' tab='/agent-dashboard/created-blogs/drafts' counts={totalCounts?.draft}/>
          <TabButton label='Deleted' counts={totalCounts?.deleted} tab='/agent-dashboard/created-blogs/deleted'/>
          <TabButton label='Collaboration' counts={totalCounts?.collaboration} tab='/agent-dashboard/created-blogs/collaboration' className='hidden md:flex'/>
          <div className="flex-1 border-b dark:border-b-white/80"/>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  )
};

export default AgentBlogLayout
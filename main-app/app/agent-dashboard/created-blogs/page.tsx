import { getCurrentUser } from '@/actions/user-actions';
import AgentBlogLayout from '@/components/pages/blogs/agent-blog-layout';
import AllUserBlogsClient from '@/components/pages/blogs/all-user-blogs-client';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'All Blogs'
};

const AllBlogsPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  return (
    <AgentBlogLayout>
      <AllUserBlogsClient user={current_user} />
    </AgentBlogLayout>
  )
}

export default AllBlogsPage
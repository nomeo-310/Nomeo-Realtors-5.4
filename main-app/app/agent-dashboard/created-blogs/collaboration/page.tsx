import { getCurrentUser } from '@/actions/user-actions';
import AgentBlogLayout from '@/components/pages/blogs/agent-blog-layout';
import AllCollaborationClient from '@/components/pages/blogs/all-collaboration-client';
import BlogLayout from '@/components/pages/blogs/blog-layout';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Collaborations'
};

const AllCollaborationPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  return (
    <BlogLayout user={current_user}>
      <AllCollaborationClient user={current_user}/>
    </BlogLayout>
  )
}

export default AllCollaborationPage
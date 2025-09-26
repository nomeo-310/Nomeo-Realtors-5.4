import { getCurrentUser } from '@/actions/user-actions';
import AgentBlogLayout from '@/components/pages/blogs/agent-blog-layout';
import AllCollaborationClient from '@/components/pages/blogs/all-collaboration-client';
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
    <AgentBlogLayout>
      <AllCollaborationClient user={current_user}/>
    </AgentBlogLayout>
  )
}

export default AllCollaborationPage
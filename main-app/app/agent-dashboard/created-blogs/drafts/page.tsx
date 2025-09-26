import { getCurrentUser } from '@/actions/user-actions';
import AgentBlogLayout from '@/components/pages/blogs/agent-blog-layout';
import AllDraftClient from '@/components/pages/blogs/all-draft-client';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react'
export const metadata: Metadata = {
  title: 'All Drafts'
};

const AllDraftsPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  }
  return (
    <AgentBlogLayout>
      <AllDraftClient user={current_user}/>
    </AgentBlogLayout>
  )
}

export default AllDraftsPage
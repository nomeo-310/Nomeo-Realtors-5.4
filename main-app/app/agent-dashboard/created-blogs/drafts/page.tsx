import { getCurrentUser } from '@/actions/user-actions';
import AllDraftClient from '@/components/pages/blogs/all-draft-client';
import BlogLayout from '@/components/pages/blogs/blog-layout';
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
  };

  return (
    <BlogLayout user={current_user}>
      <AllDraftClient user={current_user}/>
    </BlogLayout>
  )
}

export default AllDraftsPage
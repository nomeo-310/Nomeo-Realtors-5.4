import { getCurrentUser } from '@/actions/user-actions';
import AllDraftClient from '@/components/pages/blogs/all-draft-client';
import BlogLayout from '@/components/pages/blogs/blog-layout';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'All Drafts'
};

const AllDraftsPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user && !current_user.blogCollaborator) {
    return notFound();
  };

  if (current_user.role !== 'agent') {
    return notFound();
  };

  return (
    <BlogLayout user={current_user}>
      <AllDraftClient user={current_user}/>
    </BlogLayout>
  )
}

export default AllDraftsPage
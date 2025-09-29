import { getCurrentUser } from '@/actions/user-actions';
import CreateBlogClient from '@/components/pages/create-blog/create-blog-client'
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Create Blog'
};

const CreateBlogPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user && !current_user.blogCollaborator) {
    return notFound();
  };

  if (current_user.role !== 'user') {
    return notFound();
  };
  return <CreateBlogClient user={current_user}/>
}

export default CreateBlogPage
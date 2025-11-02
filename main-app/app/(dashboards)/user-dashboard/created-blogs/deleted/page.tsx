import { getCurrentUser } from '@/actions/user-actions';
import AllDeletedBlogClient from '@/components/pages/blogs/all-deleted-blog-client';
import BlogLayout from '@/components/pages/blogs/blog-layout';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Deleted Blogs'
};

const AllDeletedBlogsPage = async() => {
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
  
  return (
    <BlogLayout user={current_user}>
      <AllDeletedBlogClient user={current_user}/>
    </BlogLayout>
  )
}

export default AllDeletedBlogsPage
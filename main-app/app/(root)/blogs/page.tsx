
import { getCurrentUser } from '@/actions/user-actions';
import BlogsClient from '@/components/pages/blogs/blogs-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Blogs'
};

const BlogsPage = async () => {
  const current_user = await getCurrentUser();

  return <BlogsClient user={current_user || undefined} />

}

export default BlogsPage
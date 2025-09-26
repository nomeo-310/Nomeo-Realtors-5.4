
import { getLatestBlogs } from '@/actions/blog-actions';
import { getCurrentUser } from '@/actions/user-actions';
import BlogsClient from '@/components/pages/blogs/blogs-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Blogs'
};

const BlogsPage = async () => {
  const latestBlogs = await getLatestBlogs();
  const current_user = await getCurrentUser();

  return <BlogsClient latestBlogs={latestBlogs} user={current_user || undefined} />

}

export default BlogsPage
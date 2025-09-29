import { getSingleBlog } from '@/actions/blog-actions';
import { getCurrentUser } from '@/actions/user-actions';
import SingleBlogClient from '@/components/pages/blogs/single-blog-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Single Block'
};

const SingleBlog = async ({params}:{params:{blogId:string}}) => {

  const [blog, user] = await Promise.all([
    getSingleBlog(params.blogId),
    getCurrentUser(),
  ]);

  if (!blog) {
    return notFound();
  };

  return <SingleBlogClient blog={blog} user={user} />
}

export default SingleBlog
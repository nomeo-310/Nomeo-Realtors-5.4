import CreateBlogClient from '@/components/pages/create-blog/create-blog-client'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Create Blog'
};

const CreateBlogPage = () => {
  return <CreateBlogClient/>
}

export default CreateBlogPage
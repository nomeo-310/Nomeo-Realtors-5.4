import EditBlogClient from '@/components/pages/create-blog/edit-blog-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Edit Blog'
};

const EditBlogPage = () => {
  return <EditBlogClient/>
}

export default EditBlogPage
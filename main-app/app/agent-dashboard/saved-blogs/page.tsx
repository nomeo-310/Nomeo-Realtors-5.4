import SavedBlogsClient from '@/components/pages/dashboard/saved-blogs-client';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Saved Blogs'
};

const SavedBlogs = () => {
  return (
    <SavedBlogsClient/>
  )
}

export default SavedBlogs
import { getCurrentUser } from '@/actions/user-actions';
import LikedBlogsClient from '@/components/pages/blogs/liked-blogs-clients';
import LikesLayout from '@/components/pages/blogs/likes-layout';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import React from 'react'

export const metadata: Metadata = {
  title: 'Liked Blogs'
};

const LikedBlogs = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'user') {
    return notFound();
  };

  if (current_user.role === 'user' ) {
    if (!current_user.showBookmarkedApartments && !current_user.showBookmarkedBlogs) {
      return notFound();
    }
  }

  return (
    <LikesLayout user={current_user}>
      <LikedBlogsClient />
    </LikesLayout>
  )
}

export default LikedBlogs
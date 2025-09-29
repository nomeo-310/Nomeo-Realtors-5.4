'use client'

import React from 'react'
import { SingleBlog, userProps } from "@/lib/types";
import { useSessionStore } from '@/hooks/session-store';
import SingleBlogHeader from './single-blog-header';
import SingleBlogBody from './single-blog-body';

const SingleBlogClient = ({blog, user}:{blog:SingleBlog, user?:userProps}) => {

  React.useEffect(() => {
    const existing = sessionStorage.getItem("sessionKey");
    if (!existing) {
      useSessionStore.getState().createSession();
    }
  }, []);

  console.log(blog)
  
  return (
    <div className="pt-[60px] lg:pt-[70px] xl:px-16 lg:px-10 md:px-6 px-3 min-h-screen xl:pb-16 pb-12">
      <SingleBlogHeader blog={blog} user={user} />
      <SingleBlogBody blog={blog} user={user} />
    </div>
  )
}

export default SingleBlogClient
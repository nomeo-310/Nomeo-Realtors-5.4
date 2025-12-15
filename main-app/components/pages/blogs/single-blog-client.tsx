'use client'

import React from 'react'
import { SingleBlog, userProps } from "@/lib/types";
import SingleBlogHeader from './single-blog-header';
import SingleBlogBody from './single-blog-body';
import { readBlog } from '@/actions/blog-actions';
import { usePathname } from 'next/navigation';

const SingleBlogClient = ({blog, user}:{blog:SingleBlog, user?:userProps}) => {

  const path = usePathname();

  const generateUUID = React.useCallback(() => {
    if (user) {
      return 'ssn-' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    } else {
      return 'guest-' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  }, [user]);

  const SESSION_KEY_NAME = 'blogSessionKey';

  const READ_STATUS_PREFIX = 'blogRead_'; 

  React.useEffect(() => {

    let key = sessionStorage.getItem(SESSION_KEY_NAME);
    
    if (!key) {
      
      key = generateUUID();
      sessionStorage.setItem(SESSION_KEY_NAME, key);
    }

  }, [generateUUID]);


  React.useEffect(() => {
    const current_session_key = sessionStorage.getItem(SESSION_KEY_NAME);
    if (!current_session_key) return;

    const READ_STATUS_KEY = `${READ_STATUS_PREFIX}${blog._id}`;
    if (sessionStorage.getItem(READ_STATUS_KEY)) return;

    const data = {
      blogId: blog._id,
      path,
      sessionKey: current_session_key,
    };

    const trackRead = async () => {
      try {
        sessionStorage.setItem(READ_STATUS_KEY, 'true');
        await readBlog(data);
      } catch (err) {
        sessionStorage.removeItem(READ_STATUS_KEY);
        console.error('Error tracking read:', err);
      }
    };

    trackRead();
  }, [blog._id, path]);

  
  return (
    <div className="pt-[60px] lg:pt-[70px] xl:px-16 lg:px-10 md:px-6 px-3 min-h-screen xl:pb-16 pb-12">
      <SingleBlogHeader blog={blog} user={user} />
      <SingleBlogBody blog={blog} user={user} />
    </div>
  )
}

export default SingleBlogClient
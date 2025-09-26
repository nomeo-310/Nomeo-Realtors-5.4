'use client'

import React from 'react'
import EditBlogForm from './edit-blog-form';
import { userProps } from '@/lib/types';

interface Banner {
  public_id: string;
  secure_url: string;
}

export interface BlogPost {
  banner: Banner;
  total_reads: number;
  reads: string[];
  _id: string;
  title: string;
  description: string;
  author: string;
  collaboration: boolean;
  collaborators: string[];
  total_likes: number;
  total_comments: number;
  total_saves: number;
  likes: string[];
  comments: string[];
  saves: string[];
  is_draft: boolean;
  is_published: boolean;
  is_deleted: boolean;
  read_time: number;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const EditBlogClient = ({blog, user}:{blog:BlogPost, user:userProps}) => {
  
  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Edit Blog</h2>
      </div>
      <EditBlogForm blog={blog} user={user}/>
    </div>
  )
}

export default EditBlogClient
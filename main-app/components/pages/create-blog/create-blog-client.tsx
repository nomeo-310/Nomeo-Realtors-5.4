'use client'

import React from 'react'
import CreateBlogForm from './create-blog-form'
import { userProps } from '@/lib/types'

const CreateBlogClient = ({user}:{user:userProps}) => {
  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Create Blog</h2>
      </div>
      <CreateBlogForm user={user}/>
    </div>
  )
}

export default CreateBlogClient
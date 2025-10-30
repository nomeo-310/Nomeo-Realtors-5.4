import { SingleBlog, userProps } from '@/lib/types'
import React from 'react'
import ImageAvatar from './image-avatar'
import Link from 'next/link'
import { togglePage } from '@/hooks/general-store'

const SingleBlogBody = ({blog}:{blog:SingleBlog, user?:userProps}) => {
  const { setPage } = togglePage();
  return (
    <div className="pt-4 pb-6 md:pt-6 md:pb-10 lg:pt-8 lg:pb-12 flex lg:gap-8 md:gap-6 gap-4 lg:flex-row flex-col">
      <div className="lg:w-[65%] lg:border-r lg:border-[#d4d4d4] w-full border-b border-[#d4d4d4] lg:border-b-0">
        <div className="w-full lg:pr-8 pr-0 pb-4 lg:pb-0">
          <div className='ProseMirror whitespace-pre-line text-justify' dangerouslySetInnerHTML={{__html: blog.content}}/>
          <div className='w-full my-5 border-b border-[#d4d4d4] lg:border-b-0'/>
          <div className='lg:hidden'>
            <p className='mb-4'>Blog post written by:</p>
            <div className=' flex gap-4 items-center pb-4'>
              <ImageAvatar src={blog.author?.profilePicture} name={`${blog.author?.surName} ${blog.author.lastName}`} placeholderColor={blog.author?.placeholderColor} className='size-10 lg:size-12 xl:size-14' />
              <div>
                <p className='capitalize text-sm'>{`${blog.author?.surName} ${blog.author.lastName}`}</p>
                <p className='text-sm text-black/50 dark:text-white'>{blog.author?.email}</p>
              </div>
            </div>
            <div className="py-4">
              <p className='text-sm text-black/50 dark:text-white'>Do you want to be notified <br/>Whenever posts like this are published?</p>
              <Link href={'/contact-us'} className='font-semibold mt-6 block hover:text-red-500 text-sm hover:underline'onClick={() => setPage("newsletter")}>Subscribe to our newsletter.</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-[35%] sticky top-[90px] h-full w-full">
        <div className='hidden lg:block'>
          <p className='mb-4'>Blog post written by:</p>
          <div className=' flex gap-4 items-center'>
            <ImageAvatar src={blog.author?.profilePicture} name={`${blog.author?.surName} ${blog.author.lastName}`} placeholderColor={blog.author?.placeholderColor} className='size-10 lg:size-12 xl:size-14'/>
            <div>
              <p className='capitalize text-sm'>{`${blog.author?.surName} ${blog.author.lastName}`}</p>
              <p className='text-sm text-black/50 dark:text-white'>{blog.author?.email}</p>
            </div>
          </div>
          {blog.collaboration && blog.collaborators.length > 0 && (
            <div className='mt-4'>
              <p className='mb-4'>Blog Collaborator{blog.collaborators.length === 1 ? '': 's'}:</p>
              <div className='flex flex-col gap-4'>
                {blog.collaborators.map((collaborator, index) => (
                  <div key={index} className='flex gap-4 items-center'>
                    <ImageAvatar src={collaborator?.profilePicture} name={`${collaborator?.surName} ${collaborator.lastName}`} placeholderColor={collaborator?.placeholderColor} className='size-10 lg:size-12 xl:size-14'/>
                    <div>
                      <p className='capitalize text-sm'>{`${collaborator?.surName} ${collaborator.lastName}`}</p>
                      <p className='text-sm text-black/50 dark:text-white'>{collaborator?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 pb-4">
            <div className="py-4 border-t border-black/50 dark:text-white">
              <p className='text-sm text-black/50 dark:text-white'>Do you want to be notified <br/>Whenever posts like this are published?</p>
              <Link href={'/contact-us'} className='font-semibold mt-6 block hover:text-red-500 text-sm hover:underline' onClick={() => setPage("newsletter")}>Subscribe to our newsletter.</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleBlogBody
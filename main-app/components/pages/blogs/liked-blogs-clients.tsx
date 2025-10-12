'use client'

import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { Bookmark01Icon, Comment01Icon, FavouriteIcon,  ViewIcon } from '@hugeicons/core-free-icons';
import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { Blog, userBlogData, userProps } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import Pagination from '@/components/ui/pagination';
import BlogsSkeleton from '@/components/skeletons/blogs-skeleton';
import Link from 'next/link';

const LikedBlogsClient = () => {

  const params = useSearchParams();

  const initialPage = Number(params.get('page')) || 1;
  const query = params.get('queryText') || '';

  const [currentPage, setCurrentPage] = React.useState(initialPage);

  React.useEffect(() => {
    const urlPage = Number(params.get('page')) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [params, currentPage]);

  const url = `/api/blog/liked-blogs?page=${currentPage}`;

  const request = () => axios.get(url);

  const { data, status } = useQuery({
    queryKey: ['all-saved-blogs', currentPage ],
    queryFn: () => apiRequestHandler(request)
  });

  const allUserBlogs = data?.data as userBlogData

  const BlogCard = ({blog}:{blog:Blog}) => {
    const isCollaboration = blog.collaboration;

    const Avatar = ({profileImage, email, placeholderColor}: {profileImage?:string, email:string, placeholderColor: string}) => {
      return (
        <div className="flex items-center gap-2">
          {(profileImage && profileImage !== "") ? 
            <div className="lg:size-9 size-8 rounded-full overflow-hidden relative z-[200]">
              <Image src={profileImage} alt={'user_avatar'} fill className="object-cover object-center"/>
            </div>
          :
            <div className="lg:size-9 size-8 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden z-[200]">
              <div className="w-full h-full flex items-center justify-center uppercase text-white tracking-wider" style={{backgroundColor: placeholderColor}}>
                {email.substring(0, 2)}
              </div>
            </div>
          }
        </div>
      )
    };
  
    const Collaboration = ({blog}:{blog:Blog}) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-4">
            <Avatar profileImage={blog.author.profilePicture} email={blog.author.email} placeholderColor={blog.author.placeholderColor}/>
            {(blog.collaborators && blog.collaborators.length > 0) && blog.collaborators.map((user) => (
              <Avatar key={user.firstName} profileImage={user.profilePicture} email={user.email} placeholderColor={user.placeholderColor}/>
            ))}
          </div>
        </div>
      )
    };

    return (
      <Link className='overflow-hidden flex flex-col gap-2' href={`/blogs/${blog._id}`}>
        <div className="border w-full h-[240px] rounded-lg relative">
          <div className="absolute left-0 top-0 w-full h-full z-[200] p-3 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-white dark:text-white/80">
              <p className='text-sm'>{formatDate(blog.created_at)}</p>
            </div>
            <div className='flex items-center justify-between'>
              {isCollaboration ? <Collaboration blog={blog}/> : <Avatar profileImage={blog.author.profilePicture} email={blog.author.email} placeholderColor={blog.author.placeholderColor}/>}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-white dark:text-white/80">
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={ViewIcon} className={cn("size-5")}/> {blog.total_saves} 
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={FavouriteIcon} className={cn("size-4")}/> {blog.total_likes} 
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Bookmark01Icon} className={cn("size-4")}/> {blog.total_saves} 
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Comment01Icon} className={cn("size-4")}/> {blog.total_comments} 
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Image src={blog.banner.secure_url} alt='blog_banner' fill className='w-full h-full object-cover rounded-lg'/>
          <div className="absolute w-full h-full rounded-lg bg-black/40 z-[100]"></div>
        </div>
        <div className=''>
          <h3 className='lg:text-lg font-semibold line-clamp-2 test-base'>{blog.title}</h3>
        </div>
      </Link>
    )
  };

  const BlogList = () => {

    if (status === 'pending') {
     return (
      <div className='flex items-center justify-center w-full'>
        <BlogsSkeleton/>
      </div>
     ) 
    }; 
  
    if (status === 'error') {
      return (
        <div className="md:w-[65%] mx-auto py-12">
          <ErrorState message="Something went wrong" />
        </div>
      )
    };
  
    if (status === 'success' && allUserBlogs && allUserBlogs.blogs.length < 1) {
      return (
        <div className="md:w-[65%] mx-auto py-12">
          <EmptyState message={query ? `No Blog found for this keyword: ${query}` : 'You have not liked any blog yet.'} className='' />
        </div>
      )
    };

    return (
      <React.Fragment>
        <div className='lg:mt-3 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-5 gap-4'>
          {allUserBlogs?.blogs && allUserBlogs.blogs.length > 0 && allUserBlogs.blogs.map((blog) => (
            <BlogCard blog={blog} key={blog._id}/>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={allUserBlogs.pagination.totalPages} onPageChange={setCurrentPage}/>
      </React.Fragment>
    )
  };


  return (
    <React.Fragment>
      <BlogList/>
    </React.Fragment>
  )
}

export default LikedBlogsClient
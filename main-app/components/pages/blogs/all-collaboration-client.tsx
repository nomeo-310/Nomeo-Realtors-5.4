'use client'

import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight03Icon, Search01Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon';
import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { Blog, userBlogData, userProps } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

const AllCollaborationClient = ({user}:{user:userProps}) => {
  const params = useSearchParams();
  const page = params.get('page') || 1;
  const query = params.get('queryText') || '';

  let url;

  if (query) {
    url = `/api/blog/all-user-collaboration?page=${page}&query=${query}`;
  } else {
    url = `/api/blog/all-user-collaboration?page=${page}`;
  }

  const request = () => axios.get(url);

  const { data, status } = useQuery({
    queryKey: ['all-user-collaborations', page, query],
    queryFn: () => apiRequestHandler(request)
  });

  const router = useRouter();

  const [searchText, setSearchText] = React.useState<string>('');

  React.useEffect(() => {
    if (!searchText) {
      router.push(`/${user.role === 'superAdmin' ? 'admin' : user.role === 'creator' ? 'admin' : user.role}-dashboard/created-blogs/collaboration`);
    }
  }, [searchText, router]);

  const createSearchParam = (searchText:string) => {
    if (searchText) {
      const params = new URLSearchParams();
      params.set('queryText', searchText);
      router.push(`/${user.role === 'superAdmin' ? 'admin' : user.role === 'creator' ? 'admin' : user.role}-dashboard/created-blogs/collaboration?${params.toString()}`);
    } else {
      router.push(`/${user.role === 'superAdmin' ? 'admin' : user.role === 'creator' ? 'admin' : user.role}-dashboard/created-blogs/collaboration`);
    }  
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      createSearchParam(searchText);
    }
  };

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
      <div className='overflow-hidden flex flex-col gap-2 cursor-pointer' onClick={blog.is_published ? () => router.push(`/blogs/${blog._id}`) :  () => router.push(`/${user.role === 'superAdmin' ? 'admin': user.role === 'creator' ? 'admin' : user.role}-dashboard/create-blog/${blog._id}`)}>
        <div className="border w-full h-[240px] rounded-lg relative">
          <div className="absolute left-0 top-0 w-full h-full z-[200] p-3 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-white dark:text-white/80">
              <p className='text-sm'>{formatDate(blog.created_at)}</p>
             <div className='flex items-center gap-1'>
                <p className='text-sm'>{blog.is_published ? 'Published' : 'Draft'}</p>
                <HugeiconsIcon icon={ArrowUpRight03Icon} className='size-4'/>
              </div>
            </div>
            <div>
              {isCollaboration ? <Collaboration blog={blog}/> : <Avatar profileImage={blog.author.profilePicture} email={blog.author.email} placeholderColor={blog.author.placeholderColor}/>}
            </div>
          </div>
          {blog.banner.secure_url ?
            <Image src={blog.banner.secure_url} alt='blog_banner' fill className='w-full h-full object-cover rounded-lg'/> :
            <div className='w-full h-full bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center'>
              <p className='text-white dark:text-black/80 text-2xl font-semibold tracking-wider'>No Image</p>
            </div>
          }
          <div className="absolute w-full h-full rounded-lg bg-black/40 z-[100]"/>
        </div>
        <div className='block'>
          <h3 className='lg:text-lg font-semibold line-clamp-2 test-base'>{blog.title}</h3>
        </div>
      </div>
    )
  };

  const BlogCardList = () => {

    if (status === 'pending') {
      return (
       <div className='flex items-center justify-center py-24'>
         <Loader2 className='animate-spin'/>
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
           <EmptyState message={query ? `No Blog found for this keyword: ${query}` : 'You have not deleted any blog post yet.'} className='' />
         </div>
       )
     };

     return (
      <div className='lg:mt-3 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 lg:gap-5 gap-4'>
        {allUserBlogs?.blogs && allUserBlogs.blogs.length > 0 && allUserBlogs.blogs.map((blog) => (
          <BlogCard blog={blog} key={blog._id}/>
        ))}
      </div>
     )
  };

  return (
    <React.Fragment>
      <div className="w-full md:w-[60%] xl:w-[40%] flex gap-1 mb-8">
        <InputWithIcon 
          type='text'
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          icon={Search01Icon}
          iconClassName='text-black/60 dark:text-white/70'
          className=' dark:border-white/70 rounded-r-none'
          placeholder='search through blogs'
          onKeyDown={handleKeyDown}
          inputClassName='placeholder:text-black/70 border dark:border-white/70 rounded-lg rounded-r-none dark:placeholder:text-white'
        />
        <button type="button" className='lg:h-12 h-11 aspect-square rounded-lg flex items-center justify-center border dark:border-white/70 rounded-l-none' onClick={() => createSearchParam(searchText)}>
          <HugeiconsIcon icon={ArrowUpRight03Icon} className='rotate-45 text-black/60 dark:text-white/70'/>
        </button>
      </div>
      <BlogCardList/>
    </React.Fragment>
  )
};

export default AllCollaborationClient
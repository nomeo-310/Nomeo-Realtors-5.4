'use client'


import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { ArrowUpRight03Icon, Bookmark01Icon, Comment01Icon, FavouriteIcon, Link05Icon, Menu02Icon, ViewIcon, LicenseDraftIcon, Delete01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon';
import { apiRequestHandler } from '@/lib/apiRequestHandler';
import { Blog, userBlogData, userProps } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner';
import { deletePost } from '@/actions/blog-actions';
import { HugeiconsIcon } from '@hugeicons/react';
import Pagination from '@/components/ui/pagination';
import BlogsSkeleton from '@/components/skeletons/blogs-skeleton';

const AllUserBlogsClient = ({user}:{user:userProps}) => {

  const params = useSearchParams();
  const router = useRouter();

  const initialPage = Number(params.get('page')) || 1;
  const query = params.get('queryText') || '';

  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [searchText, setSearchText] = React.useState<string>('');

  const updateParams = (page: number, queryText?: string) => {
    const searchParams = new URLSearchParams();
    if (page > 1) searchParams.set('page', String(page));
    if (queryText) searchParams.set('queryText', queryText);

    router.push(
      `/${user.role === 'user' ? 'user' : 'agent'
      }-dashboard/created-blogs${searchParams.toString() ? `?${searchParams}` : ''}`
    );
  };

  React.useEffect(() => {
    const urlPage = Number(params.get('page')) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }, [params, currentPage]);

  const url = `/api/blog/all-user-blogs?page=${currentPage}${query ? `&query=${query}` : ''}`;

  const request = () => axios.get(url);

  const { data, status } = useQuery({
    queryKey: ['all-user-blogs', currentPage, query],
    queryFn: () => apiRequestHandler(request)
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!searchText) {
      router.push(`/${user.role === 'superAdmin' ? 'admin': user.role === 'creator' ? 'admin': user.role}-dashboard/created-blogs`);
    }
  }, [searchText, router]);

  const createSearchParam = (searchText: string) => {
    updateParams(1, searchText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateParams(1, searchText);
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

    const [showMenu, setShowMenu] = React.useState(false);

    const deleteBlog = async (blogId:string) => {
      await deletePost(blogId).then((response) => {
        if (response.status === 200) {
          queryClient.invalidateQueries({queryKey: ['blog-counts']});
          queryClient.invalidateQueries({queryKey: ['all-user-blogs']});
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      }).catch((error) => {
        toast.error(error.message);
      });
    }

    return (
      <div className='overflow-hidden flex flex-col gap-2'>
        <div className="border w-full h-[240px] rounded-lg relative">
          <div className="absolute left-0 top-0 w-full h-full z-[200] p-3 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-white dark:text-white/80">
              <p className='text-sm'>{formatDate(blog.created_at)}</p>
              <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
                <DropdownMenuTrigger asChild className='focus:outline-none cursor-pointer'>
                  <div className='focus:outline-none cursor-pointer'>
                    <HugeiconsIcon icon={Menu02Icon}/>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='bg-white dark:bg-neutral-900 min-w-[5rem] -ml-16 z-[400]'>
                  <DropdownMenuItem className='cursor-pointer text-sm py-1 flex items-center gap-4' onClick={() => router.push(`/blogs/${blog._id}`)}>
                    <HugeiconsIcon icon={Link05Icon} className='size-4'/> View
                  </DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer text-sm py-1 flex items-center gap-4' onClick={() => router.push(`/${user.role === 'superAdmin' ? 'admin' : user.role === 'creator' ? 'admin': user.role}-dashboard/create-blog/${blog._id}`)}>
                    <HugeiconsIcon icon={LicenseDraftIcon}/> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer text-sm py-1'onClick={() => deleteBlog(blog._id)}>
                    <HugeiconsIcon icon={Delete01Icon} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      </div>
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
          <EmptyState message={query ? `No Blog found for this keyword: ${query}` : 'You have not published any blog yet.'} className='' />
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
      <BlogList/>
    </React.Fragment>
  )
}

export default AllUserBlogsClient
"use client";

import { blog_texts } from "@/assets/texts/blog_texts";
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark01Icon, FavouriteIcon, ViewIcon, Comment01Icon, Search01Icon, ArrowUpRight03Icon } from '@hugeicons/core-free-icons';
import { AllBlogProps, latestBlogProps, userProps } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import InputWithIcon from "@/components/ui/input-with-icon";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { apiRequestHandler } from "@/lib/apiRequestHandler";
import BlogsSkeleton from "@/components/skeletons/blogs-skeleton";
import EmptyState from "@/components/ui/empty-state";
import ErrorState from "@/components/ui/error-state";
import Pagination from "@/components/ui/pagination";
import LatestBlogsSkeleton from "@/components/skeletons/latest-blogs-skeleton";

type Props = {
  user?: userProps;
};

const BlogsClient = ({user}:Props) => {

  const isCollaboration = (blog: latestBlogProps): boolean => {
    return blog?.collaboration;
  };

  const alreadyRead = (blog: latestBlogProps): boolean => {
    if (!user) {
      return false
    }
    return blog?.reads?.includes(user._id);
  };

  const alreadyLiked= (blog: latestBlogProps): boolean => {
    if (!user) {
      return false
    }
    return blog?.likes?.includes(user._id);
  };

  const alreadySaved  = (blog: latestBlogProps): boolean => {
    if (!user) {
      return false
    }
    return blog.saves?.includes(user._id);
  };

  const Avatar = ({profileImage, email, placeholderColor}: {profileImage?:string, email:string, placeholderColor: string}) => {
    return (
      <div className="flex items-center gap-2 z-[200]">
        {(profileImage && profileImage !== "") ? 
          <div className="lg:size-10 size-9 rounded-full overflow-hidden relative">
            <Image src={profileImage} alt={'user_avatar'} fill className="object-cover object-center"/>
          </div>
        :
          <div className="lg:size-10 size-9 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center uppercase text-white tracking-wider" style={{backgroundColor: placeholderColor}}>
              {email?.substring(0, 2)}
            </div>
          </div>
        }
      </div>
    )
  };

  const Collaboration = ({blog}:{blog:latestBlogProps}) => {
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

  const LatestBlogs = () => {
    const request = () => axios.get('/api/blog/latest-blogs');

    const { data, status} = useQuery({
      queryKey: ['latest-blogs'],
      queryFn: () => apiRequestHandler(request)
    });

    const latestBlogs = data?.data as latestBlogProps[];
    const firstBlog = latestBlogs && latestBlogs[0];
    const restBlogs = latestBlogs && latestBlogs.slice(1, 4);

    const DesktopLatestBlog = () => {
      const itIsACollaboration = isCollaboration(firstBlog);
      return (
        <div className="min-h-[400px] md:my-6 h-full md:flex gap-4 hidden">
          <div className="h-full lg:w-[60%] w-[63%]">
            <div className="w-full xl:h-[420px] lg:h-[380px] h-[300px] rounded-md relative flex items-center justify-center">
              <div className="w-full h-full absolute bg-black/30 rounded-lg z-[100] left-0 top-0"/>
              <div className="absolute bottom-3 right-3 text-white z-[300]">
                  {itIsACollaboration ? <Collaboration blog={firstBlog}/> : <Avatar profileImage={firstBlog?.author.profilePicture} email={firstBlog?.author.email} placeholderColor={firstBlog?.author.placeholderColor}/>}
              </div>
              <Image src={firstBlog?.banner.secure_url} fill className="object-cover rounded-md object-center" alt={'blog_1_banner'}/>
            </div>
            <div className="flex justify-between items-center p-3">
              <p className="text-sm text-black/70 dark:text-white/80">{formatDate(firstBlog?.created_at)}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/70">
                  <HugeiconsIcon icon={ViewIcon} className={cn("size-6 text-black/50 dark:text-white/70", alreadyRead(firstBlog) && 'fill-green-600 text-green-400 dark:text-green-200')}/> {firstBlog?.total_reads} 
                </div>
                <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/80">
                  <HugeiconsIcon icon={FavouriteIcon} className={cn("size-5 text-black/50 dark:text-white/70", alreadyLiked(firstBlog) && 'fill-red-600 text-red-400 dark:text-red-200')}/> {firstBlog?.total_likes} 
                </div>
                <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/80">
                  <HugeiconsIcon icon={Bookmark01Icon} className={cn("size-5 text-black/50 dark:text-white/70", alreadySaved(firstBlog) && 'fill-yellow-600 text-yellow-400 dark:text-yellow-200')}/> {firstBlog?.total_saves} 
                </div>
                <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/70">
                  <HugeiconsIcon icon={Comment01Icon} className={cn("size-5 text-black/50 dark:text-white/70")}/> {firstBlog?.total_comments} 
                </div>
              </div>
            </div>
            <div className="lg:text-lg text-base font-semibold font-quicksand">{firstBlog?.title}</div>
            <div className="mt-2 text-black/60 dark:text-white/70 text-sm lg:text-base text-justify">{firstBlog?.description} <Link href={`blogs/${firstBlog?._id}`} className="cursor-pointer inline-block pl-3 font-semibold text-black dark:text-white">...Read more</Link></div>
          </div>
          <div className="h-full lg:w-[40%] w-[37%] flex flex-col gap-3">
            {restBlogs.map((blog:latestBlogProps, index:number) => (
              <Link href={`blogs/${blog?._id}`}  className="w-full h-full flex lg:gap-4 gap-2 lg:items-center items-stretch cursor-pointer" key={blog?._id}>
                <div className="xl:h-[130px] xl:w-[180px] lg:h-[100px] lg:w-[150px] h-[90px] w-[120px] rounded-md relative flex items-center justify-center">
                  <div className="w-full h-full absolute bg-black/30 rounded-lg z-[100] left-0 top-0"/>
                  <Image src={blog?.banner?.secure_url} fill className="object-cover rounded-md object-center" alt={`blog_${index + 2}_banner`}/>
                </div>
                <div className="flex-1 flex flex-col justify-between xl:min-h-[130px] lg:min-h-[100px] gap-2 lg:gap-0 h-auto">
                  <p className="lg:text-sm text-black/60 dark:text-white/70 text-xs">{formatDate(blog?.created_at)}</p>
                  <div className="font-semibold font-quicksand text-sm lg:text-base">{blog?.title}</div>
                  <div className="flex justify-end items-center lg:p-3 p-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/70">
                        <HugeiconsIcon icon={ViewIcon} className={cn("size-5 text-black/50 dark:text-white/70", alreadyRead(blog) && 'fill-green-600 text-green-400 dark:text-green-200')}/> {blog?.total_reads} 
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/70">
                        <HugeiconsIcon icon={FavouriteIcon} className={cn("size-4 text-black/50 dark:text-white/70", alreadyLiked(blog) && 'fill-red-600 text-red-400 dark:text-red-200')}/> {blog?.total_likes} 
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/70">
                        <HugeiconsIcon icon={Bookmark01Icon} className={cn("size-4 text-black/50 dark:text-white/70", alreadySaved(blog) && 'fill-yellow-600 text-yellow-400 dark:text-yellow-200')}/> {blog?.total_saves} 
                      </div>
                      <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/70">
                        <HugeiconsIcon icon={Comment01Icon} className={cn("size-4 text-black/50 dark:text-white/70")}/> {blog?.total_comments}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )
    };

    const MobileLatestBlog = () => {
      return (
        <div className="w-full my-5 h-full flex flex-col gap-10 md:hidden">
          {latestBlogs && latestBlogs.length > 0 && latestBlogs.slice(0, 3).map((blog:latestBlogProps) => {
              const itIsACollaboration = isCollaboration(blog);
            return (
              <div key={blog._id}>
                <div className="w-full aspect-video rounded-md relative flex items-center justify-center">
                <div className="w-full h-full absolute bg-black/30 rounded-lg z-[100] left-0 top-0"/>
                <div className="absolute bottom-3 right-3 z-[300]">
                  {itIsACollaboration ? <Collaboration blog={blog}/>: <Avatar profileImage={blog?.author.profilePicture} email={blog?.author.email} placeholderColor={blog?.author.placeholderColor}/>}
                </div>
                <Image src={blog?.banner.secure_url} fill className="object-cover rounded-md object-center" alt={'blog_1_banner'}/>
                </div>
                <div className="flex justify-between items-center p-2">
                  <p className="text-sm text-black/70 dark:text-white/80">{formatDate(blog?.created_at)}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/80">
                      <HugeiconsIcon icon={ViewIcon} className={cn("size-6 text-black/50 dark:text-white/70", alreadyRead(blog) && 'fill-green-600 text-green-400 dark:text-green-200')}/> {blog.total_reads} 
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/80">
                      <HugeiconsIcon icon={FavouriteIcon} className={cn("size-5 text-black/50 dark:text-white/70", alreadyLiked(blog) && 'fill-red-600 text-red-400 dark:text-red-200')}/> {blog.total_likes} 
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/80">
                      <HugeiconsIcon icon={Bookmark01Icon} className={cn("size-5 text-black/50 dark:text-white/70", alreadySaved(blog) && 'fill-yellow-600 text-yellow-400 dark:text-yellow-200')}/> {blog.total_saves} 
                    </div>
                    <div className="flex items-center gap-2 text-sm text-black/60 dark:text-white/80">
                      <HugeiconsIcon icon={Comment01Icon} className={cn("size-5 text-black/50 dark:text-white/70")}/> {firstBlog.total_comments} 
                    </div>
                  </div>
                </div>
                <div className="text-base font-semibold font-quicksand">{blog.title}</div>
                <div className=" text-black/60 dark:text-white/70 text-sm lg:text-base">{blog.description} <Link href={`blogs/${blog._id}`} className="cursor-pointer inline-block pl-3 font-semibold text-black dark:text-white">...Read more</Link></div>
              </div>
            )
          })}
        </div>
      )
    };

    const BlogsArray = () => {
      if (status === 'pending') {
        return <LatestBlogsSkeleton/>
      };

      if (status === 'error') {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">Error latest fetching blogs</div>
              <div className="text-sm text-black/60 dark:text-white/70">Please try again later</div>
            </div>
          </div>
        )
      }

      if (status === 'success' && latestBlogs.length < 1) {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">No blogs found</div>
              <div className="text-sm text-black/60 dark:text-white/70">Please try again later</div>
            </div>
          </div>
        )
      }

      return (
        <React.Fragment>
          <DesktopLatestBlog />
          <MobileLatestBlog />
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <div className='flex flex-col w-full lg:gap-8 gap-6 py-2 mt-5 lg:mt-10'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>{blog_texts.title}</h1>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{blog_texts.description}</p>
        </div>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand mt-6'>Latest Blogs</h2>
        <BlogsArray/>
      </React.Fragment>
    )
  };

  const AllBlogs = () => {
    const params = useSearchParams();
    const router = useRouter();

    const initialPage = Number(params.get('page')) || 1;

    const query = params.get('queryText') || '';
    const [currentPage, setCurrentPage] = React.useState(initialPage);

    const [searchText, setSearchText] = React.useState<string>('');

    React.useEffect(() => {
      setSearchText(query);
    }, [query]);
  
    const updateParams = (page: number, queryText?: string) => {
      const searchParams = new URLSearchParams();
      if (page > 1) {
        searchParams.set('page', String(page));
      } else {
        searchParams.delete('page');
      }

      if (queryText && queryText.trim() !== '') {
        searchParams.set('queryText', queryText.trim());
      } else {
        searchParams.delete('queryText');
      }
  
      router.push(
        `/blogs${searchParams.toString() ? `?${searchParams}` : ''}`
      );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        updateParams(1, searchText);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchText(newValue);
      if (newValue.trim() === '') {
        updateParams(1, '');
      }
    };

    const url = `/api/blog/all-blogs?page=${currentPage}${query ? `&query=${query}` : ''}`;
    const request = () => axios.get(url);

    const { data, status } = useQuery({
      queryKey: ['all-blogs', currentPage, query],
      queryFn: () => apiRequestHandler(request)
    });

    const allBlogs = data?.data as AllBlogProps;

    const BlogList = () => {
      if (status === 'pending') {
        return (
          <div className="md:py-10 lg:py-12 py-8 md:min-h-[400px] min-h-[580px]">
            <BlogsSkeleton/>
          </div>
        )
      }

      if (status === 'error') {
        return (
          <div className="md:py-10 lg:py-12 py-8">
            <ErrorState message="An error occured, try again later."/>
          </div>
        )
      }

      if (status === 'success' && allBlogs.blogs.length < 1) {
        return (
          <div className="md:py-10 lg:py-12 py-8">
            <EmptyState message="Blogs not available at the moment, check later."/>
          </div>
        )
      }

      if (status === 'success' && searchText && allBlogs.blogs.length < 1) {
        return (
          <div className="md:py-10 lg:py-12 py-8 flex flex-col gap-6 md:gap-8 lg:gap-10 md:min-h-[480px] min-h-[580px]">
            <EmptyState message={`No Blog available for this search query: ${searchText}.`}/>
            <Pagination currentPage={currentPage} totalPages={allBlogs.pagination.totalPages} onPageChange={setCurrentPage}/>
          </div>
        )
      }

      return (
        <div className="md:pt-10 lg:pt-12 pt-8 flex flex-col gap-6 md:gap-8 lg:gap-10 md:min-h-[600px] min-h-[550px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-x-4 md:gap-y-6">
            {allBlogs && allBlogs.blogs.length > 0 && allBlogs.blogs.map((blog) => (
              <div className="rounded-xl flex flex-col overflow-hidden w-full" key={blog._id}>
                <div className="relative overflow-hidden rounded-xl aspect-video">
                  <div className="w-full h-full absolute bg-black/30 rounded-lg z-[100] left-0 top-0"/>
                  <div className="absolute bottom-3 right-3 text-white z-[300]">
                    {isCollaboration(blog) ? <Collaboration blog={blog}/> : <Avatar profileImage={blog?.author.profilePicture} email={blog?.author.email} placeholderColor={blog?.author.placeholderColor}/>}
                  </div>
                  <Image src={blog.banner.secure_url} alt='blog_banner' fill className='object-cover object-center'/>
                </div>
                <div className="w-full h-[200px] md:h-[160px] pt-2 flex flex-col justify-between">
                  <h2 className='font-semibold xl:text-lg text-base font-quicksand line-clamp-2'>{blog.title}</h2>
                  <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>{blog.description}</div>
                  <div className='md:flex items-center justify-between hidden lg:flex'>
                    <div className='flex items-center gap-3'>
                      <p className='text-sm font-semibold'>{`${blog.author.surName}  ${blog.author.lastName}`}.</p>
                      <p className='text-sm'>{formatDate(blog.created_at)}</p>
                      <p className='text-sm'>{blog.read_time} Mins Read.</p>
                    </div>
                    <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${blog._id}`)}>
                      <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                    </button>
                  </div>
                  <div className='flex flex-col gap-1 md:hidden'>
                    <p className='text-sm font-semibold'>{`${blog.author.surName}  ${blog.author.lastName}`}.</p>
                    <p className='text-sm'>{formatDate(blog.created_at)}</p>
                    <div className="flex items-center justify-between">
                      <p className='text-sm'>{blog.read_time} Mins Read.</p>
                      <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${blog._id}`)}>
                        <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
          <Pagination currentPage={currentPage} totalPages={allBlogs.pagination.totalPages} onPageChange={setCurrentPage}/>
        </div>
      )
    }

    return (
      <div className="md:py-10 lg:py-12 py-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center w-full justify-between">
          <h2 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>All Blogs</h2>
          <div className="w-full md:w-4/5 lg:w-3/5 mt-3 md:mt-0">
            <InputWithIcon 
              type='text'
              value={searchText}
              onChange={handleChange}
              icon={Search01Icon}
              iconClassName='text-black/60 dark:text-white/70'
              className=' dark:border-white/70'
              placeholder='search through all blogs'
              onKeyDown={handleKeyDown}
              inputClassName='placeholder:text-black/70 border dark:border-white/70 rounded-lg dark:placeholder:text-white'
            />
          </div>
        </div>
        <BlogList/>
      </div>
    )
  }

  return (
    <div className='pt-[60px] lg:pt-[70px] xl:px-16 md:px-10 px-6'>
      <LatestBlogs/>
      <AllBlogs/>
    </div>
  )
};

export default BlogsClient;

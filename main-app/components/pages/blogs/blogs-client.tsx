"use client";

import { blog_texts } from "@/assets/texts/blog_texts";
import { HugeiconsIcon } from '@hugeicons/react';
import { Bookmark01Icon, FavouriteIcon, ViewIcon, Comment01Icon } from '@hugeicons/core-free-icons';
import { latestBlogProps, userProps } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  latestBlogs: latestBlogProps[];
  user?: userProps;
};

const BlogsClient = ({latestBlogs,user }:Props) => {
  const firstBlog = latestBlogs[0];
  const restBlogs = latestBlogs.slice(1, 4);

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
      <div className="flex items-center gap-2">
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

  const DesktopLatesBlog = () => {
    const itIsACollaboration = isCollaboration(firstBlog);
    return (
      <div className="min-h-[400px] md:my-6 h-full md:flex gap-4 lg:gap-12 hidden">
        <div className="h-full lg:w-[60%] w-[63%]">
          <div className="w-full xl:h-[400px] lg:h-[350px] h-[280px] rounded-md relative flex items-center justify-center">
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
                      <HugeiconsIcon icon={ViewIcon} className={cn("size-5 text-black/50 dark:text-white/70", alreadyRead(blog) && 'fill-green-600 text-green-400 dark:text-green-200')}/> {blog?.total_saves} 
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
        {latestBlogs && latestBlogs.length > 0 && latestBlogs.map((blog:latestBlogProps) => {
            const itIsACollaboration = isCollaboration(blog);
          return (
            <div>
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

  const LatestBlog = () => {
    return (
      <React.Fragment>
        <div className='flex flex-col w-full lg:gap-8 gap-6 py-2 mt-5 lg:mt-10'>
          <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>{blog_texts.title}</h1>
          <p className='text-black/60 dark:text-white/70 text-sm lg:text-base text-justify'>{blog_texts.description}</p>
        </div>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand mt-6'>Latest Blogs</h2>
        <DesktopLatesBlog />
        <MobileLatestBlog />
      </React.Fragment>
    )
  };

  return (
    <div className='pt-[60px] lg:pt-[70px] xl:px-16 md:px-10 px-6'>
      <LatestBlog/>
    </div>
  )
};

export default BlogsClient;

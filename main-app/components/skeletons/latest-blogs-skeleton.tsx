import React from "react";
import { Skeleton } from "../ui/skeleton";

  const SingleSkeleton = () => {
    return (
      <div className="w-full h-full flex lg:gap-4 gap-2 lg:items-center items-stretch cursor-pointer">
        <div className="xl:h-[130px] xl:w-[180px] lg:h-[100px] lg:w-[150px] h-[90px] w-[120px] rounded-md relative flex items-center justify-center">
          <Skeleton className='bg-[#d4d4d4] dark:bg-[#424242] w-full h-full'/>
        </div>
        <div className="w-full gap-2 pt-2 justify-between flex flex-col">
          <div className='flex flex-col gap-1'>
            <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
          </div>
          <div className='flex flex-col gap-1'>
            <Skeleton className='w-full h-10 rounded-md bg-[#d4d4d4] dark:bg-[#424242]'/>
          </div>
          <div className='flex lg:flex flex-col gap-1 md:hidden'>
            <Skeleton className='w-1/2 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className='w-1/2 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <div className="flex items-center justify-between">
              <Skeleton className='w-[40%] h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
          </div>
          <div className='md:flex md:items-center items-end justify-between lg:hidden hidden '>
            <div className='flex md:flex-row md:items-center items-stretch'>
              <Skeleton className='w-full h-10 rounded-md bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const DesktopLatestBlog = () => {

    return (
      <div className="min-h-[400px] md:my-6 h-full md:flex gap-4 hidden">
        <div className="h-full lg:w-[60%] w-[63%]">
          <div className="w-full xl:h-[420px] lg:h-[380px] h-[300px] rounded-md relative flex items-center justify-center">
            <Skeleton className='bg-[#d4d4d4] dark:bg-[#424242] w-full h-full'/>
          </div>
          <div className="w-full gap-2 pt-2 justify-between flex flex-col">
            <div className='flex flex-col gap-1'>
              <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
            <div className='flex flex-col gap-1'>
              <Skeleton className='w-full h-10 rounded-md bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
            <div className='flex lg:flex flex-col gap-1 md:hidden'>
              <Skeleton className='w-1/2 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='w-1/2 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <div className="flex items-center justify-between">
                <Skeleton className='w-[40%] h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              </div>
            </div>
            <div className='md:flex md:items-center items-end justify-between lg:hidden hidden '>
              <div className='flex md:flex-row md:items-center items-stretch'>
                <Skeleton className='w-full h-10 rounded-md bg-[#d4d4d4] dark:bg-[#424242]'/>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full lg:w-[40%] w-[37%] flex flex-col gap-3">
          <SingleSkeleton/>
          <SingleSkeleton/>
          <SingleSkeleton/>
        </div>
      </div>
    )
  };

  const MobileLatestBlog = () => {
    return (
      <div className="w-full my-5 h-full flex flex-col gap-5 md:hidden">
        <SingleSkeleton/>
        <SingleSkeleton/>
        <SingleSkeleton/>
      </div>
    )
  };

  const LatestBlogsSkeleton = () => {
    return (
      <React.Fragment>
        <DesktopLatestBlog />
        <MobileLatestBlog />
      </React.Fragment>
    )
  };

  export default LatestBlogsSkeleton
import { Skeleton } from '../ui/skeleton'

const FeaturedBlogsSkeleton = () => {
  
  return (
    <div className="w-full xl:h-[350px] lg:h-[300px] flex lg:gap-3 flex-col lg:flex-row gap-8">
      <div className="lg:w-1/4 flex flex-col overflow-hidden w-full h-[360px] md:h-[420px] lg:h-full">
        <div className="relative flex-1 w-full h-full">
          <Skeleton className='w-full h-full bg-[#d4d4d4] dark:bg-[#424242]'/>
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
      <div className="flex flex-col lg:w-1/2 w-full  h-[360px] md:h-[420px] lg:h-full">
        <div className="relative flex-1">
          <Skeleton className='w-full h-full bg-[#d4d4d4] dark:bg-[#424242]' />
        </div>
        <div className="w-full pt-2 flex flex-col justify-between gap-2">
          <div className='flex flex-col gap-1'>
            <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
          </div>
          <div className='flex flex-col gap-1'>
            <Skeleton className='w-full h-12 rounded-md bg-[#d4d4d4] dark:bg-[#424242]'/>
          </div>
          <div className='md:flex items-center justify-between hidden lg:flex'>
            <div className='flex md:flex-row md:items-center md:gap-3 gap-1 flex-col items-stretch w-full'>
              <Skeleton className='w-1/3 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='w-1/5 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='w-1/5 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
          </div>
          <div className='flex flex-col gap-1 md:hidden'>
            <div className='flex md:flex-row md:items-center md:gap-3 gap-1 flex-col items-stretch'>
              <Skeleton className='w-1/3 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className='w-1/5 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className='w-1/5 h-2 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/4 flex flex-col overflow-hidden w-full h-[360px] md:h-[420px] lg:h-full">
        <div className="relative flex-1 w-full h-full">
          <Skeleton className='w-full h-full bg-[#d4d4d4] dark:bg-[#424242]' />
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
    </div>
  )
}

export default FeaturedBlogsSkeleton
import { Skeleton } from '../ui/skeleton'
import { cn } from '@/lib/utils'

const BlogsSkeleton = () => {
  const BlogSkeleton = ({className}:{className?:string}) => {
    return (
      <div className={cn('w-full flex flex-col gap-1', className)}>
        <div className="w-full xl:h-56 md:h-52 h-48 rounded-md flex items-center justify-center overflow-hidden">
          <Skeleton className='w-full h-full bg-[#d4d4d4]'/>
        </div>
        <div className="w-full gap-2 pt-2 justify-between flex flex-col">
          <div className='flex flex-col gap-1'>
            <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className='w-full h-3 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
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


  return (
    <div className='grid gap-x-4 gap-y-8 xl:gap-x-5 lg:grid-cols-3 md:grid-cols-2 w-full'>
      <BlogSkeleton/>
      <BlogSkeleton/>
      <BlogSkeleton/>
    </div>
  )
}

export default BlogsSkeleton
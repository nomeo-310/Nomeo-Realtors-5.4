import { featured_blogs_text } from '@/assets/texts/blog_texts'
import FeaturedBlogsSkeleton from '@/components/skeletons/featured-blogs-skeleton'
import EmptyState from '@/components/ui/empty-state'
import ErrorState from '@/components/ui/error-state'
import { apiRequestHandler } from '@/lib/apiRequestHandler'
import { latestBlogProps } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { ArrowUpRight03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const FeaturedBlogs = () => {
  const request = () => axios.get('/api/blog/featured-blogs');

  const {data, status} = useQuery({
    queryKey: ['featured-blogs'], 
    queryFn: () => apiRequestHandler(request), 
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false
  });

  const featuredBlogs = data?.data as latestBlogProps[];

  const router = useRouter();

  return (
    <div id='latestBlogs' className='w-full flex xl:gap-16 xl:p-16 md:p-10 p-6 flex-col gap-6 pt-[84px] md:pt-[84px] xl:pt-[84px]'>
      <div className='flex flex-col gap-3'>
        <div className="w-full flex items-center justify-between">
          <h2 className='xl:text-3xl md:text-2xl text-lg font-quicksand font-semibold'>{featured_blogs_text.title}</h2>
          <Link className='text-sm lg:text-base font-semibold text-secondary-blue' href={'/blogs'}>Read more...</Link>
        </div>
        <p className='text-black/60 dark:text-white/70 text-sm md:text-base'>{featured_blogs_text.description}</p>
      </div>
      { status === 'pending' && <FeaturedBlogsSkeleton/> }
      { status === 'error' && 
        <div>
          <ErrorState message='Error occurred while getting featured blogs'/>
        </div>
      }
      { status === 'success' && featuredBlogs.length < 1 &&
        <div>
          <EmptyState message='Featured blogs not available at the moment. Check later'/>
        </div>
      }
      {status === 'success' && featuredBlogs.length > 1 &&
        <div className="w-full xl:h-[450px] lg:h-[420px] flex lg:gap-3 flex-col lg:flex-row gap-8">
          <div className="rounded-xl lg:w-1/4 flex flex-col overflow-hidden w-full h-[360px] md:h-[420px] lg:h-full">
            <div className="relative overflow-hidden rounded-xl flex-1">
              <Image src={featuredBlogs[0].banner.secure_url} alt='blog_banner' fill className='object-cover object-center'/>
            </div>
            <div className="w-full h-[200px] md:h-[160px] lg:h-[200px] pt-2 justify-between flex flex-col">
              <h2 className='text-base font-quicksand line-clamp-2 font-semibold'>{featuredBlogs[0].title}</h2>
              <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>{featuredBlogs[0].description}.</div>
              <div className='flex lg:flex flex-col gap-1 md:hidden'>
                <p className='text-sm font-semibold'>{`${featuredBlogs[0].author.surName}  ${featuredBlogs[0].author.lastName}`}</p>
                <p className='text-sm'>{formatDate(featuredBlogs[0].created_at)}</p>
                <div className="flex items-center justify-between">
                  <p className='text-sm'>{featuredBlogs[0].read_time} Mins Read.</p>
                  <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${featuredBlogs[0]._id}`)}>
                    <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                  </button>
                </div>
              </div>
              <div className='md:flex md:items-center items-end justify-between lg:hidden hidden '>
                <div className='flex md:flex-row md:items-center md:gap-3 gap-1 flex-col items-stretch'>
                  <p className='text-sm font-semibold'>{`${featuredBlogs[0].author.surName}  ${featuredBlogs[0].author.lastName}`}</p>
                  <p className='text-sm'>{formatDate(featuredBlogs[0].created_at)}</p>
                  <p className='text-sm'>{featuredBlogs[0].read_time} Mins Read.</p>
                </div>
                <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${featuredBlogs[0]._id}`)}>
                  <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-xl flex flex-col overflow-hidden lg:w-1/2 w-full  h-[360px] md:h-[420px] lg:h-full">
            <div className="relative overflow-hidden rounded-xl flex-1">
              <Image src={featuredBlogs[1].banner.secure_url} alt='blog_banner' fill className='object-cover object-center'/>
            </div>
            <div className="w-full h-[200px] md:h-[160px] pt-2 flex flex-col justify-between">
              <h2 className='font-semibold xl:text-lg text-base font-quicksand line-clamp-2'>{featuredBlogs[1].title}</h2>
              <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>{featuredBlogs[1].description}</div>
              <div className='md:flex items-center justify-between hidden lg:flex'>
                <div className='flex items-center gap-3'>
                  <p className='text-sm font-semibold'>{`${featuredBlogs[1].author.surName}  ${featuredBlogs[1].author.lastName}`}.</p>
                  <p className='text-sm'>{formatDate(featuredBlogs[1].created_at)}</p>
                  <p className='text-sm'>{featuredBlogs[1].read_time} Mins Read.</p>
                </div>
                <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${featuredBlogs[1]._id}`)}>
                  <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                </button>
              </div>
              <div className='flex flex-col gap-1 md:hidden'>
                <p className='text-sm font-semibold'>{`${featuredBlogs[1].author.surName}  ${featuredBlogs[1].author.lastName}`}.</p>
                <p className='text-sm'>{formatDate(featuredBlogs[1].created_at)}</p>
                <div className="flex items-center justify-between">
                  <p className='text-sm'>{featuredBlogs[1].read_time} Mins Read.</p>
                  <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${featuredBlogs[1]._id}`)}>
                    <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl lg:w-1/4 flex flex-col overflow-hidden w-full h-[360px] md:h-[420px] lg:h-full">
            <div className="relative overflow-hidden rounded-xl flex-1">
              <Image src={featuredBlogs[2].banner.secure_url} alt='blog_banner' fill className='object-cover object-center'/>
            </div>
            <div className="w-full h-[200px] md:h-[160px] lg:h-[200px] pt-2 justify-between flex flex-col">
              <h2 className='text-base font-quicksand line-clamp-2 font-semibold'>{featuredBlogs[2].title}</h2>
              <div className='text-black/60 dark:text-white/70 text-justify text-sm line-clamp-3'>{featuredBlogs[2].description}.</div>
              <div className='flex lg:flex flex-col gap-1 md:hidden'>
                <p className='text-sm font-semibold'>{`${featuredBlogs[2].author.surName}  ${featuredBlogs[2].author.lastName}`}</p>
                <p className='text-sm'>{formatDate(featuredBlogs[2].created_at)}</p>
                <div className="flex items-center justify-between">
                  <p className='text-sm'>{featuredBlogs[2].read_time} Mins Read.</p>
                  <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${featuredBlogs[2]._id}`)}>
                    <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                  </button>
                </div>
              </div>
              <div className='md:flex md:items-center items-end justify-between lg:hidden hidden '>
                <div className='flex md:flex-row md:items-center md:gap-3 gap-1 flex-col items-stretch'>
                  <p className='text-sm font-semibold'>{`${featuredBlogs[2].author.surName}  ${featuredBlogs[2].author.lastName}`}</p>
                  <p className='text-sm'>{formatDate(featuredBlogs[2].created_at)}</p>
                  <p className='text-sm'>{featuredBlogs[2].read_time} Mins Read.</p>
                </div>
                <button className='border p-1 rounded-full' onClick={() => router.push(`/blogs/${featuredBlogs[2]._id}`)}>
                  <HugeiconsIcon icon={ArrowUpRight03Icon}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default FeaturedBlogs
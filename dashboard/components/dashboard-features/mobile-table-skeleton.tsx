'use client'

import { Skeleton } from "../ui/skeleton";

interface MobileSkeletonProps {
  items?: number;
}

export const MobileSkeleton = ({ items = 3 }: MobileSkeletonProps) => {
  return (
    <div className='w-full h-[560px] overflow-hidden'>
      <div className="flex flex-col">
        {Array.from({ length: items }).map((_, index) => (
          <div 
            key={index} 
            className="shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit dark:odd:bg-gray-700 dark:even:bg-[#424242] h-[68px] md:h-[72px] p-3 md:p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 bg-[#d4d4d4] dark:bg-[#525252]" />
              <Skeleton className="h-4 w-20 bg-[#d4d4d4] dark:bg-[#525252]" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-4 w-16 rounded-full bg-[#d4d4d4] dark:bg-[#525252]" />
              <Skeleton className="h-4 w-28 bg-[#d4d4d4] dark:bg-[#525252]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 8 }: TableSkeletonProps) => {
  return (
    <div className='min-h-[300px] max-h-[490px]'>
      <Table className='w-full border'>
        <TableHeader className="rounded-lg h-12 [&_tr]:border-b">
          <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead key={index} className="text-center border-r last:border-r-0">
                <Skeleton className="h-4 w-full bg-[#d4d4d4] dark:bg-[#525252]" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="text-center border-r last:border-r-0">
                  <Skeleton className="h-4 w-full bg-[#d4d4d4] dark:bg-[#424242]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

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
              <Skeleton className="h-6 w-16 rounded-full bg-[#d4d4d4] dark:bg-[#525252]" />
              <Skeleton className="h-4 w-28 bg-[#d4d4d4] dark:bg-[#525252]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PaymentHistorySkeleton = () => {
  return (
    <>
      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        <TableSkeleton rows={5} columns={8} />
      </div>

      {/* Mobile Skeleton */}
      <div className='md:hidden'>
        <MobileSkeleton items={5} />
      </div>
    </>
  );
};
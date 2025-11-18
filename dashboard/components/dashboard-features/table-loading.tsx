'use client'


import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table";
import React from "react"

interface MobileSkeletonProps {
  items?: number;
}

interface TableSkeletonProps {
  rows?: number;
  tableHeader: string[]
}

  const TableSkeleton = ({ rows = 5, tableHeader }: TableSkeletonProps) => {
    return (
      <div className='min-h-[300px] max-h-[490px]'>
        <Table className='w-full border'>
          <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
            <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
              {tableHeader.map((item, index) => (
                <TableHead key={index} className="text-center border-r last:border-r-0 uppercase text-xs font-semibold">
                  {item}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: tableHeader.length }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="text-center border-r last:border-r-0">
                    <Skeleton className="h-3 w-full bg-[#d4d4d4] dark:bg-[#424242]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const MobileSkeleton = ({ items = 5 }: MobileSkeletonProps) => {
    return (
      <div className='w-full h-[560px] overflow-hidden'>
        <div className="flex flex-col">
          {Array.from({ length: items }).map((_, index) => (
            <div 
              key={index} 
              className="shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit dark:odd:bg-gray-700 dark:even:bg-[#424242] h-[56px] md:h-[60px] p-3 md:p-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24 bg-[#d4d4d4] dark:bg-[#525252]" />
                <Skeleton className="h-3 w-20 bg-[#d4d4d4] dark:bg-[#525252]" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Skeleton className="h-3 w-16 rounded-full bg-[#d4d4d4] dark:bg-[#525252]" />
                <Skeleton className="h-3 w-28 bg-[#d4d4d4] dark:bg-[#525252]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TableLoading = ({tableHeader, rows, items}:{tableHeader: string[], rows?: number, items?: number}) => {
    
    return (
      <React.Fragment>
        {/* Desktop Skeleton */}
        <div className="hidden md:block w-full">
          <TableSkeleton rows={rows} tableHeader={tableHeader} />
        </div>

        {/* Mobile Skeleton */}
        <div className='md:hidden'>
          <MobileSkeleton items={items} />
        </div>
      </React.Fragment>
    )
  }

  export default TableLoading;
'use client'

import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Skeleton } from '../ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  tableHeader: string[]
}

export const TableSkeleton = ({ rows = 5, tableHeader }: TableSkeletonProps) => {
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
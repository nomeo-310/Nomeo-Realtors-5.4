'use client'

import React from 'react'
import VerificationLayout from './verification-layout'
import { usePathname } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontalIcon } from '@/components/ui/icons'
import Pagination from '@/components/ui/pagination'

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
};

const ApartmentVerificationClient = () => {

  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const numberOfPages = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const VerificationHeader = () => {
    return (
      <TableHeader className="rounded-lg h-12 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242] dark:text-white">
          <TableHead className="text-center font-semibold uppercase">Agent Name</TableHead>
          <TableHead className="text-center font-semibold uppercase">Property Tag</TableHead>
          <TableHead className="text-center font-semibold uppercase">Property ID</TableHead>
          <TableHead className="text-center font-semibold uppercase">No of Rooms</TableHead>
          <TableHead className="text-center font-semibold uppercase">No of Baths</TableHead>
          <TableHead className="text-center font-semibold uppercase">No of Toilets</TableHead>
          <TableHead className="text-center font-semibold uppercase">State</TableHead>
          <TableHead className="text-center font-semibold uppercase">City</TableHead>
          <TableHead className="text-center font-semibold uppercase">Action</TableHead>
        </TableRow>
      </TableHeader>
    )
  };

  const VerificationItem = () => {
    return (
      <TableRow>
        <TableCell className="text-xs md:text-sm text-center">Salomi Onome</TableCell>
        <TableCell className="text-xs md:text-sm text-center">Apartment-123456</TableCell>
        <TableCell className="text-xs md:text-sm text-center">For Sale</TableCell>
        <TableCell className="text-xs md:text-sm text-center">3</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">3</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">3</TableCell>
        <TableCell className="text-xs md:text-sm text-center">Lagos</TableCell>
        <TableCell className="text-xs md:text-sm text-center">Ikeja</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu/>
        </TableCell>
      </TableRow>
    )
  };

  const MobileItem = ({open, toggleTable }:mobileItemProps) => {
    return (
      <div className={cn("shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto': '')} onClick={toggleTable}>
        <div className="flex items-center justify-between">
          <p className="text-sm">Salomi Onome</p>
          <p className="text-sm">Apartment-123456</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center font-medium text-sm")}>For Sale</p>
          <p className="text-sm text-black/40">3 rooms</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm">3 Bathrooms</p>
          <p className="text-sm">3 Toilets</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">State</p>
          <p className="text-sm">Lagos</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">City</p>
          <p className="text-sm capitalize">Ikeja</p>
        </div>
      </div>
    )
  };

  const Menu = () => {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Full Details
          </DropdownMenuItem>
          <DropdownMenuItem>
            Accept Property
          </DropdownMenuItem>
          <DropdownMenuItem>
            Reject Property
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const VerificationHistory = () => {

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className="hidden md:block">
          <div className='min-h-[300px] max-h-[490px] '>
            <Table className='w-full border'>
              <VerificationHeader/>
              <TableBody>
                <VerificationItem/>
                <VerificationItem/>
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={currentPage} totalPages={numberOfPages} onPageChange={handlePageChange} />
        </div>
        <div className='md:hidden'>
          <div className='w-full h-[560px] overflow-hidden'>
            <div className="flex flex-col">
              <MobileItem
                open={currentIndex === 0}
                toggleTable={() => toggleItem(0)}
              />
              <MobileItem
                open={currentIndex === 1}
                toggleTable={() => toggleItem(1)}
              />
              <MobileItem
                open={currentIndex === 2}
                toggleTable={() => toggleItem(2)}
              />
              <MobileItem
                open={currentIndex === 3}
                toggleTable={() => toggleItem(3)}
              />
              <MobileItem
                open={currentIndex === 4}
                toggleTable={() => toggleItem(4)}
              />
              <MobileItem
                open={currentIndex === 5}
                toggleTable={() => toggleItem(5)}
              />
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={numberOfPages} onPageChange={handlePageChange} />
        </div>
      </div>
    )
  };
  
  return (
    <VerificationLayout>
      <VerificationHistory/>
    </VerificationLayout>
  )
}

export default ApartmentVerificationClient
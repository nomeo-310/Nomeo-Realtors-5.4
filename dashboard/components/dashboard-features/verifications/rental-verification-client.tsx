'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, nairaSign } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Pagination from '@/components/ui/pagination'
import { MoreHorizontalIcon } from 'lucide-react'
import VerificationsWrapper from './verifications-wrapper'
import { AdminDetailsProps } from '@/lib/types'

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
};

const RentalVerificationClient = ({user}:{user:AdminDetailsProps}) => {

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
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          <TableHead className="text-center font-semibold uppercase">Agent Name</TableHead>
          <TableHead className="text-center font-semibold uppercase">Agency Name</TableHead>
          <TableHead className="text-center font-semibold uppercase">Occupant</TableHead>
          <TableHead className="text-center font-semibold uppercase">Annual Rent</TableHead>
          <TableHead className="text-center font-semibold uppercase">Total Amount Paid</TableHead>
          <TableHead className="text-center font-semibold uppercase">Rental Status</TableHead>
          <TableHead className="text-center font-semibold uppercase">Date</TableHead>
          <TableHead className="text-center font-semibold uppercase">Action</TableHead>
        </TableRow>
      </TableHeader>
    )
  };

  const VerificationItem = () => {
    return (
      <TableRow>
        <TableCell className="text-xs md:text-sm text-center">Saomi Onome</TableCell>
        <TableCell className="text-xs md:text-sm text-center">Pearl Realtor Inc.</TableCell>
        <TableCell className="text-xs md:text-sm text-center">Oluwatobi Ajagbe</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{nairaSign}4.9M</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{nairaSign}5.3M</TableCell>
        <TableCell className="text-xs md:text-sm text-center">Unverified</TableCell>
        <TableCell className="text-xs md:text-sm text-center">12 June, 2025</TableCell>
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
          <p className="text-sm">Pearl Realtor Inc.</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center font-medium text-sm")}>Oluwatobi Ajagbe</p>
          <p className="text-sm text-black/40">Unverified</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm">Annual Rent</p>
          <p className="text-sm">{nairaSign}4.9M</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">Total Amount Paid</p>
          <p className="text-sm">{nairaSign}7.9M</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">Date</p>
          <p className="text-sm capitalize">12 June, 2025</p>
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
            Start Rental
          </DropdownMenuItem>
          <DropdownMenuItem>
            Cancel Rental
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
    <VerificationsWrapper user={user}>
      <VerificationHistory/>
    </VerificationsWrapper>
  )
}

export default RentalVerificationClient
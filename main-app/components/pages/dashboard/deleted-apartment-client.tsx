"use client";

import React from "react";
import AllApartmentLayout from "../apartment/all-apartment-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, nairaSign } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";
import { MoreHorizontalIcon } from "lucide-react";

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
};

const DeletedApartmentClient = () => {

  const DeletedApartmentList = () => {
    const [currentIndex, setCurrentIndex] = React.useState(-1);

    const toggleItem = React.useCallback((index: number) => {
      setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
    },[]);

    const numberOfPages = 10;
    const [currentPage, setCurrentPage] = React.useState(1);

    const handlePageChange = (page:number) => {
      setCurrentPage(page)
    };


    const DeletedListHeader = () => {
      return (
        <TableHeader className="rounded-lg h-12 [&_tr]:border-b">
          <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
            <TableHead className="text-center font-semibold uppercase">Date Created</TableHead>
            <TableHead className="text-center font-semibold uppercase">Property ID</TableHead>
            <TableHead className="text-center font-semibold uppercase">No of Rooms</TableHead>
            <TableHead className="text-center font-semibold uppercase">No of Toilets</TableHead>
            <TableHead className="text-center font-semibold uppercase">No of Bathrooms</TableHead>
            <TableHead className="text-center font-semibold uppercase">Annual Rent</TableHead>
            <TableHead className="text-center font-semibold uppercase">city</TableHead>
            <TableHead className="text-center font-semibold uppercase">State</TableHead>
            <TableHead className="text-center font-semibold uppercase">Status</TableHead>
            <TableHead className="text-center font-semibold uppercase">Action</TableHead>
          </TableRow>
        </TableHeader>
      )
    };

    const DeletedListItem = () => {
      return (
        <TableRow>
          <TableCell className="text-xs md:text-sm text-center">20th Nov, 2025</TableCell>
          <TableCell className="text-xs md:text-sm text-center">T234567123456</TableCell>
          <TableCell className="text-xs md:text-sm text-center">3</TableCell>
          <TableCell className="text-xs md:text-sm text-center capitalize">3</TableCell>
          <TableCell className="text-xs md:text-sm text-center">4</TableCell>
          <TableCell className="text-xs md:text-sm text-center">{nairaSign} 145,500.00</TableCell>
          <TableCell className="text-xs md:text-sm text-center capitalize">Ikeja</TableCell>
          <TableCell className="text-xs md:text-sm text-center">Lagos</TableCell>
          <TableCell className="text-xs md:text-sm text-center">Available</TableCell>
          <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
            <Menu />
          </TableCell>
        </TableRow>
      )
    };

    const MobileDeleteListItem = ({open, toggleTable }:mobileItemProps) => {
      return (
        <div className={cn("shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto': '')} onClick={toggleTable}>
          <div className="flex items-center justify-between">
            <p className="text-sm">Rental</p>
            <p className="text-sm">{nairaSign} 145,500.00</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className={cn("text-center font-medium text-sm")}>Claimed</p>
            <p className="text-sm text-black/40">20th Nov, 2025</p>
          </div>
          <div className="border-b border-black my-3"/>
          <div className="flex items-center justify-between">
            <p className="text-sm">Transaction ID</p>
            <p className="text-sm">T234567123456</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm">Currency</p>
            <p className="text-sm uppercase">NGN</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm">Payment Method</p>
            <p className="text-sm capitalize">Bank Transfer</p>
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
            <DropdownMenuItem className="cursor-pointer">
              Full Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Restore
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    };

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className="hidden md:block">
          <div className='min-h-[300px] max-h-[490px] '>
            <Table className='w-full border'>
              <DeletedListHeader/>
              <TableBody>
                <DeletedListItem/>
                <DeletedListItem/>
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={currentPage} totalPages={numberOfPages} onPageChange={handlePageChange} />
        </div>
        <div className='md:hidden'>
          <div className='w-full h-[560px] overflow-hidden'>
            <div className="flex flex-col">
              <MobileDeleteListItem
                open={currentIndex === 0}
                toggleTable={() => toggleItem(0)}
              />
              <MobileDeleteListItem
                open={currentIndex === 1}
                toggleTable={() => toggleItem(1)}
              />
              <MobileDeleteListItem
                open={currentIndex === 2}
                toggleTable={() => toggleItem(2)}
              />
              <MobileDeleteListItem
                open={currentIndex === 3}
                toggleTable={() => toggleItem(3)}
              />
              <MobileDeleteListItem
                open={currentIndex === 4}
                toggleTable={() => toggleItem(4)}
              />
              <MobileDeleteListItem
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
    <AllApartmentLayout>
      <DeletedApartmentList/>
    </AllApartmentLayout>
  );
};

export default DeletedApartmentClient;

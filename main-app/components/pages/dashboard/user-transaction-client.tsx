'use client'

import EmptyState from '@/components/ui/empty-state'
import ErrorState from '@/components/ui/error-state'
import { ArrowUpRight03Icon, Bathtub01Icon, BedIcon, CenterFocusIcon, MapsIcon, Toilet01Icon } from '@hugeicons/core-free-icons'
import { useTransactionModal } from '@/hooks/general-store'
import { cn, nairaSign } from '@/lib/utils'
import { formatMoney } from '@/utils/formatMoney'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Pagination from '@/components/ui/pagination'

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
};

const UserTransactionClient = () => {
  const searchParams = useSearchParams();

  const propertyId = searchParams.get('propertyId') || '';
  const agentUserId = searchParams.get('agentUserId') || '';

  const { onOpen } = useTransactionModal();

  const [activeTab, setActiveTab] = React.useState(propertyId && agentUserId ? 'make-payment' : 'history');

  const fetchData = async (): Promise<any> => {
    const response = await axios.post('/api/property/check-property', {
      propertyId: propertyId,
      agentUserId: agentUserId,
    });

    if (response.status !== 200) {
      throw new Error('Something went wrong, try again later');
    }
    const data = response.data as any;
    return data;
  };

  const { data:searchedItem, status } = useQuery<any>({
    queryKey: ['property-check', propertyId, agentUserId],
    queryFn: fetchData,
    enabled: !!propertyId && !!agentUserId,
  });


  const calculateTotalFees = (mainFees:any) => {
    let totalAmount = 0;
    for (const fee of mainFees) {
      totalAmount += fee.amount;
    }
    return totalAmount;
  };

  const SearchedProperty = () => {

    if (!propertyId || !agentUserId) {
      return (
        <div className="w-full py-5">
          <ErrorState message="No Search parameters !!!" className="w-[80%] uppercase text-xs lg:text-sm mx-auto tracking-wider" />
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className='w-full  p-3 rounded-lg flex flex-col gap-2 dark:border-white/70 '>
          <div className='flex items-center gap-3 w-full'>
            <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
            <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
          </div>
          <div className="gap-3 grid grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
            <div className="flex items-center gap-2 text-sm ">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]'/>
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
          </div>
          <div className='my-2 flex flex-wrap gap-x-1 gap-y-2'>
            <Skeleton className="h-7 rounded-full bg-[#d4d4d4] dark:bg-[#424242] w-[120px]" />
            { [1, 2, 3, 4, 5].map((item:number) => (
              <Skeleton key={item} className="h-7 rounded-full bg-[#d4d4d4] dark:bg-[#424242] w-[120px]"/>
            ))}
          </div>
          <div className="flex items-center justify-between flex-row gap-3 w-full">
            <Skeleton className="flex-1 h-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            <Skeleton className="h-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242] w-[160px]"/>
          </div>
        </div>
      )
    }

    if (status === 'error') {
      
      return (
        <div className="w-full flex items-center justify-center py-5">
          <ErrorState message={`An error occurred while searching for "${propertyId}"`} className='w-fit'/>
        </div>
      );
    }

    if (status === 'success' && !searchedItem) {

      return (
        <div className="w-full flex items-center py-5">
          <EmptyState message={`No rent-out initialization for "${propertyId}"`} className='w-fit'/>
        </div>
      );
    }

    if (status === 'success' && searchedItem) {

      const totalMainFees = calculateTotalFees(searchedItem?.mainFees);
      const totalFees = searchedItem?.annualRent + totalMainFees;

      const handleProceed = () => {
        localStorage.setItem('totalPayment', `${totalFees}`)
        onOpen();
      };

    
      return (
        <div className='lg:w-[70%] md:w-[75%] w-full p-3 rounded-lg flex flex-col gap-2 dark:border-white/70'>
          <div className='flex items-center gap-2'>
            <HugeiconsIcon icon={MapsIcon} className='size-5'/>
            {searchedItem?.address}, {searchedItem?.city}, {searchedItem?.state}.
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={BedIcon} className='size-5'/>
              {searchedItem?.bedrooms}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={Bathtub01Icon} className='size-5'/>
              {searchedItem?.bathrooms}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={Toilet01Icon} className='size-5'/>
              {searchedItem?.toilets}
            </div>
            <div className="flex items-center gap-2 text-sm ">
              <HugeiconsIcon icon={CenterFocusIcon} className='size-5'/>
              <span>{searchedItem?.squareFootage} sqm</span>
            </div>
          </div>
          <div className='my-2 flex flex-wrap gap-x-1 gap-y-2'>
            <p className='bg-gray-300 dark:bg-[#424242] px-4 py-1.5 rounded-full text-sm font-medium'>Annual rent: {nairaSign}{formatMoney(searchedItem?.annualRent)}</p>
            { searchedItem.mainFees && searchedItem.mainFees.length > 0 && searchedItem.mainFees.map((item:any) => (
              <p key={item.name} className='capitalize bg-gray-300 dark:bg-[#424242] px-4 py-1.5 rounded-full text-sm font-medium'>{item.name}: {nairaSign}{formatMoney(item.amount)}</p>
            ))}
          </div>
          <div className="flex items-center md:justify-between md:flex-row flex-col gap-6 md:gap-0">
            <p className='font-semibold text-white bg-red-500 py-1.5 px-4 rounded-full w-full md:w-fit'>Total Amount: {nairaSign}{formatMoney(searchedItem?.annualRent + calculateTotalFees(searchedItem?.mainFees))}</p>
            <button type="button" className='text-sm px-4 py-1.5 rounded-full flex items-center gap-2 bg-gray-300 w-full md:w-fit justify-between md:justify-normal' onClick={handleProceed}>
              Proceed With Payment
              <HugeiconsIcon icon={ArrowUpRight03Icon} className='rotate-45 size-5'/>
            </button>
          </div>
        </div>
      );
    }
  };

  const PaymentHistory = () => {
    const [currentIndex, setCurrentIndex] = React.useState(-1);

    const toggleItem = React.useCallback((index: number) => {
      setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
    },[]);

    const numberOfPages = 10;
    const [currentPage, setCurrentPage] = React.useState(1);

    const handlePageChange = (page:number) => {
      setCurrentPage(page)
    };

    const PaymentHeader = () => {
      return (
        <TableHeader className="rounded-lg h-12 [&_tr]:border-b">
          <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
            <TableHead className="text-center font-semibold uppercase border-r">Date</TableHead>
            <TableHead className="text-center font-semibold uppercase border-r">Property ID</TableHead>
            <TableHead className="text-center font-semibold uppercase border-r">Transaction ID</TableHead>
            <TableHead className="text-center font-semibold uppercase border-r">Payment Type</TableHead>
            <TableHead className="text-center font-semibold uppercase border-r">Currency</TableHead>
            <TableHead className="text-center font-semibold uppercase border-r">Payment Method</TableHead>
            <TableHead className="text-center font-semibold uppercase border-r">Amount</TableHead>
            <TableHead className="text-center font-semibold uppercase">Status</TableHead>
          </TableRow>
        </TableHeader>
      )
    };

    const PaymentItem = () => {
      return (
        <TableRow>
          <TableCell className="text-xs md:text-sm text-center border-r">20th Nov, 2025</TableCell>
          <TableCell className="text-xs md:text-sm text-center border-r">T234567123456</TableCell>
          <TableCell className="text-xs md:text-sm text-center border-r">T234567123456</TableCell>
          <TableCell className="text-xs md:text-sm text-center border-r capitalize">Annual Rent</TableCell>
          <TableCell className="text-xs md:text-sm text-center border-r">NGN</TableCell>
          <TableCell className="text-xs md:text-sm text-center border-r capitalize">Bank Transfer</TableCell>
          <TableCell className="text-xs md:text-sm text-center border-r">{nairaSign} 145,500.00</TableCell>
          <TableCell className="text-xs md:text-sm text-center">Paid</TableCell>
        </TableRow>
      )
    };

    const MobileItem = ({open, toggleTable }:mobileItemProps) => {
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

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className="hidden md:block">
          <div className='min-h-[300px] max-h-[490px] '>
            <Table className='w-full border'>
              <PaymentHeader/>
              <TableBody>
                <PaymentItem/>
                <PaymentItem/>
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
    <div className='w-full h-full flex flex-col py-6 lg:gap-5 gap-4'>
      <div className="lg:w-[80%] xl:w-[70%] md:w-[80%]">
        <div className="items-center flex justify-between w-full">
          <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Transactions</h2>
        </div>
        <div className="h-10 w-full flex lg:mt-5 mt-4">
          <button className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase", activeTab === 'make-payment' ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} onClick={() => setActiveTab('make-payment')}>Make Payment</button>
          <button className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase", activeTab === 'history' ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} onClick={() => setActiveTab('history')}>Payment History</button>
          <div className="flex-1 border-b dark:border-b-white/80"/>
        </div>
      </div>
      <div className='lg:w-[80%] xl:w-[70%] md:w-[80%]'>
        { activeTab === 'make-payment' && <SearchedProperty/>  }
      </div>
      <div className="w-full">
        { activeTab === 'history' && <PaymentHistory/> }
      </div>
    </div>
  )
};

export default UserTransactionClient
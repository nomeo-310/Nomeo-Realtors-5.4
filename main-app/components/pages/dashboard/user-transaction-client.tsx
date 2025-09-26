'use client'

import EmptyState from '@/components/ui/empty-state'
import ErrorState from '@/components/ui/error-state'
import { ArrowUpRight03Icon, Bathtub01Icon, BedIcon, CenterFocusIcon, MapsIcon, Toilet01Icon } from '@hugeicons/core-free-icons'
import { useTransactionModal } from '@/hooks/general-store'
import { cn, nairaSign } from '@/lib/utils'
import { formatMoney } from '@/utils/formatMoney'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'

const UserTransactionClient = () => {
  const searchParams = useSearchParams();

  const propertyId = searchParams.get('propertyId') || '';
  const agentUserId = searchParams.get('agentUserId') || '';

  const { onOpen } = useTransactionModal();

  const [activeTab, setActiveTab] = React.useState('make-payment');

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
    queryKey: ['property-check', propertyId],
    queryFn: fetchData,
    enabled: propertyId !== '' && agentUserId !== '',
  });


  const calculateTotalFees = (mainFees:any) => {
    let totalAmount = 0;
    for (const fee of mainFees) {
      totalAmount += fee.amount;
    }
    return totalAmount;
  };
  const SearchedProperty = () => {

    if (status === 'pending') {
      return (
        <div className='w-full py-5 flex items-center justify-center'>
          <Loader2 className='animate-spin'/>
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
    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 border bg-inherit'>payment history</div>
    )
  };

  return (
    <div className='w-full lg:w-[80%] xl:w-[70%] md:w-[80%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 py-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Transactions</h2>
      </div>
      <div className="h-10 w-full flex">
        <button className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-sm lg:text-base", activeTab === 'make-payment' ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} onClick={() => setActiveTab('make-payment')}>Make Payment</button>
        <button className={cn("cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-sm lg:text-base", activeTab === 'history' ? 'border-b-2 border-black dark:border-red-500 font-semibold': 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70')} onClick={() => setActiveTab('history')}>Payment History</button>
        <div className="flex-1 border-b dark:border-b-white/80"/>
      </div>
      { activeTab === 'make-payment' && <SearchedProperty/>  }
      { activeTab === 'history' && <PaymentHistory/> }
    </div>
  )
};

export default UserTransactionClient
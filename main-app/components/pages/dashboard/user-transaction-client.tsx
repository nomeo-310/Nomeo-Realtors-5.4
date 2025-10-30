'use client'

import EmptyState from '@/components/ui/empty-state'
import ErrorState from '@/components/ui/error-state'
import { ArrowUpRight03Icon, Bathtub01Icon, BedIcon, CenterFocusIcon, MapsIcon, Search01Icon, Toilet01Icon } from '@hugeicons/core-free-icons'
import { useActiveTab, useTransactionModal } from '@/hooks/general-store'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { PaymentHistorySkeleton } from '@/components/skeletons/transaction-skeleton'

type Payment = {
  _id: string;
  createdAt: string;
  apartment: string;
  transactionId: string;
  type: string;
  currency: string;
  paymentMethod: string;
  amount: number;
  status: string;
}

// Move SearchAndFilterSection OUTSIDE to prevent recreating on each render
const SearchAndFilterSection = ({ 
  searchQuery, 
  setSearchQuery, 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  statusFilter, 
  setStatusFilter, 
  typeFilter, 
  setTypeFilter, 
  paymentMethodFilter, 
  setPaymentMethodFilter, 
  clearFilters, 
  resultsCount,
  isLoading
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (value: string) => void;
  clearFilters: () => void;
  resultsCount: number;
  isLoading: boolean;
}) => {
  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <HugeiconsIcon 
            icon={Search01Icon} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" 
          />
          <Input
            placeholder="Search by Property ID, Transaction ID, or Payment Type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus:outline-none focus:ring-0 outline-none focus-visible:ring-0"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start text-xs md:text-sm">
                <CalendarIcon className="mr-2 size-4" />
                {startDate && endDate ? (
                  `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}`
                ) : (
                  'Date Range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                <Calendar
                  mode="range"
                  selected={{ from: startDate, to: endDate }}
                  onSelect={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                  className="rounded-md border"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[130px] text-xs md:text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[150px] text-xs md:text-sm">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Annual Rent">Annual Rent</SelectItem>
              <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
              <SelectItem value="Service Charge">Service Charge</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Method Filter */}
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="w-full sm:w-[160px] text-xs md:text-sm">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Online Transfer">Online Transfer</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full sm:w-auto text-xs md:text-sm"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
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
  );
};

const PaymentItem = ({ payment }: { payment: Payment }) => {
  return (
    <TableRow>
      <TableCell className="text-xs md:text-sm text-center border-r">
        {format(new Date(payment.createdAt), 'do MMM, yyyy')}
      </TableCell>
      <TableCell className="text-xs md:text-sm text-center border-r uppercase">{payment.apartment}</TableCell>
      <TableCell className="text-xs md:text-sm text-center border-r uppercase">{payment.transactionId}</TableCell>
      <TableCell className="text-xs md:text-sm text-center border-r capitalize">{payment.type}</TableCell>
      <TableCell className="text-xs md:text-sm text-center border-r">{payment.currency}</TableCell>
      <TableCell className="text-xs md:text-sm text-center border-r capitalize">{payment.paymentMethod.split('_').join(' ')}</TableCell>
      <TableCell className="text-xs md:text-sm text-center border-r">{nairaSign} {payment.amount.toLocaleString()}</TableCell>
      <TableCell className="text-xs md:text-sm text-center capitalize">{payment.status}</TableCell>
    </TableRow>
  );
};

const MobileItem = ({ open, toggleTable, payment }: { open: boolean; toggleTable: () => void; payment: Payment }) => {
  return (
    <div 
      className={cn(
        "shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit dark:odd:bg-gray-700 dark:even:bg-[#424242] h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", 
        open ? 'h-auto md:h-auto' : ''
      )} 
      onClick={toggleTable}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs capitalize">{payment.type}</p>
        <p className="text-xs">{nairaSign} {payment.amount.toLocaleString()}</p>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs capitalize">
        {payment.status}
        <p className="text-xs text-black/40 dark:text-white/60">{format(new Date(payment.createdAt), 'do MMM, yyyy')}</p>
      </div>
      {open && (
        <>
          <div className="border-b border-black dark:border-white/30 my-3" />
          <div className="flex items-center justify-between">
            <p className="text-xs">Property ID</p>
            <p className="text-xs uppercase">{payment.apartment}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs">Transaction ID</p>
            <p className="text-xs uppercase">{payment.transactionId}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs">Currency</p>
            <p className="text-xs uppercase">{payment.currency}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs">Payment Method</p>
            <p className="text-xs capitalize">{payment.paymentMethod.split('_').join(" ")}</p>
          </div>
        </>
      )}
    </div>
  );
};

const UserTransactionClient = () => {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || '';
  const agentUserId = searchParams.get('agentUserId') || '';
  const { onOpen } = useTransactionModal();
  const { activeTab, setActiveTab } = useActiveTab();

  React.useEffect(() => {
    if (propertyId && agentUserId) {
      setActiveTab('make-payment');
    } else {
      setActiveTab('history');
    }
  }, [propertyId, agentUserId, setActiveTab]);

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

  const { data: searchedItem, status } = useQuery<any>({
    queryKey: ['property-check', propertyId, agentUserId],
    queryFn: fetchData,
    enabled: !!propertyId && !!agentUserId,
  });

  const calculateTotalFees = (mainFees: any) => {
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
          <ErrorState 
            message="No Search parameters !!!" 
            className="w-[80%] uppercase text-xs lg:text-sm mx-auto tracking-wider" 
          />
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div className='w-full p-3 rounded-lg flex flex-col gap-2 dark:border-white/70'>
          <div className='flex items-center gap-3 w-full'>
            <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]' />
            <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
          </div>
          <div className="gap-3 grid grid-cols-4">
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]' />
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]' />
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]' />
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className='size-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]' />
              <Skeleton className="flex-1 h-4 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            </div>
          </div>
          <div className='my-2 flex flex-wrap gap-x-1 gap-y-2'>
            <Skeleton className="h-7 rounded-full bg-[#d4d4d4] dark:bg-[#424242] w-[120px]" />
            {[1, 2, 3, 4, 5].map((item: number) => (
              <Skeleton key={item} className="h-7 rounded-full bg-[#d4d4d4] dark:bg-[#424242] w-[120px]" />
            ))}
          </div>
          <div className="flex items-center justify-between flex-row gap-3 w-full">
            <Skeleton className="flex-1 h-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242]" />
            <Skeleton className="h-5 rounded-full bg-[#d4d4d4] dark:bg-[#424242] w-[160px]" />
          </div>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="w-full flex items-center justify-center py-5">
          <ErrorState 
            message={`An error occurred while searching for "${propertyId}"`} 
            className='w-fit' 
          />
        </div>
      );
    }

    if (status === 'success' && !searchedItem) {
      return (
        <div className="w-full flex items-center py-5">
          <EmptyState 
            message={`No rent-out initialization for "${propertyId}"`} 
            className='w-fit' 
          />
        </div>
      );
    }

    if (status === 'success' && searchedItem) {
      const totalMainFees = calculateTotalFees(searchedItem?.mainFees);
      const mainAmount = searchedItem?.propertyTag === 'for-rent' ? searchedItem?.annualRent : searchedItem?.propertyPrice;
      const totalFees = mainAmount + totalMainFees;

      const handleProceed = () => {
        localStorage.setItem('totalPayment', `${totalFees}`);
        onOpen();
      };

      return (
        <div className='lg:w-[70%] md:w-[80%] w-full p-3 rounded-lg flex flex-col gap-2 dark:border-white/70'>
          <div className='flex items-center gap-2'>
            <HugeiconsIcon icon={MapsIcon} className='size-5' />
            {searchedItem?.address}, {searchedItem?.city}, {searchedItem?.state}.
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm lg:text-base">
              <HugeiconsIcon icon={BedIcon} className='size-5' />
              {searchedItem?.bedrooms}
            </div>
            <div className="flex items-center gap-2 text-sm lg:text-base">
              <HugeiconsIcon icon={Bathtub01Icon} className='size-5' />
              {searchedItem?.bathrooms}
            </div>
            <div className="flex items-center gap-2 text-sm lg:text-base">
              <HugeiconsIcon icon={Toilet01Icon} className='size-5' />
              {searchedItem?.toilets}
            </div>
            <div className="flex items-center gap-2 text-sm lg:text-base">
              <HugeiconsIcon icon={CenterFocusIcon} className='size-5' />
              <span>{searchedItem?.squareFootage} sqm</span>
            </div>
          </div>
          <div className='my-2 flex flex-wrap gap-x-1 gap-y-2'>
            <p className='bg-gray-300 dark:bg-[#424242] px-4 py-1.5 rounded-full text-sm font-medium'>
              {searchedItem?.propertyTag === 'for-rent' ? 'Annual rent' : 'Property Price'}: {nairaSign}{formatMoney(searchedItem?.propertyTag === 'for-rent' ? searchedItem?.annualRent : searchedItem?.propertyPrice)}
            </p>
            {searchedItem.mainFees && searchedItem.mainFees.length > 0 && searchedItem.mainFees.map((item: any) => (
              <p key={item.name} className='capitalize bg-gray-300 dark:bg-[#424242] px-4 py-1.5 rounded-full text-sm font-medium'>
                {item.name}: {nairaSign}{formatMoney(item.amount)}
              </p>
            ))}
          </div>
          <div className="flex items-center md:justify-between md:flex-row flex-col gap-3 md:gap-0">
            <p className='font-semibold text-white bg-red-500 py-1.5 px-4 rounded-full w-full md:w-fit'>
              Total Amount: {nairaSign}{formatMoney(totalFees)}
            </p>
            <button 
              type="button" 
              className='text-sm lg:text-base px-4 py-1.5 rounded-full inline-flex items-center gap-2 bg-gray-300 w-fit justify-between md:justify-normal ml-auto' 
              onClick={handleProceed}
            >
              Proceed With Payment
              <HugeiconsIcon icon={ArrowUpRight03Icon} className='rotate-45 size-5' />
            </button>
          </div>
        </div>
      );
    }
  };

  const PaymentHistory = () => {
    const [currentIndex, setCurrentIndex] = React.useState(-1);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [startDate, setStartDate] = React.useState<Date | undefined>();
    const [endDate, setEndDate] = React.useState<Date | undefined>();
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [typeFilter, setTypeFilter] = React.useState<string>('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<string>('all');
    const [currentPage, setCurrentPage] = React.useState(1);

    const toggleItem = React.useCallback((index: number) => {
      setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
    }, []);

    // Fetch transactions from API
    const fetchTransactions = async () => {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (paymentMethodFilter !== 'all') params.append('paymentMethod', paymentMethodFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '10');

      const response = await axios.get(`/api/user/get-transactions?${params.toString()}`);
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch transactions');
      }
      
      return response.data;
    };

    const { data, isLoading, isError } = useQuery({
      queryKey: ['transactions', searchQuery, startDate, endDate, statusFilter, typeFilter, paymentMethodFilter, currentPage],
      queryFn: fetchTransactions,
    });

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const clearFilters = () => {
      setSearchQuery('');
      setStartDate(undefined);
      setEndDate(undefined);
      setStatusFilter('all');
      setTypeFilter('all');
      setPaymentMethodFilter('all');
      setCurrentPage(1);
    };

    const transactions = data?.data || [];
    const totalPages = data?.pagination?.totalPages || 1;
    const totalTransactions = data?.pagination?.totalTransactions || 0;

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <SearchAndFilterSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          paymentMethodFilter={paymentMethodFilter}
          setPaymentMethodFilter={setPaymentMethodFilter}
          clearFilters={clearFilters}
          resultsCount={totalTransactions}
          isLoading={isLoading}
        />
        
        {isLoading ? (
          <PaymentHistorySkeleton />
        ) : isError ? (
          <div className="flex items-center justify-center py-20">
            <ErrorState message="Failed to load transactions. Please try again." />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className='min-h-[300px] max-h-[490px]'>
                <Table className='w-full border'>
                  <PaymentHeader />
                  <TableBody>
                    {transactions.map((payment: Payment) => (
                      <PaymentItem key={payment._id} payment={payment} />
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No payments found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {transactions.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </div>

            <div className='md:hidden'>
              <div className='w-full h-[560px] overflow-hidden'>
                <div className="flex flex-col">
                  {transactions.map((payment: Payment, index: number) => (
                    <MobileItem
                      key={payment._id}
                      open={currentIndex === index}
                      toggleTable={() => toggleItem(index)}
                      payment={payment}
                    />
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No payments found matching your criteria
                    </div>
                  )}
                </div>
              </div>
              {transactions.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className='w-full h-full flex flex-col py-6 lg:gap-5 gap-4'>
      <div className="lg:w-[80%] xl:w-[70%] md:w-[80%]">
        <div className="items-center flex justify-between w-full">
          <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Transactions</h2>
        </div>
        <div className="h-10 w-full flex lg:mt-5 mt-4">
          <button 
            className={cn(
              "cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase", 
              activeTab === 'make-payment' 
                ? 'border-b-2 border-black dark:border-red-500 font-semibold' 
                : 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70'
            )} 
            onClick={() => setActiveTab('make-payment')}
          >
            Make Payment
          </button>
          <button 
            className={cn(
              "cursor-pointer lg:w-[164px] md:w-[140px] w-[130px] text-xs lg:text-sm uppercase", 
              activeTab === 'history' 
                ? 'border-b-2 border-black dark:border-red-500 font-semibold' 
                : 'border-b dark:border-b-white/80 text-black/60 dark:text-white/70'
            )} 
            onClick={() => setActiveTab('history')}
          >
            Payment History
          </button>
          <div className="flex-1 border-b dark:border-b-white/80" />
        </div>
      </div>
      <div className='lg:w-[80%] xl:w-[70%] md:w-[80%]'>
        {activeTab === 'make-payment' && <SearchedProperty />}
      </div>
      <div className="w-full">
        {activeTab === 'history' && <PaymentHistory />}
      </div>
    </div>
  );
};

export default UserTransactionClient
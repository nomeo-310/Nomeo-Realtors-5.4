'use client'

import React, { useState, useMemo } from 'react'
import TransactionLayout from './transaction-layout'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, nairaSign } from '@/lib/utils';
import Pagination from '@/components/ui/pagination';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, Delete01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - replace with your actual data
const mockTransactions = [
  {
    id: 1,
    date: new Date('2025-11-20'),
    transactionId: 'T234567123456',
    type: 'Rental',
    currency: 'NGN',
    paymentMethod: 'Bank Transfer',
    amount: 145500.00,
    status: 'Claimed'
  },
  {
    id: 2,
    date: new Date('2025-11-18'),
    transactionId: 'T234567123457',
    type: 'Purchase',
    currency: 'NGN',
    paymentMethod: 'Online Transfer',
    amount: 2500000.00,
    status: 'Pending'
  },
  {
    id: 3,
    date: new Date('2025-11-15'),
    transactionId: 'T234567123458',
    type: 'Rental',
    currency: 'NGN',
    paymentMethod: 'Bank Transfer',
    amount: 185000.00,
    status: 'Failed'
  },
  {
    id: 4,
    date: new Date('2025-11-10'),
    transactionId: 'T234567123459',
    type: 'Service',
    currency: 'NGN',
    paymentMethod: 'Online Transfer',
    amount: 50000.00,
    status: 'Claimed'
  },
];

type Transaction = typeof mockTransactions[0];
type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
  transaction: Transaction;
};

const PaymentHistoryClient = () => {
  const PaymentHistory = () => {
    const [currentIndex, setCurrentIndex] = React.useState(-1);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const toggleItem = React.useCallback((index: number) => {
      setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
    }, []);

    const numberOfPages = 10;
    const [currentPage, setCurrentPage] = React.useState(1);

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    // Filter transactions based on search and filters
    const filteredTransactions = useMemo(() => {
      return mockTransactions.filter(transaction => {
        // Text search
        const matchesSearch = searchQuery === '' || 
          transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

        // Date range filter
        const matchesDateRange = (!startDate || transaction.date >= startDate) && 
                                (!endDate || transaction.date <= endDate);

        // Status filter
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

        // Type filter
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

        return matchesSearch && matchesDateRange && matchesStatus && matchesType;
      });
    }, [searchQuery, startDate, endDate, statusFilter, typeFilter]);

    const clearFilters = () => {
      setSearchQuery('');
      setStartDate(undefined);
      setEndDate(undefined);
      setStatusFilter('all');
      setTypeFilter('all');
    };

    const SearchAndFilterSection = () => {
      return (
        <div className="bg-white dark:bg-[#424242] rounded-lg border p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Search by Transaction ID, Type, or Payment Method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-start text-xs md:text-sm">
                    <HugeiconsIcon icon={Calendar02Icon} className="mr-2 size-4" />
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
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Claimed">Claimed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] text-xs md:text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Rental">Rental</SelectItem>
                  <SelectItem value="Purchase">Purchase</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
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

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </div>
        </div>
      );
    };

    const PaymentHeader = () => {
      return (
        <TableHeader className="rounded-lg h-12 [&_tr]:border-b">
          <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
            <TableHead className="text-center font-semibold uppercase">Date</TableHead>
            <TableHead className="text-center font-semibold uppercase">Transaction ID</TableHead>
            <TableHead className="text-center font-semibold uppercase">Type</TableHead>
            <TableHead className="text-center font-semibold uppercase">Currency</TableHead>
            <TableHead className="text-center font-semibold uppercase">Payment Method</TableHead>
            <TableHead className="text-center font-semibold uppercase">Amount</TableHead>
            <TableHead className="text-center font-semibold uppercase">Status</TableHead>
            <TableHead className="text-center font-semibold uppercase">Action</TableHead>
          </TableRow>
        </TableHeader>
      );
    };

    const PaymentItem = ({ transaction }: { transaction: Transaction }) => {
      return (
        <TableRow>
          <TableCell className="text-xs md:text-sm text-center">
            {format(transaction.date, 'do MMM, yyyy')}
          </TableCell>
          <TableCell className="text-xs md:text-sm text-center">{transaction.transactionId}</TableCell>
          <TableCell className="text-xs md:text-sm text-center capitalize">{transaction.type}</TableCell>
          <TableCell className="text-xs md:text-sm text-center">{transaction.currency}</TableCell>
          <TableCell className="text-xs md:text-sm text-center capitalize">{transaction.paymentMethod}</TableCell>
          <TableCell className="text-xs md:text-sm text-center">{nairaSign} {transaction.amount.toLocaleString()}</TableCell>
          <TableCell className="text-xs md:text-sm text-center">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs",
              transaction.status === 'Claimed' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
              transaction.status === 'Pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              transaction.status === 'Failed' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}>
              {transaction.status}
            </span>
          </TableCell>
          <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
            <HugeiconsIcon icon={Delete01Icon} className='size-5 text-red-500'/>
          </TableCell>
        </TableRow>
      );
    };

    const MobileItem = ({ open, toggleTable, transaction }: mobileItemProps) => {
      return (
        <div className={cn("shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit dark:odd:bg-gray-700 dark:even:bg-[#424242] h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto' : '')} onClick={toggleTable}>
          <div className="flex items-center justify-between">
            <p className="text-sm capitalize">{transaction.type}</p>
            <p className="text-sm">{nairaSign} {transaction.amount.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs",
              transaction.status === 'Claimed' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
              transaction.status === 'Pending' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
              transaction.status === 'Failed' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}>
              {transaction.status}
            </span>
            <p className="text-sm text-black/40 dark:text-white/60">{format(transaction.date, 'do MMM, yyyy')}</p>
          </div>
          {open && (
            <>
              <div className="border-b border-black dark:border-white/30 my-3"/>
              <div className="flex items-center justify-between">
                <p className="text-sm">Transaction ID</p>
                <p className="text-sm">{transaction.transactionId}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Currency</p>
                <p className="text-sm uppercase">{transaction.currency}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Payment Method</p>
                <p className="text-sm capitalize">{transaction.paymentMethod}</p>
              </div>
            </>
          )}
        </div>
      );
    };

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className="hidden md:block">
          <div className='min-h-[300px] max-h-[490px]'>
            <Table className='w-full border'>
              <PaymentHeader/>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <PaymentItem key={transaction.id} transaction={transaction} />
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No transactions found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={currentPage} totalPages={numberOfPages} onPageChange={handlePageChange} />
        </div>
        
        <div className='md:hidden'>
          <div className='w-full h-[560px] overflow-hidden'>
            <div className="flex flex-col">
              {filteredTransactions.map((transaction, index) => (
                <MobileItem
                  key={transaction.id}
                  open={currentIndex === index}
                  toggleTable={() => toggleItem(index)}
                  transaction={transaction}
                />
              ))}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No transactions found matching your criteria
                </div>
              )}
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={numberOfPages} onPageChange={handlePageChange} />
        </div>
      </div>
    );
  };
  
  return (
    <TransactionLayout>
      <PaymentHistory/>
    </TransactionLayout>
  );
};

export default PaymentHistoryClient;
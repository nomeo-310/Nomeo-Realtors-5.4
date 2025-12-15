'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, nairaSign } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Pagination from '@/components/ui/pagination'
import { CheckCircle, Eye, MoreHorizontalIcon, XCircle } from 'lucide-react'
import { AdminDetailsProps, VerificationRentalProps } from '@/lib/types'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequestHandler } from '@/utils/apiRequestHandler'
import { capitalizeName } from '@/utils/capitalizeName'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import Link from 'next/link'
import PendingsWrapper from './pendings-wrapper'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { verifyRentout } from '@/actions/pending-action'
import TableLoading from '../table-loading'
import { formatDate } from '@/utils/formatDate'

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
  data: VerificationRentalProps;
};

interface dataProps {
  pagination: {
    currentPage: number,
    totalPages: number,
    totalApartments: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
  },
  rentouts: VerificationRentalProps[]
}

const PendingRentalClient = ({user}:{user:AdminDetailsProps}) => {

  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [currentPage, setCurrentPage] = React.useState(1);

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const requestUnverifiedRentals = () => axios.get(`/api/admin/pendings/rentals?page=${currentPage}`);

  const { data, status } = useQuery({
    queryKey: ['unverified-rentals', currentPage],
    queryFn: () => apiRequestHandler(requestUnverifiedRentals),
    refetchOnWindowFocus: false,
    refetchInterval: 15000
  });
  
  const unverifiedApartmentsData = data?.data as dataProps
  const apartments = unverifiedApartmentsData?.rentouts || [];
  const pagination = unverifiedApartmentsData?.pagination || null;

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const router = useRouter();

  const getDates = () => {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    return {
      today,
      oneYearFromNow
    };
  }

  const { today, oneYearFromNow } = getDates();
  const pathname = usePathname();

  const queryClient = useQueryClient();

  const handleCompleteRental = async (id:string) => {

    if (!id) {
      console.error('Property ID is missing');
      return;
    }

    const values = {
      startDate: today,
      endDate: oneYearFromNow,
      rentoutId: id,
      path: pathname
    };

    try {
      await toast.promise(verifyRentout(values), {
        loading: 'Completing rentout...',
        success: (response) => {
          if (response.success) {
            queryClient.invalidateQueries({queryKey: ['unverified-rentals']})
            queryClient.invalidateQueries({queryKey: ['unread-pending-count']})
            return response.message;
          } else {
            throw new Error(response.message);
          }
        },
        error: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return 'Something went wrong. Try again later';
        }
      });
    } catch (error) {
      toast.error('Something went wrong. Try again later')
      console.error('Error approving apartment:', error);
    }
  };

  const PendingRentalHeader = () => {
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

  const PendingRentalItem = ({data}:{data:VerificationRentalProps}) => {
    return (
      <TableRow>
        <TableCell className="text-xs md:text-sm text-center">{capitalizeName(data?.agent.userId.surName)} {capitalizeName(data?.agent.userId.lastName)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data?.agent.agencyName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{capitalizeName(data?.user.surName)} {capitalizeName(data?.user.lastName)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{nairaSign}{data?.apartment.annualRent.toLocaleString()}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{nairaSign}{data?.totalAmount?.toLocaleString() ?? 0}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data?.status}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{formatDate(data?.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu data={data}/>
        </TableCell>
      </TableRow>
    )
  };

  const MobilePendingRentalItem = ({ open, toggleTable, data }: mobileItemProps) => {
    
    const handleCompleteRental = () => {
      // Add complete rental function
      console.log('Complete rental:', data._id);
    };

    const handleCancelRental = () => {
      // Add cancel rental function
      console.log('Cancel rental:', data._id);
    };

    const handleViewApartment = () => {
      router.push(`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/pendings/${data?.apartment.propertyIdTag}`);
    };

    return (
      <div 
        className={cn(
          "shadow-sm border-b last:border-b-0 w-full p-4 cursor-pointer transition-all duration-300 bg-white dark:bg-[#424242]",
          open ? 'h-auto' : 'h-[72px]'
        )}
        onClick={toggleTable}
      >
        {/* Compact View (when not open) */}
        <div className="flex items-center justify-between">
          {/* Left side: Rental info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Rental avatar/initials with pending indicator */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                    R
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-[#424242]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate dark:text-white">
                  {capitalizeName(data?.user.surName)} {capitalizeName(data?.user.lastName)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Pending
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {data?.apartment.propertyTag || 'Apartment'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Status and amount */}
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              {nairaSign}{data?.apartment.annualRent?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(data?.createdAt)}
            </span>
          </div>
        </div>

        {/* Expanded View (when open) */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
            {/* Rental Status Banner */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-white">Rental Pending Verification</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    This rental agreement requires verification
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Rental Status</p>
                  <p className="text-sm font-medium dark:text-white">
                    {data?.status || 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agent</p>
                <p className="text-sm font-medium dark:text-white">
                  {capitalizeName(data?.agent.userId.surName)} {capitalizeName(data?.agent.userId.lastName)}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agency</p>
                <p className="text-sm font-medium dark:text-white">
                  {data?.agent.agencyName}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Occupant</p>
                <p className="text-sm font-medium dark:text-white">
                  {capitalizeName(data?.user.surName)} {capitalizeName(data?.user.lastName)}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Property</p>
                <p className="text-sm font-medium dark:text-white truncate">
                  {data?.apartment.propertyIdTag}
                </p>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-1 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Annual Rent</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {nairaSign}{data?.apartment.annualRent?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Paid</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {nairaSign}{data?.totalAmount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 px-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Date Created</p>
                <p className="text-sm dark:text-white">
                  {formatDate(data?.createdAt)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewApartment();
                  }}
                  className="px-3 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Apartment
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteRental();
                  }}
                  className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelRental();
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium col-span-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Rental
                </button>
              </div>
              
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                Verify rental details before completing
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Menu = ({data}:{data:VerificationRentalProps}) => {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 min-w-[200px] p-2" align="end">
          {/* View Actions */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Apartment</p>
            <DropdownMenuItem 
              onClick={() => router.push(`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/pendings/${data?.apartment.propertyIdTag}`)}
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
              View Apartment
            </DropdownMenuItem>
          </div>

          {/* Rental Management */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rental Status</p>
            <DropdownMenuItem 
              onClick={() => handleCompleteRental(data._id)}
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 mb-1"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Rental
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10">
              <XCircle className="w-4 h-4" />
              Cancel Rental
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const PendingRentalList = () => {
    const header = ['agent name', 'agency name', 'occupant', 'annual rent', 'total amount paid', 'rental status', 'date', 'action'];

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className='md:min-h-[300px] md:max-h-[490px] h-[560px]'>
          {status === 'pending' &&
            <div className='w-full'>
              <TableLoading tableHeader={header}/>
            </div>
          }
          {status === 'error' &&
            <div className='w-full h-full items-center'>
              <ErrorState message='An error occurred while fetching rentouts. Try again later.'/>
            </div>
          }
          {status === 'success' && apartments.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message='No pending rentouts at the moment.'/>
            </div>
          }
          {status === 'success' && apartments.length > 0 &&
            <React.Fragment>
              <div className='hidden md:block'>
                <Table className='w-full border'>
                  <PendingRentalHeader/>
                  <TableBody>
                    {apartments && apartments.length > 0 && apartments.map((apartment: VerificationRentalProps) => (
                      <PendingRentalItem key={apartment._id} data={apartment}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </div>
              <div className='flex flex-col md:hidden'>
                {apartments && apartments.length > 0 && apartments.map((apartment: VerificationRentalProps, index: number) => (
                  <MobilePendingRentalItem
                    key={apartment._id}
                    open={currentIndex === index}
                    toggleTable={() => toggleItem(index)}
                    data={apartment}
                  />
                ))}
                <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </div>
            </React.Fragment>
          }
        </div>
      </div>
    )
  };

  return (
    <PendingsWrapper user={user}>
      <PendingRentalList/>
    </PendingsWrapper>
  )
};

export default PendingRentalClient
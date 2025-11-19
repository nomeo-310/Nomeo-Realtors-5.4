'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, nairaSign } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Pagination from '@/components/ui/pagination'
import { CheckCircle, Eye, Loader2, MoreHorizontalIcon, XCircle } from 'lucide-react'
import { AdminDetailsProps, VerificationRentalProps } from '@/lib/types'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequestHandler } from '@/utils/apiRequestHandler'
import { capitalizeName } from '@/utils/capitalizeName'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import Link from 'next/link'
import PendingsWrapper from './pendings-wrapper'
import { usePathname } from 'next/navigation'
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
    refetchOnWindowFocus: false
  });
  
  const unverifiedApartmentsData = data?.data as dataProps
  const apartments = unverifiedApartmentsData?.rentouts || [];
  const pagination = unverifiedApartmentsData?.pagination || null;

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

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

  const MobilePendingRentalItem = ({open, toggleTable, data }:mobileItemProps) => {
    return (
      <div className={cn("shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto': '')} onClick={toggleTable}>
        <div className="flex items-center justify-between">
          <p className="text-sm">{capitalizeName(data?.agent.userId.surName)} {capitalizeName(data?.agent.userId.lastName)}</p>
          <p className="text-sm">{data?.agent.agencyName}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center font-medium text-sm")}>{capitalizeName(data?.user.surName)} {capitalizeName(data?.user.lastName)}</p>
          <p className="text-sm text-black/40">{data?.status}</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm">Annual Rent</p>
          <p className="text-sm">{nairaSign} {data?.apartment.annualRent.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">Total Amount Paid</p>
          <p className="text-sm">{nairaSign} {data?.totalAmount?.toLocaleString() ?? 0}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">Date</p>
          <p className="text-sm capitalize">{data?.createdAt}</p>
        </div>
      </div>
    )
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
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50">
              <Eye className="w-4 h-4" />
              <Link href={`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/pendings/${data?.apartment.propertyIdTag}`} prefetch className="w-full">
                View Apartment
              </Link>
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
                    {apartments && apartments.length > 0 && apartments.map((apartment:VerificationRentalProps) => (
                      <PendingRentalItem data={apartment}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </div>
              <div className='flex flex-col md:hidden'>
                {apartments && apartments.length > 0 && apartments.map((apartment:VerificationRentalProps) => (
                  <MobilePendingRentalItem
                    key={apartment._id}
                    open={currentIndex === apartments.indexOf(apartment)}
                    toggleTable={() => toggleItem(apartments.indexOf(apartment))}
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
'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, nairaSign } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Pagination from '@/components/ui/pagination'
import { Loader2, MoreHorizontalIcon } from 'lucide-react'
import { AdminDetailsProps, VerificationSalesProps } from '@/lib/types'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequestHandler } from '@/utils/apiRequestHandler'
import { capitalizeName } from '@/utils/capitalizeName'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import { formatDate } from '@/utils/formatDate'
import Link from 'next/link'
import PendingsWrapper from './pendings-wrapper'
import { verifySellout } from '@/actions/pending-action'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import TableLoading from '../table-loading'

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
  data: VerificationSalesProps;
};

interface dataProps {
  pagination: {
    currentPage: number,
    totalPages: number,
    totalApartments: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
  },
  sellouts: VerificationSalesProps[]
}

const PendingSalesClient = ({user}:{user:AdminDetailsProps}) => {

  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [currentPage, setCurrentPage] = React.useState(1);

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const requestUnverifiedRentals = () => axios.get(`/api/admin/pendings/sales?page=${currentPage}`);

  const { data, status } = useQuery({
    queryKey: ['unverified-sales', currentPage],
    queryFn: () => apiRequestHandler(requestUnverifiedRentals),
    refetchOnWindowFocus: false
  });
  
  const unverifiedApartmentsData = data?.data as dataProps
  const apartments = unverifiedApartmentsData?.sellouts || [];
  const pagination = unverifiedApartmentsData?.pagination || null;

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleCompleteSellout = async (id:string) => {

    if (!id) {
      console.error('Property ID is missing');
      return;
    }

    const values = {
      sellOutId: id,
      path: pathname
    };

    try {
      await toast.promise(verifySellout(values), {
        loading: 'Confirming purchase...',
        success: (response) => {
          if (response.success) {
            queryClient.invalidateQueries({queryKey: ['unverified-sales']})
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

  const PendingSalesHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          <TableHead className="text-center font-semibold uppercase">Agent Name</TableHead>
          <TableHead className="text-center font-semibold uppercase">Agency Name</TableHead>
          <TableHead className="text-center font-semibold uppercase">Occupant</TableHead>
          <TableHead className="text-center font-semibold uppercase">Property Price</TableHead>
          <TableHead className="text-center font-semibold uppercase">Total Amount Paid</TableHead>
          <TableHead className="text-center font-semibold uppercase">Sales Status</TableHead>
          <TableHead className="text-center font-semibold uppercase">Date</TableHead>
          <TableHead className="text-center font-semibold uppercase">Action</TableHead>
        </TableRow>
      </TableHeader>
    )
  };

  const PendingSalesItem = ({data}:{data:VerificationSalesProps}) => {
    return (
      <TableRow>
        <TableCell className="text-xs md:text-sm text-center">{capitalizeName(data?.agent.userId.surName)} {capitalizeName(data?.agent.userId.lastName)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data?.agent.agencyName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{capitalizeName(data?.user.surName)} {capitalizeName(data?.user.lastName)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{nairaSign}{data?.apartment.propertyPrice.toLocaleString()}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{nairaSign}{data?.totalAmount?.toLocaleString() ?? 0}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data?.status}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{formatDate(data?.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu data={data}/>
        </TableCell>
      </TableRow>
    )
  };

  const PendingSalesMobileItem = ({open, toggleTable, data }:mobileItemProps) => {
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
          <p className="text-sm">Property Price</p>
          <p className="text-sm">{nairaSign} {data?.apartment.propertyPrice.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">Total Amount Paid</p>
          <p className="text-sm">{nairaSign} {data?.totalAmount?.toLocaleString() ?? 0}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">Date</p>
          <p className="text-sm capitalize">{formatDate(data?.createdAt)}</p>
        </div>
      </div>
    )
  };

  const Menu = ({data}:{data:VerificationSalesProps}) => {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href={`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/pendings/sellouts/${data.apartment.propertyIdTag}`} prefetch>
              View Apartment
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCompleteSellout(data._id)}>
            Confirm Purchased
          </DropdownMenuItem>
          <DropdownMenuItem>
            Cancel Purchase
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const PendingSalesList = () => {
    const header = ['agent name', 'agency name', 'occupant', 'property price', 'total amount paid', 'sales status', 'date', 'action'];
    
    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className="hidden md:block">
          <div className='md:min-h-[300px] md:max-h-[490px] h-[560px]'>
            {status === 'pending' &&
              <div className='w-full'>
                <TableLoading tableHeader={header}/>
              </div>
            }
            {status === 'error' &&
              <div className='w-full h-full items-center'>
                <ErrorState message='An error occurred while fetching sellouts. Try again later.'/>
              </div>
            }
            {status === 'success' && apartments.length === 0 &&
              <div className='w-full h-full items-center'>
                <EmptyState message='No pending sellouts at the moment.'/>
              </div>
            }
            {status === 'success' && apartments && apartments.length > 0 &&
              <React.Fragment>
                <div className='hidden md:block'>
                  <Table className='w-full border'>
                    <PendingSalesHeader/>
                    <TableBody>
                      {apartments.map((apartment:VerificationSalesProps) => (
                        <PendingSalesItem data={apartment}/>
                      ))}
                    </TableBody>
                  </Table>
                  <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                </div>
                <div className="flex flex-col md:hidden">
                  {apartments.map((apartment:VerificationSalesProps) => (
                    <PendingSalesMobileItem
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
      </div>
    )
  };

  return (
    <PendingsWrapper user={user}>
      <PendingSalesList/>
    </PendingsWrapper>
  )
}

export default PendingSalesClient
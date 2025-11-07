'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, getUserRole } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Pagination from '@/components/ui/pagination'
import { Loader2, MoreHorizontalIcon } from 'lucide-react'
import VerificationsWrapper from './verifications-wrapper'
import { AdminDetailsProps, VerificationPropertyProps } from '@/lib/types'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequestHandler } from '@/utils/apiRequestHandler'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import { capitalizeName } from '@/utils/capitalizeName'
import Link from 'next/link'
import { canManageApartments } from '@/utils/permission-utils'
import { usePathname } from 'next/navigation'
import { verifyApartment } from '@/actions/verification-actions'
import { toast } from 'sonner'

type mobileItemProps = {
  open: boolean;
  toggleTable: () => void;
  data: VerificationPropertyProps;
};

interface dataProps {
  pagination: {
    currentPage: number,
    totalPages: number,
    totalApartments: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
  },
  apartments: VerificationPropertyProps[]
}

const ApartmentVerificationClient = ({user}:{user:AdminDetailsProps}) => {

  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [currentPage, setCurrentPage] = React.useState(1);

  const requestUnverifiedAgents = () => axios.get(`/api/admin/unverified-apartments?page=${currentPage}`);

  const { data, status } = useQuery({
    queryKey: ['unverified-apartments', currentPage],
    queryFn: () => apiRequestHandler(requestUnverifiedAgents),
    refetchOnWindowFocus: false
  });

  const unverifiedApartmentsData = data?.data as dataProps
  const apartments = unverifiedApartmentsData?.apartments || [];
  const pagination = unverifiedApartmentsData?.pagination || null;

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const VerificationHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
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

  const VerificationItem = ({data}:{data: VerificationPropertyProps}) => {
    return (
      <TableRow className='cursor-pointer group'>
        <TableCell className="text-xs md:text-sm text-center">{capitalizeName(data.agent.userId.surName)} {capitalizeName(data.agent.userId.lastName)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize group">
          <Link href={`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/verifications/apartments/${data.propertyIdTag}`} className='group-hover:underline'>
            {data.propertyIdTag}
          </Link>
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{data.propertyTypeTag}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data.bedrooms}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{data.bathrooms}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize">{data.toilets}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data.state}</TableCell>
        <TableCell className="text-xs md:text-sm text-center">{data.city}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu data={data}/>
        </TableCell>
      </TableRow>
    )
  };

  const MobileItem = ({open, toggleTable, data }:mobileItemProps) => {
    return (
      <div className={cn("shadow-sm border-b last:border-b-0 w-full odd:bg-gray-200 even:bg-inherit h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto': '')} onClick={toggleTable}>
        <div className="flex items-center justify-between">
          <p className="text-sm">{capitalizeName(data.agent.userId.surName)} {capitalizeName(data.agent.userId.lastName)}</p>
          <p className="text-sm">
            <Link href={`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/verifications/apartments/${data.propertyIdTag}`} prefetch>
              {data.propertyIdTag}
            </Link>
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center font-medium text-sm")}>{data.propertyTypeTag}</p>
          <p className="text-sm text-black/40">{data.bedrooms} rooms</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm">{data.bathrooms} Bathrooms</p>
          <p className="text-sm">{data.toilets} Toilets</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">State</p>
          <p className="text-sm">{data.state}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm">City</p>
          <p className="text-sm capitalize">{data.city}</p>
        </div>
      </div>
    )
  };

  const canApprove = canManageApartments(getUserRole(user.role));
  const path = usePathname();
  const queryClient = useQueryClient();

  const handleApproval = async (id:string) => {

    if (!id) {
      console.error('Property ID is missing');
      return;
    }

    const values = {
      apartmentId: id,
      path: path
    };

    try {
      await verifyApartment(values)
      .then((response) => {
        if (response.success) {
          toast.success(response.message);
          queryClient.invalidateQueries({queryKey: ['unverified-apartments']})
        } else {
          toast.error(response.message)
        }
      })
    } catch (error) {
      toast.error('Something went wrong. Try again later')
      console.error('Error approving apartment:', error);
    }
  };

  const Menu = ({data}:{data: VerificationPropertyProps}) => {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href={`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/verifications/apartments/${data.propertyIdTag}`} prefetch>
              View Details
            </Link>
          </DropdownMenuItem>
          { canApprove && 
            <React.Fragment>
              <DropdownMenuItem onClick={() => handleApproval(data._id)}>
                Approve Property
              </DropdownMenuItem>
              <DropdownMenuItem>
                Reject Property
              </DropdownMenuItem>
            </React.Fragment>
          }
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const VerificationHistory = () => {

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className="hidden md:block">
          <div className='min-h-[300px] max-h-[490px] '>
            {status === 'pending' &&
              <div className='w-full h-full flex items-center justify-center py-24'>
                <Loader2 className='animate-spin'/>
              </div>
            }
            {status === 'error' &&
              <div className='w-full h-full items-center'>
                <ErrorState message='An error occurred while fetching apartments. Try again later.'/>
              </div>
            }
            {status === 'success' && apartments.length === 0 &&
              <div className='w-full h-full items-center'>
                <EmptyState message='No unverified apartments at the moment.'/>
              </div>
            }
            {status === 'success' && apartments.length > 0 &&
              <React.Fragment>
                <Table className='w-full border'>
                  <VerificationHeader/>
                  <TableBody>
                    {apartments && apartments.length > 0 && apartments.map((apartment:VerificationPropertyProps) => (
                      <VerificationItem data={apartment} key={apartment._id}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </React.Fragment>
            }
          </div>
        </div>
        <div className='md:hidden'>
          <div className='w-full h-[560px] overflow-hidden'>
            <div className="flex flex-col">
              {status === 'pending' &&
                <div className='w-full h-full flex items-center justify-center py-24'>
                  <Loader2 className='animate-spin'/>
                </div>
              }
              {status === 'error' &&
                <div className='w-full h-full items-center'>
                  <ErrorState message='An error occurred while fetching apartments. Try again later.'/>
                </div>
              }
              {status === 'success' && apartments.length === 0 &&
                <div className='w-full h-full items-center'>
                  <EmptyState message='No unverified apartments at the moment.'/>
                </div>
              }
              {status === 'success' && apartments.length > 0 &&
                <React.Fragment>
                  {apartments && apartments.length > 0 && apartments.map((apartment:VerificationPropertyProps) => (
                    <MobileItem
                      key={apartment._id}
                      open={currentIndex === apartments.indexOf(apartment)}
                      toggleTable={() => toggleItem(apartments.indexOf(apartment))}
                      data={apartment}
                    />
                  ))}
                  <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                </React.Fragment>
              }
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={pagination?.totalPages} onPageChange={handlePageChange} />
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

export default ApartmentVerificationClient
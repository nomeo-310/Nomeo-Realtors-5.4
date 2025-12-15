'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, getUserRole } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Pagination from '@/components/ui/pagination'
import { CheckCircle, Eye, MoreHorizontalIcon, XCircle } from 'lucide-react'
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
import { usePathname, useRouter } from 'next/navigation'
import { verifyApartment } from '@/actions/verification-actions'
import { toast } from 'sonner'
import { useRejectPropertyModal } from '@/hooks/general-store'
import { formatDate } from '@/utils/formatDate'
import TableLoading from '../table-loading'

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

  const requestUnverifiedAgents = () => axios.get(`/api/admin/verifications/apartments?page=${currentPage}`);

  const { data, status } = useQuery({
    queryKey: ['unverified-apartments', currentPage],
    queryFn: () => apiRequestHandler(requestUnverifiedAgents),
    refetchOnWindowFocus: false,
    refetchInterval: 15000
  });

  const unverifiedApartmentsData = data?.data as dataProps
  const apartments = unverifiedApartmentsData?.apartments || [];
  const pagination = unverifiedApartmentsData?.pagination || null;

  const router = useRouter();

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const ApartmentVerificationHeader = () => {
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
          <TableHead className="text-center font-semibold uppercase">Date</TableHead>
          <TableHead className="text-center font-semibold uppercase">Action</TableHead>
        </TableRow>
      </TableHeader>
    )
  };

  const ApartmentVerificationItem = ({data}:{data: VerificationPropertyProps}) => {
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
        <TableCell className="text-xs md:text-sm text-center">{formatDate(data.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu data={data}/>
        </TableCell>
      </TableRow>
    )
  };

  const ApartmentVerificationMobileItem = ({ open, toggleTable, data }: mobileItemProps) => {
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const propertyRejectionModal = useRejectPropertyModal();

    const handleApproval = async () => {
      if (!data._id) {
        console.error('Property ID is missing');
        return;
      }

      const values = {
        apartmentId: data._id,
        path: pathname
      };

      try {
        await toast.promise(verifyApartment(values), {
          loading: 'Approving Apartment...',
          success: (response) => {
            if (response.success) {
              queryClient.invalidateQueries({ queryKey: ['unverified-apartments'] })
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

    const handleRejection = () => {
      localStorage.setItem('rejection-propertyId', data._id);
      propertyRejectionModal.onOpen();
    };

    const handleViewDetails = () => {
      router.push(`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/verifications/apartments/${data.propertyIdTag}`);
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
          {/* Left side: Property info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Property avatar/initials with verification indicator */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                    P
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-[#424242]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate dark:text-white">
                  {data.propertyIdTag}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Pending Verification
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {data.propertyTypeTag}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Rooms and location */}
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              {data.bedrooms} rooms
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {data.city}
            </span>
          </div>
        </div>

        {/* Expanded View (when open) */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
            {/* Verification Status Banner */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-white">Property Verification Pending</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Review property details before verification
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Property Type</p>
                  <p className="text-sm font-medium dark:text-white capitalize">
                    {data.propertyTypeTag}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Property ID</p>
                <p className="text-sm font-medium dark:text-white font-mono">
                  {data.propertyIdTag}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agent</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {capitalizeName(data.agent.userId.surName)} {capitalizeName(data.agent.userId.lastName)}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {data.city}, {data.state}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Listed</p>
                <p className="text-sm font-medium dark:text-white">
                  {formatDate(data.createdAt)}
                </p>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-1 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Rooms</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {data.bedrooms}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Baths</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {data.bathrooms}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Toilets</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {data.toilets}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                  className="px-3 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                
                {canApprove && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproval();
                      }}
                      className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejection();
                      }}
                      className="px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium col-span-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Property
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                Review property documents before verification
              </p>
            </div>
          </div>
        )}
      </div>
    );
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
      await toast.promise(verifyApartment(values), {
        loading: 'Approving Apartment...',
        success: (response) => {
          if (response.success) {
            queryClient.invalidateQueries({queryKey: ['unverified-apartments']})
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

  const { onOpen } = useRejectPropertyModal();

  const handleRejection = (id:string) => {
    localStorage.setItem('rejection-propertyId', id);
    onOpen();
  }

  const Menu = ({data}:{data: VerificationPropertyProps}) => {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 min-w-[200px] p-2" align="end">
          {/* Property Details */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Property</p>
            <DropdownMenuItem 
              onClick={() => router.push(`/${user.role === 'superAdmin' ? 'superadmin' : user.role}-dashboard/verifications/apartments/${data.propertyIdTag}`)}
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
              View Details
            </DropdownMenuItem>
          </div>

          {/* Verification Actions */}
          {canApprove && (
            <div className="p-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Verification</p>
              <DropdownMenuItem 
                onClick={() => handleApproval(data._id)}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 mb-1"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Property
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleRejection(data._id)}
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <XCircle className="w-4 h-4" />
                Reject Property
              </DropdownMenuItem>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const ApartmentVerificationList = () => {
    const header = ['agent name', 'property tag', 'property id', 'no of rooms', 'no of baths', 'no of toilets', 'state', 'city', 'date', 'action'];

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className='min-h-[300px] max-h-[490px] h-[560px]'>
          {status === 'pending' &&
            <div className='w-full'>
              <TableLoading tableHeader={header}/>
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
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <ApartmentVerificationHeader/>
                  <TableBody>
                    {apartments && apartments.length > 0 && apartments.map((apartment:VerificationPropertyProps) => (
                      <ApartmentVerificationItem data={apartment} key={apartment._id}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
              </div>
              <div className="md:hidden flex flex-col">
                {apartments && apartments.length > 0 && apartments.map((apartment: VerificationPropertyProps, index: number) => (
                  <ApartmentVerificationMobileItem
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
    <VerificationsWrapper user={user}>
      <ApartmentVerificationList/>
    </VerificationsWrapper>
  )
}

export default ApartmentVerificationClient
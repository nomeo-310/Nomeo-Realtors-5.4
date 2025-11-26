'use client'

import React from 'react'
import { AdminDetailsProps, BasicAgentProps,  PaginationProps } from '@/lib/types'
import AgentsWrapper from './agents-wrapper'
import { useFilterStore } from '@/hooks/usefilter-store';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/utils/formatDate'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BadgeCheck, Ban, Bell, Eye, MessageCircle, MoreHorizontalIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TableLoading from '../table-loading';
import Pagination from '@/components/ui/pagination';

interface ApiResponse {
  users: BasicAgentProps[];
  pagination: PaginationProps
}

type mobileItemProps = {
  open: boolean;
  user: BasicAgentProps;
  toggleTable: () => void;
};

const UnverifiedAgentsClient = ({user}:{user:AdminDetailsProps}) => {
  const { search, sortOrder } = useFilterStore();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  
  const queryData = React.useMemo(() => ({
    queryText: search,
    sortOrder: sortOrder,
    page: currentPage
  }), [search, sortOrder, currentPage]);

  const fetchData = async (): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>('/api/admin/agents/unverified', queryData);

      if (response.status !== 200) {
        throw new Error(`API returned status: ${response.status}`);
      }

    return response.data;
    } catch (error:any) {
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      throw new Error(errorMessage);
    }
  };

  const { data, status } = useQuery<ApiResponse>({
    queryKey: ['unverified-agents', search, sortOrder, currentPage],
    queryFn: fetchData,
    retry: 2,
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOrder]);

  const users = data?.users || [];
  const pagination = data?.pagination || null;

  const getStartingSerialNumber = () => {
    const perPage = pagination?.perPage ?? 0;
    return (currentPage - 1) * perPage + 1;
  };
  
  const startingSerial = getStartingSerialNumber();

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const header = ['s/n', 'fullname', 'agency name', 'email', 'license number',  'verification', 'city', 'state', 'date joined', 'action'];

  const UserListHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          {header.map((item: string, idx: number) => (
            <TableHead className="text-center font-semibold uppercase border-r text-xs last:border-r-0" key={idx}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
    )
  };

  const UserListItem = ({user, index}:{user:BasicAgentProps, index:number}) => {
    return (
      <TableRow className='border'>
        <TableCell className="text-xs md:text-sm text-center border-r">{startingSerial + index}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.surName} {user.lastName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.agentId.agencyName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.email}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r capitalize">{user.agentId.licenseNumber}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r text-green-600 font-semibold">{user.agentId.agentVerified ? 'verified' : 'unverified'}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.city}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.state}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{formatDate(user.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu/>
        </TableCell>
      </TableRow>
    )
  };

  const Menu = () => {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-[200px]" align="end">
          {/* Profile Actions */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Profile</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors mb-1">
              <Eye className="w-4 h-4 text-gray-600" />
              View User Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50">
              <MessageCircle className="w-4 h-4" />
              Send Message
            </DropdownMenuItem>
          </div>

          {/* Verification Actions */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Verification</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 mb-1">
              <BadgeCheck className="w-4 h-4" />
              Verify Agent
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50">
              <Bell className="w-4 h-4" />
              Send Verification Reminder
            </DropdownMenuItem>
          </div>

          {/* Danger Zone */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Danger Zone</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-amber-600 focus:text-amber-600 focus:bg-amber-50 mb-1">
              <Ban className="w-4 h-4" />
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
              Delete User
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const MobileItem = ({open, toggleTable, user }:mobileItemProps) => {
    return (
      <div className={cn("shadow-sm border-b last:border-b-0 w-full h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto': '')} onClick={toggleTable}>
        <div className="flex items-center justify-between">
          <p className="text-sm capitalize font-semibold">{user.surName} {user.lastName}</p>
          <p className="text-sm capitalize font-semibold">{user.agentId.agencyName}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center text-sm")}>{user.email}</p>
          <p className="text-sm">{user.city}, {user.state}</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Verification Status</p>
          <p className="text-sm capitalize text-green-600 font-semibold">{user.userVerified ? 'verified' : 'unverified'}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Location</p>
          <p className="text-sm capitalize">{user.city}, {user.state}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Date Joined</p>
          <p className="text-sm capitalize">{formatDate(user.createdAt)}</p>
        </div>
      </div>
    )
  };

  const TableList = () => {

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className='min-h-[300px] max-h-[490px] h-[560px]'>
          {status === 'pending' &&
            <div className='w-full'>
              <TableLoading tableHeader={header}/>
            </div>
          }
          {status === 'error' &&
            <div className='w-full h-full items-center '>
              <ErrorState message='An error occurred while fetching agents. Try again later.'/>
            </div>
          }
          {status === 'success' && users.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message={ search !== '' ? 'No agent found for the search query' : 'No unverified agents at the moment.'}/>
            </div>
          }
          {status === 'success' && users && users.length > 0 &&
            <React.Fragment>
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <UserListHeader/>
                  <TableBody>
                    {users.map((user:BasicAgentProps, index:number) => (
                      <UserListItem user={user} index={index} key={index}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination?.totalPages ?? 1} onPageChange={handlePageChange} />
              </div>
              <div className="flex flex-col md:hidden">
                {users.map((user:BasicAgentProps, index:number) => (
                  <React.Fragment>
                    <MobileItem
                      key={index}
                      open={currentIndex === index}
                      toggleTable={() => toggleItem(index)}
                      user={user}
                    />
                  </React.Fragment>
                ))}
                <Pagination currentPage={currentPage} totalPages={pagination?.totalPages ?? 1} onPageChange={handlePageChange} />
              </div>
            </React.Fragment>
          }
        </div>
      </div>
    )
  };

  return (
    <AgentsWrapper 
      user={user}
      placeholder='search unverified agents...'
      searchDelay={400}
      namespace='unverified_agents'
      maxWidth='max-w-4xl'
    >
      <TableList/>
    </AgentsWrapper>
  )
}

export default UnverifiedAgentsClient
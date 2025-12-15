'use client'

import React from 'react'
import { AdminDetailsProps, BasicAgentProps,  ExtendedUserProps,  PaginationProps } from '@/lib/types'
import AgentsWrapper from './agents-wrapper'
import { useFilterStore } from '@/hooks/usefilter-store';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/utils/formatDate'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, MoreHorizontalIcon, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TableLoading from '../table-loading';
import Pagination from '@/components/ui/pagination';
import { calculateDeletionStatus } from '@/utils/account-deletion-utils';
import { useDeleteUserModal, useDeletionReminderModal, UserForRestriction } from '@/hooks/general-store';

interface ApiResponse {
  users: BasicAgentProps[];
  pagination: PaginationProps
}

type mobileItemProps = {
  open: boolean;
  user: BasicAgentProps;
  toggleTable: () => void;
};

const DeletedAgentsClient = ({user}:{user:AdminDetailsProps}) => {
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
      const response = await axios.post<ApiResponse>('/api/admin/agents/deleted', queryData);

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
    queryKey: ['deleted-agents', search, sortOrder, currentPage],
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

  const header = ['s/n', 'fullname', 'agency name', 'email', 'license number', 'city', 'state', 'date joined', 'date deleted', 'remaining days', 'action'];

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
    const { remainingDays } = calculateDeletionStatus(user.deletedAt);
    console.log(remainingDays);

    return (
      <TableRow className='border'>
        <TableCell className="text-xs md:text-sm text-center border-r">{startingSerial + index}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.surName} {user.lastName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.agentId.agencyName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.email}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r capitalize">{user.agentId.licenseNumber}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.city}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.state}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{formatDate(user.createdAt)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r border-b">{formatDate(user.deletedAt)}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r border-b">{remainingDays} days</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu user={user}/>
        </TableCell>
      </TableRow>
    )
  };

  const Menu = ({user}:{user:ExtendedUserProps}) => {
    const [showMenu, setShowMenu] = React.useState(false);

    const deleteUserModal = useDeleteUserModal();
    const deleteReminderModal = useDeletionReminderModal();

    
    const handleDeleteUser = () => {
      const userForBlocking: UserForRestriction = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role,
        isActive: user.userVerified,
        isSuspended: !user.userVerified,
      };

      deleteUserModal.onOpen(userForBlocking);
    };

    const handleSendReminder = () => {
      deleteReminderModal.onOpen(
        {
          id: user._id,
          email: user.email,
          surName: user.surName,
          lastName: user.lastName,
          userType: (user.role === 'agent' || user.role === 'user') ? user.role : 'user',
          registrationDate: user.createdAt
        },
        user.deletedAt,
        30
      )
    }

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-[200px]" align="end">
          {/* Recovery & Information */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Actions</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 mb-1">
              <RotateCcw className="w-4 h-4" />
              Restore Agent
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-cyan-600 focus:text-cyan-600 focus:bg-cyan-50" onClick={() =>handleSendReminder()}>
              <Bell className="w-4 h-4" />
              Send Reminder
            </DropdownMenuItem>
          </div>

          {/* Permanent Actions */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Danger Zone</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteUser()}>
              <Trash2 className="w-4 h-4" />
              Delete Permanently
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const MobileItem = ({ open, toggleTable, user }: mobileItemProps) => {
    const deleteUserModal = useDeleteUserModal();
    const deleteReminderModal = useDeletionReminderModal();
    
    const { remainingDays } = calculateDeletionStatus(user.deletedAt);

    const handleDeleteUser = () => {
      const userForBlocking: UserForRestriction = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role,
        isActive: user.userVerified,
        isSuspended: !user.userVerified,
      };
      deleteUserModal.onOpen(userForBlocking);
    };

    const handleSendReminder = () => {
      deleteReminderModal.onOpen(
        {
          id: user._id,
          email: user.email,
          surName: user.surName,
          lastName: user.lastName,
          userType: (user.role === 'agent' || user.role === 'user') ? user.role : 'user',
          registrationDate: user.createdAt
        },
        user.deletedAt,
        30
      )
    };

    const handleRestoreAgent = () => {
      // Add restore agent function here
      console.log('Restore agent:', user._id);
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
          {/* Left side: User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* User avatar/initials */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                remainingDays === 0 
                  ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'
              }`}>
                <span className={`text-sm font-semibold ${
                  remainingDays === 0 
                    ? 'text-red-600 dark:text-red-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {user.surName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize dark:text-white">
                  {user.surName} {user.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    remainingDays === 0
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : remainingDays <= 7
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {remainingDays === 0 ? 'Expired' : `${remainingDays} days left`}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Status and date */}
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              {user.city}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(user.deletedAt)}
            </span>
          </div>
        </div>

        {/* Expanded View (when open) */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
            {/* Status Indicator */}
            <div className={`p-3 rounded-lg ${
              remainingDays === 0 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30'
                : remainingDays <= 7
                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    {remainingDays === 0 ? 'Account Deletion Expired' : 'Pending Permanent Deletion'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {remainingDays === 0 
                      ? 'This account has passed the recovery period'
                      : `Will be permanently deleted in ${remainingDays} days`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Deleted on</p>
                  <p className="text-sm font-medium dark:text-white">
                    {formatDate(user.deletedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agency</p>
                <p className="text-sm font-medium dark:text-white truncate">
                  {user.agentId?.agencyName || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">License No.</p>
                <p className="text-sm font-medium dark:text-white font-mono">
                  {user.agentId?.licenseNumber || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {user.city}, {user.state}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Joined</p>
                <p className="text-sm font-medium dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              {user.phoneNumber && (
                <div className="flex items-center justify-between py-2 px-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm dark:text-white font-medium">{user.phoneNumber}</p>
                </div>
              )}
              
              {user.userVerified !== undefined && (
                <div className="flex items-center justify-between py-2 px-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Verification</p>
                  <p className={`text-sm font-medium ${
                    user.userVerified 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {user.userVerified ? 'Verified' : 'Unverified'}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-2">
                {remainingDays !== 0 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreAgent();
                      }}
                      className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendReminder();
                      }}
                      className="px-3 py-2.5 bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Bell className="w-4 h-4" />
                      Send Reminder
                    </button>
                  </>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser();
                  }}
                  className={`px-3 py-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                    remainingDays === 0 
                      ? 'col-span-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 col-span-2'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {remainingDays === 0 ? 'Delete Permanently' : 'Delete Now'}
                </button>
              </div>
              {remainingDays === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Recovery period has expired
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const TableList = () => {

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className='min-h-[300px] md:max-h-[490px] h-full'>
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
              <EmptyState message={ search !== '' ? 'No agent found for the search query' : 'No deleted agents at the moment.'}/>
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
      placeholder='search deleted agents...'
      searchDelay={400}
      namespace='deleted_agents'
      maxWidth='max-w-4xl'
    >
      <TableList/>
    </AgentsWrapper>
  )
}

export default DeletedAgentsClient
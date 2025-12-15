'use client'

import React from 'react'
import UsersWrapper from './users-wrapper'
import { AdminDetailsProps, ExtendedUserProps, PaginationProps } from '@/lib/types'
import { useFilterStore } from '@/hooks/usefilter-store'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/utils/formatDate'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BadgeCheck, Bell, Eye, MoreHorizontalIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import TableLoading from '../table-loading'
import Pagination from '@/components/ui/pagination'
import { useDeleteUserModal, UserForRestriction, useVerificationReminderModal } from '@/hooks/general-store'

interface ApiResponse {
  users: ExtendedUserProps[];
  pagination: PaginationProps
}

type mobileItemProps = {
  open: boolean;
  user: ExtendedUserProps;
  toggleTable: () => void;
};

const UnverifiedUsersClient = ({ user }: { user: AdminDetailsProps }) => {
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
      const response = await axios.post<ApiResponse>('/api/admin/users/unverified', queryData);

      if (response.status !== 200) {
        throw new Error(`API returned status: ${response.status}`);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      throw new Error(errorMessage);
    }
  };

  const { data, status } = useQuery<ApiResponse>({
    queryKey: ['unverified-users', search, sortOrder, currentPage],
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
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  };

  const header = ['s/n', 'username', 'surname', 'lastname', 'email', 'verification', 'city', 'state', 'date joined', 'action'];

  const UserListHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          {header.map((item: string, idx: number) => (
            <TableHead key={idx} className="text-center font-semibold uppercase border-r text-xs last:border-r-0">
              {item}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    )
  };

  const UserListItem = ({ user, index }: { user: ExtendedUserProps, index: number }) => {
    return (
      <TableRow className='border'>
        <TableCell className="text-xs md:text-sm text-center border-r">{startingSerial + index}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.username}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.surName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r">{user.lastName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.email}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r text-green-600 font-semibold">{user.userVerified ? 'verified' : 'unverified'}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.city}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.state}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{formatDate(user.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu user={user} />
        </TableCell>
      </TableRow>
    )
  };

  const Menu = ({ user }: { user: ExtendedUserProps }) => {
    const [showMenu, setShowMenu] = React.useState(false);

    const verificationReminderModal = useVerificationReminderModal();
    const deleteUserModal = useDeleteUserModal();

    const handleDeleteUser = (user: ExtendedUserProps) => {
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

    const handleSendReminder = (user: ExtendedUserProps) => {
      const unverifiedUser = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role,
        registrationDate: user.createdAt
      };

      verificationReminderModal.onOpen(unverifiedUser);
    };

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-[220px]" align="end">
          {/* Verification Actions */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Verification</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 mb-1">
              <BadgeCheck className="w-4 h-4" />
              Verify User
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50 mb-1" onClick={() => handleSendReminder(user)}>
              <Bell className="w-4 h-4" />
              Send Verification Reminder
            </DropdownMenuItem>
          </div>

          {/* Danger Zone */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Danger Zone</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10 mb-1" onClick={() => handleDeleteUser(user)}>
              <Trash2 className="w-4 h-4" />
              Delete User
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const MobileItem = ({ open, toggleTable, user }: mobileItemProps) => {
    const verificationReminderModal = useVerificationReminderModal();
    const deleteUserModal = useDeleteUserModal();

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
      const unverifiedUser = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role,
        registrationDate: user.createdAt
      };
      verificationReminderModal.onOpen(unverifiedUser);
    };

    const handleVerifyUser = () => {
      // Add verify user function
      console.log('Verify user:', user._id);
    };

    const handleViewProfile = () => {
      // Add view profile function
      console.log('View profile:', user._id);
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
              {/* User avatar/initials with unverified indicator */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                    {user.surName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-[#424242]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize dark:text-white">
                  {user.surName} {user.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Unverified
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                    {user.role || 'user'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Status and date */}
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              @{user.username || 'no-username'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(user.createdAt)}
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
                  <p className="text-sm font-medium dark:text-white">Account Pending Verification</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    This user account requires verification before activation
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Waiting Since</p>
                  <p className="text-sm font-medium dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username</p>
                <p className="text-sm font-medium dark:text-white">
                  @{user.username || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium dark:text-white truncate">
                  {user.email}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {user.city || 'N/A'}, {user.state || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account Type</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {user.role || 'Standard User'}
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
              
              <div className="flex items-center justify-between py-2 px-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Account Status</p>
                <p className={`text-sm font-medium ${
                  user.userVerified 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {user.userVerified ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile();
                  }}
                  className="px-3 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyUser();
                  }}
                  className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Verify User
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
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser();
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
              
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                This account requires verification to access platform features
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TableList = () => {

    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className='min-h-[300px] max-h-[490px] h-[560px]'>
          {status === 'pending' &&
            <div className='w-full'>
              <TableLoading tableHeader={header} />
            </div>
          }
          {status === 'error' &&
            <div className='w-full h-full items-center '>
              <ErrorState message='An error occurred while fetching users. Try again later.' />
            </div>
          }
          {status === 'success' && users.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message={search !== '' ? 'No user found for the search query' : 'No unverified users at the moment.'} />
            </div>
          }
          {status === 'success' && users && users.length > 0 &&
            <React.Fragment>
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <UserListHeader />
                  <TableBody>
                    {users.map((user: ExtendedUserProps, index: number) => (
                      <UserListItem key={user._id} user={user} index={index} />
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination?.totalPages ?? 1} onPageChange={handlePageChange} />
              </div>
              <div className="flex flex-col md:hidden">
                {users.map((user: ExtendedUserProps, index: number) => (
                  <React.Fragment key={index}>
                    <MobileItem
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
    <UsersWrapper
      user={user}
      placeholder='search unverified users...'
      searchDelay={400}
      namespace='unverified_users'
      maxWidth='max-w-4xl'
    >
      <TableList />
    </UsersWrapper>
  )
}

export default UnverifiedUsersClient
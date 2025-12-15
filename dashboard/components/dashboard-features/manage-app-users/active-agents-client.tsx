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
import { Badge, Eye, MessageCircle, MoreHorizontalIcon, Pause, ShieldOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TableLoading from '../table-loading';
import Pagination from '@/components/ui/pagination';
import { MessageRecipient, useDeleteUserModal, useMessageUserModal, useRevokeVerificationModal, UserForRestriction, UserForRoleAssignment, UserForVerificationRevocation, useRoleAssignmentModal, useSuspendUserModal } from '@/hooks/general-store'
import { useRouter } from 'next/navigation';

interface ApiResponse {
  users: BasicAgentProps[];
  pagination: PaginationProps
}

type mobileItemProps = {
  open: boolean;
  user: BasicAgentProps;
  toggleTable: () => void;
};

const ActiveAgentsClient = ({user}:{user:AdminDetailsProps}) => {
  const { search, sortOrder } = useFilterStore();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const userRole = user.role;
  
  const queryData = React.useMemo(() => ({
    queryText: search,
    sortOrder: sortOrder,
    page: currentPage
  }), [search, sortOrder, currentPage]);

  const fetchData = async (): Promise<ApiResponse> => {
    try {
      const response = await axios.post<ApiResponse>('/api/admin/agents/active', queryData);

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
    queryKey: ['active-agents', search, sortOrder, currentPage],
    queryFn: fetchData,
    retry: 2,
    refetchInterval: 15000
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
          <Menu user={user}/>
        </TableCell>
      </TableRow>
    )
  };

  const Menu = ({ user }: { user: ExtendedUserProps }) => {
    const [showMenu, setShowMenu] = React.useState(false);

    const messageModal = useMessageUserModal();
    const roleAssignmentModal = useRoleAssignmentModal();
    const revokeVerificationModal = useRevokeVerificationModal();
    const suspendUserModal = useSuspendUserModal();
    const deleteUserModal = useDeleteUserModal();

    const router = useRouter();

    const handleSuspendUser = (user: ExtendedUserProps) => {
      const userForSuspension: UserForRestriction = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role,
        isActive: user.userVerified,
        isSuspended: !user.userVerified
      };
      
      suspendUserModal.onOpen(userForSuspension);
    };

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

    const handleRevokeVerification = (user: ExtendedUserProps) => {
      const userForRevocation: UserForVerificationRevocation = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.userVerified,
      };
      
      revokeVerificationModal.onOpen(userForRevocation);
    };

    const handleAssignRole = (user: ExtendedUserProps) => {
      const userForRoleAssignment: UserForRoleAssignment = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        currentRole: user.role || 'user',
        isActive: false,
      };
      
      roleAssignmentModal.onOpen(userForRoleAssignment);
    };

    const handleMessageUser = (user: ExtendedUserProps) => {
      const recipient: MessageRecipient = {
        id: user._id,
        surName: user.surName, 
        lastName: user.lastName,
        email: user.email,
        userType: user.role, 
        phoneNumber: user.phoneNumber,
      };
      
      messageModal.onOpen(recipient);
    };

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-[200px]" align="end">
          {/* Information & Communication */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Information & Communication</p>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-gray-700 focus:text-gray-700 focus:bg-gray-50 mb-1 dark:text-white/80 dark:focus:text-gray-700"
              onClick={() => router.push(`/${userRole === 'superAdmin' ? 'superadmin' : userRole}-dashboard/manage-agents/${user._id}`)}
            >
              <Eye className="w-4 h-4" />
              View Agent Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50"
              onClick={() => handleMessageUser(user)}
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </DropdownMenuItem>
          </div>

          {/* Management Actions */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Management</p>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-purple-600 focus:text-purple-600 focus:bg-purple-50 mb-1"
              onClick={() => handleAssignRole(user)}
            >
              <Badge className="w-4 h-4" />
              Assign Role
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50"
              onClick={() => handleRevokeVerification(user)}
            >
              <ShieldOff className="w-4 h-4" />
              Revoke Agent Verification
            </DropdownMenuItem>
          </div>

          {/* Danger Zone */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Danger Zone</p>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-amber-600 focus:text-amber-600 focus:bg-amber-50 mb-1"
              onClick={() => handleSuspendUser(user)}
            >
              <Pause className="w-4 h-4" />
              Suspend Agent
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => handleDeleteUser(user)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Agent
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const MobileItem = ({ open, toggleTable, user }: mobileItemProps) => {
    const messageModal = useMessageUserModal();
    const revokeVerificationModal = useRevokeVerificationModal();
    const suspendUserModal = useSuspendUserModal();
    const deleteUserModal = useDeleteUserModal();
    const router = useRouter();

    const handleSuspendUser = () => {
      const userForSuspension: UserForRestriction = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.role,
        isActive: user.userVerified,
        isSuspended: !user.userVerified
      };
      suspendUserModal.onOpen(userForSuspension);
    };

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

    const handleRevokeVerification = () => {
      const userForRevocation: UserForVerificationRevocation = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.userVerified,
      };
      revokeVerificationModal.onOpen(userForRevocation);
    };

    const handleMessageUser = () => {
      const recipient: MessageRecipient = {
        id: user._id,
        surName: user.surName,
        lastName: user.lastName,
        email: user.email,
        userType: user.role,
        phoneNumber: user.phoneNumber,
      };
      messageModal.onOpen(recipient);
    };

    const handleViewDetails = () => {
      router.push(`/${userRole === 'superAdmin' ? 'superadmin' : userRole}-dashboard/manage-agents/${user._id}`);
    };

    return (
      <div 
        className={cn(
          "border-b last:border-b-0 w-full p-4 cursor-pointer transition-all duration-300 bg-white dark:bg-[#424242]",
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
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                  {user.surName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize dark:text-white">
                  {user.surName} {user.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                    user.userVerified 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  }`}>
                    {user.userVerified ? 'verified' : 'unverified'}
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
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>

        {/* Expanded View (when open) */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
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
            </div>

            {/* Quick Actions - Full width buttons for mobile */}
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
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessageUser();
                  }}
                  className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
                {user.userVerified ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevokeVerification();
                    }}
                    className="px-3 py-2.5 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <ShieldOff className="w-4 h-4" />
                    Revoke
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMessageUser(); // Placeholder for verify action
                    }}
                    className="px-3 py-2.5 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Badge className="w-4 h-4" />
                    Verify
                  </button>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuspendUser();
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Pause className="w-4 h-4" />
                  Suspend
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser();
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium col-span-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Agent
                </button>
              </div>
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
              <EmptyState message={ search !== '' ? 'No agent found for the search query' : 'No active agents at the moment.'}/>
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
      placeholder='search active agents...'
      searchDelay={400}
      namespace='active_agents'
      maxWidth='max-w-4xl'
    >
      <TableList/>
    </AgentsWrapper>
  )
};

export default ActiveAgentsClient
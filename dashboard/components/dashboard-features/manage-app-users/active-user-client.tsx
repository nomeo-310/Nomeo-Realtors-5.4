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
import { Badge, MessageCircle, MoreHorizontalIcon, Pause, ShieldOff, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import TableLoading from '../table-loading'
import Pagination from '@/components/ui/pagination'
import { MessageRecipient, useDeleteUserModal, useMessageUserModal, useRevokeVerificationModal, UserForRestriction, UserForRoleAssignment, UserForVerificationRevocation, useRoleAssignmentModal, useSuspendUserModal } from '@/hooks/general-store'

interface ApiResponse {
  users: ExtendedUserProps[];
  pagination: PaginationProps
}

type mobileItemProps = {
  open: boolean;
  user: ExtendedUserProps;
  toggleTable: () => void;
};

const ActiveUserClient = ({user}:{user:AdminDetailsProps}) => {
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
      const response = await axios.post<ApiResponse>('/api/admin/users/active', queryData);

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
    queryKey: ['active-users', search, sortOrder, currentPage],
    queryFn: fetchData,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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

  const header = ['s/n', 'username', 'surname', 'lastname', 'email',  'verification', 'city', 'state', 'date joined', 'action'];

  const UserListHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          {header.map((item:string) => (
            <TableHead className="text-center font-semibold uppercase border-r text-xs last:border-r-0">{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
    )
  };

  const UserListItem = ({user, index}:{user:ExtendedUserProps, index:number}) => {
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
          <Menu user={user}/>
        </TableCell>
      </TableRow>
    )
  };

  const Menu = ({user}: {user: ExtendedUserProps}) => {
    const [showMenu, setShowMenu] = React.useState(false);

    console.log(user.role)

      const messageModal = useMessageUserModal();
      const roleAssignmentModal = useRoleAssignmentModal();
      const revokeVerificationModal = useRevokeVerificationModal();
      const suspendUserModal = useSuspendUserModal();
      const deleteUserModal = useDeleteUserModal();

  const handleSuspendUser = (user: ExtendedUserProps) => {
    const userForSuspension: UserForRestriction = {
      id: user._id,
      surName: user.surName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.role, // 'user', 'agent', or 'admin'
      isActive: user.userVerified,
      isSuspended: !user.userVerified
    };
    
    suspendUserModal.onOpen(userForSuspension);
  };

  const handleBlockUser = (user: ExtendedUserProps) => {
    const userForBlocking: UserForRestriction = {
      id: user._id,
      surName: user.surName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.role, // 'user', 'agent', or 'admin'
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
          role: user.role, // 'user', 'agent', or 'admin'
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
          isActive: true, // default to true if not specified
        };
        
        roleAssignmentModal.onOpen(userForRoleAssignment);
      };

      const handleMessageUser = (user:ExtendedUserProps) => {
        // Transform your user data to match MessageRecipient type
        const recipient: MessageRecipient = {
          id: user._id,
          surName: user.surName, // Adjust based on your data structure
          lastName: user.lastName,
          email: user.email,
          userType: 'user', // or 'agent' or 'admin'
          phoneNumber: user.phoneNumber,
          // propertyAddress and other fields are optional
        };
        
        messageModal.onOpen(recipient);
      };

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-[200px]" align="end">
          {/* Communication */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Communication</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50" onClick={() => handleMessageUser(user)}>
              <MessageCircle className="w-4 h-4" />
              Send User a Message
            </DropdownMenuItem>
          </div>

          {/* Management Actions */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Management</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-purple-600 focus:text-purple-600 focus:bg-purple-50 mb-1"  onClick={() => handleAssignRole(user)}>
              <Badge className="w-4 h-4" />
              Assign Role
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50" onClick={() => handleRevokeVerification(user)}>
              <ShieldOff className="w-4 h-4" />
              Revoke Verification
            </DropdownMenuItem>
          </div>

          {/* Danger Zone */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Danger Zone</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-amber-600 focus:text-amber-600 focus:bg-amber-50 mb-1" onClick={() => handleSuspendUser(user)}>
              <Pause className="w-4 h-4" />
              Suspend User
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleBlockUser(user)}>
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
          <p className="text-sm capitalize font-semibold">{user.surName}</p>
          <p className="text-sm capitalize font-semibold">{user.lastName}</p>
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
              <ErrorState message='An error occurred while fetching users. Try again later.'/>
            </div>
          }
          {status === 'success' && users.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message={ search !== '' ? 'No user found for the search query' : 'No active users at the moment.'}/>
            </div>
          }
          {status === 'success' && users && users.length > 0 &&
            <React.Fragment>
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <UserListHeader/>
                  <TableBody>
                    {users.map((user:ExtendedUserProps, index:number) => (
                      <UserListItem user={user} index={index} key={index}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={pagination?.totalPages ?? 1} onPageChange={handlePageChange} />
              </div>
              <div className="flex flex-col md:hidden">
                {users.map((user:ExtendedUserProps, index:number) => (
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
      placeholder='search active users...'
      searchDelay={400}
      namespace='active_users'
      maxWidth='max-w-4xl'
    >
      <TableList/>
    </UsersWrapper>
  )
};

export default ActiveUserClient
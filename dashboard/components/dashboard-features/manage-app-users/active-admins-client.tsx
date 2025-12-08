'use client'

import React from 'react'
import AdminsWrapper from './admins-wrapper'
import { AdminDetailsProps } from '@/lib/types'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/lib/utils'
import TableLoading from '../table-loading'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'
import { Badge, Eye, MessageCircle, MoreHorizontalIcon, Pause, ShieldOff, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { MessageRecipient, useDeactivateUserModal, useDeleteUserModal, useMessageUserModal, UserForRestriction, UserForRoleAssignment, useRoleAssignmentModal, useSuspendUserModal } from '@/hooks/general-store'

export interface UserInfo {
  _id: string;
  email: string;
  surName: string;
  lastName: string;
  firstName?: string;
  phoneNumber?: string;
}

export interface AdminListData {
  _id: string;
  userId: UserInfo;
  role: 'admin' | 'creator' | 'superAdmin';
  adminAccess: 'full_access' | 'limited_access' | 'no_access';
  adminOnboarded: boolean;
  createdAt: string | Date;
  adminId: string;
  isActive: boolean;
  isActivated?: boolean;
  isSuspended?: boolean;
  deactivated?: boolean;
  updatedAt?: string | Date;
}

type mobileItemProps = {
  open: boolean;
  user: AdminListData;
  toggleTable: () => void;
};

export type AdminListResponse = AdminListData[];

const ActiveAdminsClient = ({user}:{user:AdminDetailsProps}) => {
  const fetchData = async (): Promise<AdminListData[]> => {
    try {
      const response = await axios.get<any>('/api/admin/admin/active');

      if (response.status !== 200) {
        throw new Error(`API returned status: ${response.status}`);
      }

    return response.data as AdminListData[];
    } catch (error:any) {
      const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
      throw new Error(errorMessage);
    }
  };

  const { data, status } = useQuery<AdminListData[]>({
    queryKey: ['active-agents'],
    queryFn: fetchData,
    retry: 2,
  });

  const adminList = data || [];
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const userRole = user.role;

  const header = ['s/n', 'fullname', 'role', 'email', 'admin access', 'admin id', 'date joined', 'onboard status', 'action'];

  const AdminListHeader = () => {
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

  const AdminListItem = ({user, index}:{user:AdminListData, index:number}) => {
    return (
      <TableRow className='border'>
        <TableCell className="text-xs md:text-sm text-center border-r">{index + 1}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.userId.surName} {user.userId.lastName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r capitalize">{user.role === 'superAdmin' ? 'super admin' : user.role}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{user.userId.email}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r capitalize">{user.adminAccess.split('_').join(' ')}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r lowercase">{user.adminId}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{formatDate(typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString())}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{user.adminOnboarded ? 'Onboarded' : 'Not Onboarded'}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu user={user}/>
        </TableCell>
      </TableRow>
    )
  };

const Menu = ({ user }: { user: AdminListData }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const router = useRouter();

  const suspendUserModal = useSuspendUserModal();
  const roleAssignmentModal = useRoleAssignmentModal();
  const deactivateAdminModal = useDeactivateUserModal();
  const deleteUserModal = useDeleteUserModal();
  const messageModal = useMessageUserModal();
  
  const handleSuspend = (admin: AdminListData) => {
    const adminForSuspension: UserForRestriction = {
      id: admin._id,
      surName: admin.userId.surName || '',
      lastName: admin.userId.lastName || '',
      email: admin.userId.email,
      userType: admin.role,
      adminId: admin.adminId,
      username: admin.userId.email,
      createdAt: typeof admin.createdAt === 'string' ? admin.createdAt : admin.createdAt.toISOString(),
      isActive: !admin.isSuspended
    };
    
    suspendUserModal.onOpen(adminForSuspension);
  };

  const handleAssignRole = (user: AdminListData) => {
    const userForRoleAssignment: UserForRoleAssignment = {
      id: user._id,
      surName: user.userId.surName,
      lastName: user.userId.lastName,
      email: user.userId.email,
      phoneNumber: user.userId.phoneNumber,
      currentRole: user.role || 'user',
      isActive: user.isActive,
    };
    
    roleAssignmentModal.onOpen(userForRoleAssignment);
  };

  const handleDeactivate = (user: AdminListData) => {
    deactivateAdminModal.onOpen(user);
  };

  const handleDeleteUser = (user: AdminListData) => {
    const userForBlocking: UserForRestriction = {
      id: user._id,
      surName: user.userId.surName,
      lastName: user.userId.lastName,
      email: user.userId.email,
      phoneNumber: user.userId.phoneNumber,
      userType: user.role, 
      isActive: user.isActive,
      isSuspended: user.isSuspended,
    };
    
    deleteUserModal.onOpen(userForBlocking);
  };

  const handleMessageUser = (user: AdminListData) => {
    const recipient: MessageRecipient = {
      id: user._id,
      surName: user.userId.surName, 
      lastName: user.userId.lastName,
      email: user.userId.email,
      userType: user.role, 
      phoneNumber: user.userId.phoneNumber,
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
            className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-gray-700 focus:text-gray-700 focus:bg-gray-50 mb-1"
            onClick={() => router.push(`/${userRole === 'superAdmin' ? 'superadmin' : userRole}-dashboard/manage-agents/${user._id}`)}
          >
            <Eye className="w-4 h-4" />
            View Admin Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50" onClick={() => handleMessageUser(user)}
          >
            <MessageCircle className="w-4 h-4" />
            Send Message
          </DropdownMenuItem>
        </div>
 
        {/* Management Actions */}
        <div className="p-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Management</p>
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-purple-600 focus:text-purple-600 focus:bg-purple-50 mb-1 capitalize" onClick={() => handleAssignRole(user)}>
            <Badge className="w-4 h-4" />
            Assign role
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50" onClick={() => handleDeactivate(user)}
          >
            <ShieldOff className="w-4 h-4" />
            Deactivate Admin
          </DropdownMenuItem>
        </div>

        {/* Danger Zone */}
        <div className="p-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Danger Zone</p>
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-amber-600 focus:text-amber-600 focus:bg-amber-50 mb-1" onClick={() => handleSuspend(user)}>
            <Pause className="w-4 h-4" />
            Suspend Admin
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteUser(user)}>
            <Trash2 className="w-4 h-4" />
            Delete Admin
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
          <p className="text-sm capitalize font-semibold">{user.userId.surName} {user.userId.lastName}</p>
          <p className="text-sm capitalize font-semibold">{user.role === 'superAdmin' ? 'super admin' : user.role}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center text-sm")}>{user.userId.email}</p>
          <p className="text-sm">{user.adminAccess.split('_')}</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Verification Status</p>
          <p className="text-sm capitalize text-green-600 font-semibold">{user.adminOnboarded ? 'Onboarded' : 'Not Onboarded'}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Admin ID</p>
          <p className="text-sm">{user.adminId}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Date Joined</p>
          <p className="text-sm capitalize">{formatDate(typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString())}</p>
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
              <ErrorState message='An error occurred while fetching admin. Try again later.'/>
            </div>
          }
          {status === 'success' && adminList.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message={'No active admins at the moment.'}/>
            </div>
          }
          {status === 'success' && adminList && adminList.length > 0 &&
            <React.Fragment>
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <AdminListHeader/>
                  <TableBody>
                    {adminList.map((user:AdminListData, index:number) => (
                      <AdminListItem user={user} index={index} key={index}/>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col md:hidden">
                {adminList.map((user:AdminListData, index:number) => (
                  <React.Fragment key={index}>
                    <MobileItem
                      key={index}
                      open={currentIndex === index}
                      toggleTable={() => toggleItem(index)}
                      user={user}
                    />
                  </React.Fragment>
                ))}
              </div>
            </React.Fragment>
          }
        </div>
      </div>
    )
  };
  return (
    <AdminsWrapper user={user}>
      <TableList/>
    </AdminsWrapper>
  )
}

export default ActiveAdminsClient
'use client'

import React from 'react'
import { AdminDetailsProps } from '@/lib/types'
import AdminsWrapper from './admins-wrapper'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/utils/formatDate'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontalIcon, PlayCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import TableLoading from '../table-loading'
import ErrorState from '@/components/ui/error-state'
import EmptyState from '@/components/ui/empty-state'

export interface UserProfile {
  _id: string;
  email: string;
  placeholderColor: string;
  lastName: string;
  surName: string;
  phoneNumber: string;
}

export interface Admin {
  _id: string;
  userId: UserProfile;
  role: string;
  adminAccess: string;
  adminOnboarded: boolean;
  createdAt: string;
  adminId: string;
  deactivatedAt?: string;
}

export type AdminsArray = Admin[];

type MobileItemProps = {
  open: boolean;
  user: Admin;
  toggleTable: () => void;
};

const DeactivatedAdminsClient = ({user:current_user}:{user: AdminDetailsProps}) => {
    const router = useRouter();
    const userRole = current_user.role;
  
    const [currentIndex, setCurrentIndex] = React.useState(-1);
  
    const fetchData = async (): Promise<AdminsArray> => {
      try {
        const response = await axios.get<AdminsArray>('/api/admin/admin/deactivated');
        if (response.status !== 200) {
          throw new Error(`API returned status: ${response.status}`);
        }
        return response.data;
      } catch (error:any) {
        const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
        throw new Error(errorMessage);
      }
    };
  
    const { data: admins = [], status } = useQuery<any>({
      queryKey: ['deactivated-admins'],
      queryFn: fetchData,
      retry: 2,
      refetchInterval: 15000
    });

    console.log(admins, status)
  
    const header = ['S/N', 'Full Name', 'Email', 'Role', 'Admin Access', 'Admin ID', 'Date Joined', 'Deactivated On', 'Actions'];

    const UserListHeader = () => {
      return (
        <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
          <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
            {header.map((item: string, idx: number) => (
              <TableHead className="text-center font-semibold uppercase border-r text-xs last:border-r-0 py-3 px-2" key={idx}>
                {item}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )
    };

  const UserListItem = ({user, index}:{user:Admin, index:number}) => {

    return (
      <TableRow className='border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-11'>
        <TableCell className="text-xs md:text-sm text-center border-r">{index + 1}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">
          {user.userId.surName} {user.userId.lastName}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">
          {user.userId.email}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">
          {user.adminAccess.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r lowercase">
          {user.adminId.toLowerCase()}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">
          {formatDate(user.createdAt)}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">
          {formatDate(user.deactivatedAt ?? '')}
        </TableCell>
        <TableCell className="text-xs md:text-sm text-center">
          <Menu user={user} />
        </TableCell>
      </TableRow>
    )
  };

  const Menu = ({ user }: { user: Admin }) => {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md'>
          <MoreHorizontalIcon className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 min-w-[200px] z-50" align="end">
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Management</p>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 hover:bg-green-50">
              <PlayCircle className="w-4 h-4" />
              Reactivate Admin
            </DropdownMenuItem>
          </div>

          {/* Information & Danger */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Actions</p>
            <DropdownMenuItem 
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10">
              <Trash2 className="w-4 h-4" />
              Delete Admin Account
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const MobileItem = ({ open, toggleTable, user }: MobileItemProps) => {
    const router = useRouter();

    return (
      <div 
        className={cn(
          "border-b last:border-b-0 w-full p-4 cursor-pointer transition-all duration-300 bg-white dark:bg-[#424242]",
          open ? 'h-auto' : 'h-[72px] overflow-hidden'
        )}
        onClick={toggleTable}
      >
        {/* Compact View (when not open) */}
        <div className="flex items-center justify-between">
          {/* Left side: User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* User avatar/initials with suspended indicator */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600 dark:text-red-300">
                    {user.userId.surName?.[0]?.toUpperCase() || user.userId.lastName?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-[#424242]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize dark:text-white">
                  {user.userId.surName} {user.userId.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.userId.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Role and arrow */}
          <div className="flex flex-col items-end ml-2">
            <span className='text-xs font-medium mb-1'>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Expanded View (when open) */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
            {/* Admin Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Admin Access</p>
                <span className={`text-xs font-medium ${
                  user.adminAccess === 'full_access' 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {user.adminAccess.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Admin ID</p>
                <p className="text-sm font-medium dark:text-white">
                  {user.adminId.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date Joined</p>
                <p className="text-sm font-medium dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Deactivated On</p>
                <p className="text-sm font-medium dark:text-white">
                  {user.deactivatedAt ? formatDate(user.deactivatedAt) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              {user.userId.phoneNumber && (
                <div className="flex items-center justify-between py-2 px-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm dark:text-white font-medium">{user.userId.phoneNumber}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between py-2 px-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Onboarded</p>
                <p className={`text-sm font-medium ${
                  user.adminOnboarded 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {user.adminOnboarded ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-2">
                <button 
                    className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Lift Suspension
                  </button>
                
                <button 
                  className={cn("px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium")}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Admin
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Only the admin who suspended can lift suspension
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const TableList = () => {
    return (
      <div className='w-full flex flex-col gap-6 md:gap-8 lg:gap-10 bg-inherit overflow-hidden'>
        <div className='min-h-[300px] md:max-h-[490px] h-full'>
          {status === 'pending' &&
            <div className='w-full'>
              <TableLoading tableHeader={header} items={5}/>
            </div>
          }
          {status === 'error' &&
            <div className='w-full h-full items-center '>
              <ErrorState message='An error occurred while fetching admins. Try again later.'/>
            </div>
          }
          {status === 'success' && admins.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message='No suspended admins at the moment.'/>
            </div>
          }
          {status === 'success' && admins && admins.length > 0 &&
            <React.Fragment>
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <UserListHeader/>
                  <TableBody>
                    {admins.map((user:Admin, index:number) => (
                      <UserListItem user={user} index={index} key={index}/>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col md:hidden">
                {admins.map((user:Admin, index:number) => (
                  <React.Fragment key={user._id}>
                    <MobileItem
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
    <AdminsWrapper user={current_user}>
      <TableList/>
    </AdminsWrapper>
  )
}

export default DeactivatedAdminsClient
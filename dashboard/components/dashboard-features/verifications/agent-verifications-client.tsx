'use client'


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import React from 'react'
import Pagination from '@/components/ui/pagination';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, FileText, Loader2, MoreHorizontalIcon, XCircle } from 'lucide-react';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { useRejectAgentModal } from '@/hooks/general-store';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatDate';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import VerificationsWrapper from './verifications-wrapper';
import { AdminDetailsProps } from '@/lib/types';
import { verifyAgent } from '@/actions/verification-actions';
import TableLoading from '../table-loading';

type mobileItemProps = {
  open: boolean;
  agent: agentDataProps;
  toggleTable: () => void;
};

type agentDataProps = {
    _id: string,
    verificationStatus: string,
    userId: {
        _id: string,
        lastName: string,
        surName: string, 
        email: string,
    },
    createdAt: string,
    licenseNumber: string,
    agencyName: string
}

type responseDataProps = {
    currentPage: number,
    totalPages: number,
    totalAgents: number,
    agents: agentDataProps[],
    hasNextPage: boolean,
    hasPrevPage: boolean
}

const AgentVerificationsClient = ({user}:{user:AdminDetailsProps}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const requestUnverifiedAgents = () => axios.get(`/api/admin/verifications/agents?page=${currentPage}`);

  const { data, status } = useQuery({
    queryKey: ['unverified-agents', currentPage],
    queryFn: requestUnverifiedAgents,
    refetchInterval: 15000,
    select: (response) => response.data
  })

  const responseData = data as responseDataProps;
  const agents = responseData?.agents as agentDataProps[];
  const totalPage = responseData?.totalPages as number;


  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const AgentVerificationHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          <TableHead className="text-center font-semibold uppercase border-r">Full Name</TableHead>
          <TableHead className="text-center font-semibold uppercase border-r">Email</TableHead>
          <TableHead className="text-center font-semibold uppercase border-r">Agency Name</TableHead>
          <TableHead className="text-center font-semibold uppercase border-r">License Number</TableHead>
          <TableHead className="text-center font-semibold uppercase border-r">Verification Status</TableHead>
          <TableHead className="text-center font-semibold uppercase border-r">Joined At</TableHead>
          <TableHead className="text-center font-semibold uppercase">Action</TableHead>
        </TableRow>
      </TableHeader>
    )
  };

  const AgentVerificationItem = ({agent}:{agent:agentDataProps}) => {
    return (
      <TableRow className='border'>
        <TableCell className="text-xs md:text-sm text-center border-r">{agent.userId.surName} {agent.userId.lastName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{agent.userId.email}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r">{agent.agencyName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r">{agent.licenseNumber}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r">{agent.verificationStatus}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{formatDate(agent.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu agentId={agent._id}/>
        </TableCell>
      </TableRow>
    )
  };

  const AgentVerificationMobileItem = ({ open, toggleTable, agent }: mobileItemProps) => {
    const agentRejectionModal = useRejectAgentModal();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const router = useRouter();

    const handleVerification = async () => {
      try {
        await toast.promise(verifyAgent({ agentId: agent._id, path: pathname }), {
          loading: 'Approving Agent...',
          success: (response) => {
            if (response.success) {
              queryClient.invalidateQueries({ queryKey: ['unverified-agents'] })
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
        console.error('Error approving agent:', error);
      }
    };

    const handleRejection = () => {
      localStorage.setItem('rejection-agentId', agent._id);
      agentRejectionModal.onOpen();
    };

    const handleViewDetails = () => {
      // Add view agent details function
      console.log('View agent details:', agent._id);
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
          {/* Left side: Agent info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Agent avatar/initials with verification indicator */}
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                    {agent.userId.surName?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-[#424242]"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate capitalize dark:text-white">
                  {agent.userId.surName} {agent.userId.lastName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Pending Verification
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {agent.userId.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Agency and date */}
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              {agent.agencyName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(agent.createdAt)}
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
                  <p className="text-sm font-medium dark:text-white">Agent Verification Pending</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Review agent documents before verification
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-sm font-medium dark:text-white capitalize">
                    {agent.verificationStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agent Name</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {agent.userId.surName} {agent.userId.lastName}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium dark:text-white truncate">
                  {agent.userId.email}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agency</p>
                <p className="text-sm font-medium dark:text-white capitalize">
                  {agent.agencyName}
                </p>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">License Number</p>
                <p className="text-sm font-medium dark:text-white font-mono">
                  {agent.licenseNumber}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Registration Date</p>
                <p className="text-sm dark:text-white">
                  {formatDate(agent.createdAt)}
                </p>
              </div>
              
              <div className="flex items-center justify-between py-2 px-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Agent ID</p>
                <p className="text-sm dark:text-white font-mono">
                  {agent._id.slice(-8)}
                </p>
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
                  <FileText className="w-4 h-4" />
                  View Details
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerification();
                  }}
                  className="px-3 py-2.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Verify Agent
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejection();
                  }}
                  className="px-3 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium col-span-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Agent
                </button>
              </div>
              
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                Review all documents before verification
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Menu = ({agentId}:{agentId:string}) => {
    const agentRejectionControl = useRejectAgentModal();
    const [showMenu, setShowMenu] = React.useState(false);

    const pathname = usePathname();
    const queryClient = useQueryClient();

    const handleRejection = () => {
      localStorage.setItem('rejection-agentId', agentId);
      agentRejectionControl.onOpen();
    };

    const handleVerification  = async () => {
      try {
        await toast.promise(verifyAgent({agentId, path: pathname}), {
          loading: 'Approving Agent...',
          success: (response) => {
            if (response.success) {
              queryClient.invalidateQueries({queryKey: ['unverified-agents']})
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
        console.error('Error approving agent:', error);
      }
    }

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 min-w-[200px] p-2" align="end">
          {/* Information */}
          <div className="p-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Agent Details</p>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-blue-600 focus:text-blue-600 focus:bg-blue-50">
              <FileText className="w-4 h-4" />
              Full Details
            </DropdownMenuItem>
          </div>

          {/* Verification Actions */}
          <div className="p-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Verification</p>
            <DropdownMenuItem 
              onClick={handleVerification}
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-green-600 focus:text-green-600 focus:bg-green-50 mb-1"
            >
              <BadgeCheck className="w-4 h-4" />
              Verify Agent
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleRejection}
              className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <XCircle className="w-4 h-4" />
              Reject Agent
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  };

  const AgentVerificationList = () => {
    const header = ['full name', 'agent id', 'email', 'agency name', 'license number', 'verification status', 'joined at', 'action']
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
          {status === 'success' && agents.length === 0 &&
            <div className='w-full h-full items-center'>
              <EmptyState message='No unverified agents at the moment.'/>
            </div>
          }
          {status === 'success' && agents && agents.length > 0 &&
            <React.Fragment>
              <div className="hidden md:block">
                <Table className='w-full border'>
                  <AgentVerificationHeader/>
                  <TableBody>
                    {agents.map((agent: agentDataProps, index: number) => (
                      <AgentVerificationItem key={agent._id} agent={agent} />
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPage} onPageChange={handlePageChange} />
              </div>
              <div className="flex flex-col md:hidden">
                {agents.map((agent: agentDataProps, index: number) => (
                  <React.Fragment key={agent._id}>
                    <AgentVerificationMobileItem
                      open={currentIndex === index}
                      toggleTable={() => toggleItem(index)}
                      agent={agent}
                    />
                  </React.Fragment>
                ))}
                <Pagination currentPage={currentPage} totalPages={totalPage} onPageChange={handlePageChange} />
              </div>
            </React.Fragment>
          }
        </div>
      </div>
    )
  };

  return (
    <VerificationsWrapper user={user}>
      <AgentVerificationList/>
    </VerificationsWrapper>
  )
}

export default AgentVerificationsClient
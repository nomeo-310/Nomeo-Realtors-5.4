'use client'


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import React from 'react'
import Pagination from '@/components/ui/pagination';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MoreHorizontalIcon } from 'lucide-react';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { useRejectAgentModal } from '@/hooks/general-store';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatDate';
import { verifyAgent } from '@/actions/admin-actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import VerificationsWrapper from './verifications-wrapper';
import { AdminDetailsProps } from '@/lib/types';

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
    totalPage: number,
    totalAgents: number,
    agents: agentDataProps[],
    hasNextPage: boolean,
    hasPrevPage: boolean
}

const AgentVerificationsClient = ({user}:{user:AdminDetailsProps}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const requestUnverifiedAgents = () => axios.get(`/api/admin/unverified-agents?page=${currentPage}`);

  const { data, status } = useQuery({
    queryKey: ['unverified-agents', currentPage],
    queryFn: requestUnverifiedAgents,
    select: (response) => response.data
  })

  const responseData = data as responseDataProps;
  const agents = responseData?.agents as agentDataProps[];
  const totalPage = responseData?.totalPage as number;

  const toggleItem = React.useCallback((index: number) => {
    setCurrentIndex((currentValue) => (currentValue !== index ? index : -1));
  },[]);

  const handlePageChange = (page:number) => {
    setCurrentPage(page)
  };

  const VerificationHeader = () => {
    return (
      <TableHeader className="rounded-lg h-11 [&_tr]:border-b">
        <TableRow className="bg-white hover:bg-white border-b-0 dark:bg-[#424242]">
          <TableHead className="text-center font-semibold uppercase border-r">Full Name</TableHead>
          <TableHead className="text-center font-semibold uppercase border-r">Agent ID</TableHead>
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

  const VerificationItem = ({agent}:{agent:agentDataProps}) => {
    return (
      <TableRow className='border'>
        <TableCell className="text-xs md:text-sm text-center border-r">{agent.userId.surName} {agent.userId.lastName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{agent._id}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r">{agent.userId.email}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r">{agent.agencyName}</TableCell>
        <TableCell className="text-xs md:text-sm text-center uppercase border-r">{agent.licenseNumber}</TableCell>
        <TableCell className="text-xs md:text-sm text-center capitalize border-r">{agent.verificationStatus}</TableCell>
        <TableCell className="text-xs md:text-sm text-center border-r border-b">{formatDate(agent.createdAt)}</TableCell>
        <TableCell className='text-xs md:text-sm text-center flex items-center justify-center cursor-pointer'>
          <Menu agentId={agent._id}/>
        </TableCell>
      </TableRow>
    )
  };

  const MobileItem = ({open, toggleTable, agent }:mobileItemProps) => {
    return (
      <div className={cn("shadow-sm border-b last:border-b-0 w-full h-[68px] md:h-[72px] overflow-hidden p-3 md:p-4 cursor-pointer transition-all duration-300", open ? 'h-auto md:h-auto': '')} onClick={toggleTable}>
        <div className="flex items-center justify-between">
          <p className="text-sm">{agent.userId.surName} {agent.userId.lastName}</p>
          <p className="text-sm">{agent._id}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={cn("text-center font-semibold text-sm")}>{agent.userId.email}</p>
          <p className="text-sm font-semibold">{agent.agencyName}</p>
        </div>
        <div className="border-b border-black my-3"/>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">License Number</p>
          <p className="text-sm uppercase">{agent.licenseNumber}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Verification Status</p>
          <p className="text-sm capitalize">{agent.verificationStatus}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Date Joined</p>
          <p className="text-sm capitalize">{formatDate(agent.createdAt)}</p>
        </div>
      </div>
    )
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
      await verifyAgent({agentId, path: pathname})
      .then((response) => {
        if (response) {
          if (response.status === 200) {
            toast.success(response.message);
            queryClient.invalidateQueries({queryKey: ['unverified-agents']});
            setShowMenu(false);
          }
        }
      })
    }

    return (
      <DropdownMenu modal={false} open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger className='outline-none focus:outline-none'>
          <MoreHorizontalIcon/>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Full Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleVerification}>
            Verify Agent
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRejection}>
            Reject Agent
          </DropdownMenuItem>
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
                <ErrorState message='An error occurred while fetching agent details. Try again later.'/>
              </div>
            }
            {status === 'success' && agents.length === 0 &&
              <div className='w-full h-full items-center'>
                <EmptyState message='No pending agents at the moment.'/>
              </div>
            }
            {status === 'success' && agents.length > 0 &&
              <React.Fragment>
                <Table className='w-full border'>
                  <VerificationHeader/>
                  <TableBody>
                    {agents && agents.length > 0 && agents.map((agent:agentDataProps) => (
                      <VerificationItem agent={agent}/>
                    ))}
                  </TableBody>
                </Table>
                <Pagination currentPage={currentPage} totalPages={totalPage} onPageChange={handlePageChange} />
              </React.Fragment>
            }
          </div>
        </div>
        <div className='md:hidden'>
          <div className='w-full h-[560px] overflow-hidden'>
            {status === 'pending' &&
              <div className='w-full h-full flex items-center justify-center py-24'>
                <Loader2 className='animate-spin'/>
              </div>
            }
            {status === 'error' &&
              <div className='w-full h-full items-center'>
                <ErrorState message='An error occurred while fetching agent details. Try again later.'/>
              </div>
            }
            {status === 'success' && agents.length === 0 &&
              <div className='w-full h-full items-center'>
                <EmptyState message='No pending agents at the moment.'/>
              </div>
            }
            {status === 'success' &&
              <div className="flex flex-col border">
                {agents && agents.length > 0 && agents.map((agent:agentDataProps, index:number) => (
                  <React.Fragment key={index}>
                    <MobileItem
                      open={currentIndex === index}
                      toggleTable={() => toggleItem(index)}
                      agent={agent}
                    />
                  </React.Fragment>
                ))}
              </div>
            }
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPage} onPageChange={handlePageChange} />
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

export default AgentVerificationsClient
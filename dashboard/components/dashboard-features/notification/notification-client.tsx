'use client'

import { deleteAllNotifications } from '@/actions/notification-actions';
import NotificationCard from '@/components/dashboard-features/notification/notification-card'
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon } from '@hugeicons/core-free-icons';
import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
import { AdminDetailsProps, NotificationProps } from '@/lib/types';
import NotificationsSkeleton from '@/components/dashboard-features/notification/notifications-skeletons';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import InfiniteScrollClient from '@/components/ui/infinite-scroll-client';

const NotificationClient = ({user}:{user:AdminDetailsProps}) => {
  const queryClient = useQueryClient();

  const [showDelete, setShowDelete] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  console.log(user)

  const fetchNotifications = async ({pageParam}:{pageParam: number}) => {
    const response = await axios.post('/api/admin/notification/user-notifications', { page: pageParam })

    if (response.status !== 200 ) {
      throw new Error('Something went wrong, try again later');
    }

    const data = response.data;
    return data
  };

  const readNotifications = async () => {
    const response = await axios.put('/api/admin/notification/read-notification', {})

    if (response.status !== 200) {
      throw new Error('Something went wrong, try again later')
    }
  };

  const { mutate:readAllNotifications } = useMutation({
    mutationFn: readNotifications,
    onSuccess: () => {
      queryClient.setQueryData(['unread-notification-count'], { count: 0 });
      queryClient.invalidateQueries({ queryKey: ['all-user-notifications'] })
    },
    onError(error) {
      console.error('Failed to mark notifications as read', error)
    }
  });

  //this clears all notifications
  const clearAllNotifications = async () => {
    setClearing(true);
    const response = await deleteAllNotifications();
    if (response && response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ['all-user-notifications'] });
      toast.success(response.message);
      setClearing(false);
      setShowDelete(false);
    } else {
      toast.error(response.message || "Something went wrong");
      setClearing(false);
    }
  }

  //this fetch all the users notifications
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['all-user-notifications'],
    queryFn: fetchNotifications,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage
  });

  const notifications:NotificationProps[] = data?.pages.flatMap(page => page.notifications) || [];

  //This makes all notification to be seen 5 seconds after page loads
  React.useEffect(() => {

    const timer = setTimeout(() => {
      readAllNotifications();
    }, 5000);
    return () => clearTimeout(timer);
  },[]);

  //This makes delete all button to show 
  React.useEffect(() => {
    if (notifications.length > 2) {
      setShowDelete(true);
    } else {
      setShowDelete(false);
    }
  },[notifications, notifications.length]);

  const NotificationList = () => {

    if (status === 'pending') {
      return <NotificationsSkeleton/>
    };
  
    if (status === 'success' && !notifications.length && !hasNextPage) {
      return <EmptyState message='No notifications yet.' className='w-full'/>;  
    };
  
    if (status === 'error') {
      return <ErrorState message='An error occur while loading your notifications.' className=''/>;
    };

    return (
      <React.Fragment>
        <InfiniteScrollClient onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}>
          <div className="flex flex-col gap-4">
            { notifications.map((item:NotificationProps, index:number) => (
              <NotificationCard notification={item} key={item._id} index={index} user={user}/>
            ))}
          </div>
        </InfiniteScrollClient>
        { isFetchingNextPage && 
          <div className="w-full">
            <Loader2 className='mx-auto animate-spin my-3 size-5 lg:size-6'/>
          </div> }
      </React.Fragment>
    )
  };

  return (
    <div className='w-full lg:w-[80%] xl:w-[70%] md:w-[80%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 py-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Notifications</h2>
        { showDelete &&
          <button type="button" className='text-sm py-1.5 lg:py-2 px-4 bg-red-600 text-white rounded-lg flex items-center gap-2' onClick={() =>clearAllNotifications()} disabled={clearing}>
            <HugeiconsIcon icon={Delete01Icon} className='md:size-5 size-4'/>
            { clearing ? 'Clearing All Notifications...' : 'Clear All' }
            {clearing && <Loader2 className='animate-spin size-5'/>}
          </button>
        }
      </div>
      <NotificationList/>
    </div>
  )
}

export default NotificationClient
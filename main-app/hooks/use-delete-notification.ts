import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationProps } from "@/lib/types";
import { toast } from "sonner";
import { deleteSingleNotification } from "@/actions/notification-actions";

type dataProps = {
  notifications: notificationProps[];
  nextPage: number | undefined;
};

export const useDeleteNotification = (notification_id: string, notify: boolean) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteSingleNotification(notification_id),
    onMutate: async () => {
      const queryFilter: QueryFilters = {queryKey: ["all-user-notifications"]};

      // Cancel outgoing refetches
      await queryClient.cancelQueries(queryFilter);

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(["all-user-notifications"]);

      // Optimistically update to the new value
      queryClient.setQueriesData<InfiniteData<dataProps, number>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextPage: page.nextPage,
              notifications: page.notifications.filter(
                (item) => item._id !== notification_id
              ),
            })),
          };
        }
      );

      return { previousNotifications };
    },
    onSuccess: (response) => {
      if (response.success && response.status === 200) {
        if (notify) {
          toast.success(response.message);
        } else {
          console.log(response.message);
        }
      } else {
        if (notify) {
          toast.error(response.message);
        } else {
          console.log(response.message);
        }
      }
    },
    onError: (error, variables, context) => {
      
      // Revert back to the snapshot
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["all-user-notifications"],
          context.previousNotifications
        );
      }
      
      toast.error("Something went wrong, try again later");
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: ["all-user-notifications"],
      });
    },
  });

  return mutation;
};
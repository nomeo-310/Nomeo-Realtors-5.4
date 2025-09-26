import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { notificationProps } from "@/lib/types";
import { toast } from "sonner";
import {
  deleteSingleNotification,
  getSingleNotification,
} from "@/actions/notification-actions";

type dataProps = {
  notifications: notificationProps[];
  nextPage: number | undefined;
};

export const useDeleteNotification = (notification_id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => getSingleNotification(notification_id),
    onSuccess: async (notification: notificationProps) => {
      const queryFilter: QueryFilters = {
        queryKey: ["all-user-notifications"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<dataProps, number>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextPage: page.nextPage,
              notifications: page.notifications.filter(
                (item) => item._id !== notification._id
              ),
            })),
          };
        }
      );

      await deleteSingleNotification(notification_id).then((response) => {
        if (response.success && response.status === 200) {
          toast.success(response.message);
        }

        if (!response.success) {
          toast.error(response.message);
        }
      });
    },
    onError(error) {
      console.log(error);
      toast.error("Something went wrong, try again later");
    },
  });

  return mutation;
};

import { InfiniteData, useMutation, useQueryClient,} from "@tanstack/react-query";
import { propertyProps } from "@/lib/types";
import { toast } from "sonner";
import { deleteApartment } from "@/actions/property-actions";

type dataProps = {
  properties: propertyProps[];
  nextPage: number | undefined;
};

export const useDeleteApartment = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteApartment(id),
    onMutate: async () => {
      const queryKey = ["all-added-properties"];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousProperties = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<InfiniteData<dataProps, number>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextPage: page.nextPage,
              properties: page.properties.filter(
                (item) => item._id !== id
              ),
            })),
          };
        }
      );

      return { previousProperties };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Property deleted successfully");
      } else {
        // If the API returns an error but we optimistically updated, show error
        toast.error(response.message || "Failed to delete property");
        
        // Refetch to sync with server
        queryClient.invalidateQueries({ 
          queryKey: ["all-added-properties"] 
        });
      }
    },
    onError: (error, variables, context) => {
      console.log(error);
      
      // Revert optimistic update on error
      if (context?.previousProperties) {
        queryClient.setQueryData(
          ["all-added-properties"],
          context.previousProperties
        );
      }
      
      toast.error("Something went wrong, try again later");
    },
    onSettled: () => {
      // Always refetch to ensure data is in sync
      queryClient.invalidateQueries({ 
        queryKey: ["all-added-properties"] 
      });
    },
  });

  return mutation;
};

import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyProps } from "@/lib/types";
import { toast } from "sonner";
import { hideProperty } from "@/actions/property-actions";

type dataProps = {
  properties: propertyProps[];
  nextPage: number | undefined;
};

export const useHideApartment = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => hideProperty(id),
    onMutate: async () => {
      const queryKey = ["all-added-properties"];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for potential rollback
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
              properties: page.properties.map((item) => {
                if (item._id === id) {
                  // Optimistically toggle the hideProperty status
                  return {
                    ...item,
                    hideProperty: !item.hideProperty, // Toggle current value
                  };
                }
                return item;
              }),
            })),
          };
        }
      );

      return { previousProperties };
    },
    onSuccess: (updatedProperty: propertyProps) => {
      // The cache is already optimistically updated, but we can ensure it's correct
      queryClient.setQueryData<InfiniteData<dataProps, number>>(
        ["all-added-properties"],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextPage: page.nextPage,
              properties: page.properties.map((item) => {
                if (item._id === id) {
                  // Ensure we have the actual server response
                  return {
                    ...item,
                    hideProperty: updatedProperty.hideProperty,
                  };
                }
                return item;
              }),
            })),
          };
        }
      );

      toast.success(
        `Property ${updatedProperty.hideProperty === true ? "is hidden" : "is no longer hidden"}`
      );
    },
    onError: (error, variables, context) => {
      
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
      // Optional: Refetch to ensure data consistency
      queryClient.invalidateQueries({ 
        queryKey: ["all-added-properties"] 
      });
    },
  });

  return mutation;
};
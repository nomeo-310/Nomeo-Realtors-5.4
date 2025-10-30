import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelRentOut } from "@/actions/rentout-actions";
import { propertyProps } from "@/lib/types";

type CancelRentOutData = {
  propertyIdTag: string;
  agentId: string;
  path: string;
};

export const useCancelRentout = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CancelRentOutData) => cancelRentOut(data),
    onMutate: async (data) => {
      const queryKey = ["added-properties"];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for potential rollback
      const previousProperties = queryClient.getQueryData(queryKey);

      // Optimistically update the cache - set availabilityStatus to 'available'
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        // Handle both infinite query and regular query structures
        if (oldData.pages) {
          // Infinite query structure
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              properties: page.properties.map((property: propertyProps) => 
                property.propertyIdTag === data.propertyIdTag 
                  ? { ...property, availabilityStatus: 'available' as const }
                  : property
              ),
            })),
          };
        } else if (oldData.properties) {
          // Regular query structure
          return {
            ...oldData,
            properties: oldData.properties.map((property: propertyProps) => 
              property.propertyIdTag === data.propertyIdTag 
                ? { ...property, availabilityStatus: 'available' as const }
                : property
            ),
          };
        }
        return oldData;
      });

      return { previousProperties };
    },
    onSuccess: (response) => {
      if (response.success && response.status === 200) {
        toast.success(response.message);
        
        // Ensure data is synced with server
        queryClient.invalidateQueries({ 
          queryKey: ["added-properties"] 
        });
      } else {
        toast.error(response.message || "Failed to cancel rentout");
        
        // Refetch on API error to ensure sync
        queryClient.invalidateQueries({ 
          queryKey: ["added-properties"] 
        });
      }
    },
    onError: (error, variables, context) => {
      
      // Revert optimistic update on error
      if (context?.previousProperties) {
        queryClient.setQueryData(
          ["added-properties"],
          context.previousProperties
        );
      }
      
      toast.error("Something went wrong, try again later");
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({ 
        queryKey: ["added-properties"] 
      });
    },
  });

  return mutation;
};
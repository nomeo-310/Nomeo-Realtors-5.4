import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Inspection } from "@/lib/types";
import { toast } from "sonner";
import { toggleInspectionStatus } from "@/actions/inspection-actions";

type dataProps = {
  inspections: Inspection[];
  nextPage: number | undefined;
};

type ToggleInspectionStatusData = {
  id: string;
  status: string;
  path: string;
};


export const useToggleInspectionStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ToggleInspectionStatusData) => toggleInspectionStatus(data),
    onMutate: async (data) => {
      const queryKey = ["all-agent-inspections"];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for potential rollback
      const previousInspections = queryClient.getQueryData(queryKey);

      // Optimistically update the cache - update inspection status
      queryClient.setQueryData<InfiniteData<dataProps, number>>(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        const updateInspectionInArray = (inspections: Inspection[]) => 
          inspections.map((inspection: Inspection) => 
            inspection._id === data.id 
              ? { ...inspection, status: data.status }
              : inspection
          );

        // Handle both infinite query and regular query structures
        if (oldData.pages) {
          // Infinite query structure
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              inspections: updateInspectionInArray(page.inspections || []),
            })),
          };
        } else if (oldData.inspections) {
          // Regular query structure with inspections array
          return {
            ...oldData,
            inspections: updateInspectionInArray(oldData.inspections),
          };
        } else if (Array.isArray(oldData)) {
          // Direct array of inspections
          return updateInspectionInArray(oldData);
        }
        
        return oldData;
      });

      return { previousInspections };
    },
    onSuccess: (response, variables) => {
      if (response.success && response.status === 200) {
        toast.success(response.message || "Inspection status updated successfully");
        
        // Invalidate related queries to ensure data consistency
        queryClient.invalidateQueries({ 
          queryKey: ["all-agent-inspections"] 
        });
        
        // You might also want to invalidate specific inspection details
        queryClient.invalidateQueries({ 
          queryKey: ["inspection", variables.id] 
        });
      } else {
        toast.error(response.message || "Failed to update inspection status");
        
        // Refetch on API error to ensure sync
        queryClient.invalidateQueries({ 
          queryKey: ["all-agent-inspections"] 
        });
      }
    },
    onError: (error, variables, context) => {
      console.error("Toggle inspection status error:", error);
      
      // Revert optimistic update on error
      if (context?.previousInspections) {
        queryClient.setQueryData(
          ["all-agent-inspections"],
          context.previousInspections
        );
      }
      
      toast.error("Something went wrong, try again later");
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({ 
        queryKey: ["all-agent-inspections"] 
      });
    },
  });

  return mutation;
};
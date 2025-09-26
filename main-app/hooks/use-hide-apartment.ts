import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
    onSuccess: async (updatedProperty: propertyProps) => {
      const queryFilter: QueryFilters = { queryKey: ["all-added-properties"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<dataProps, number>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextPage: page.nextPage,
              properties: page.properties.map((item) => {
                if (item._id === updatedProperty._id) {
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
    onError(error) {
      console.log(error);
      toast.error("Something went wrong, try again later");
    },
  });

  return mutation;
};

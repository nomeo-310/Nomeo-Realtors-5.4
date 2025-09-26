import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { propertyProps } from "@/lib/types";
import { toast } from "sonner";
import {
  deleteApartment,
  getDeletedProperty,
} from "@/actions/property-actions";

type dataProps = {
  properties: propertyProps[];
  nextPage: number | undefined;
};

export const useDeleteApartment = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => getDeletedProperty(id),
    onSuccess: async (property: propertyProps) => {
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
              properties: page.properties.filter(
                (item) => item._id !== property._id
              ),
            })),
          };
        }
      );

      toast.success("Property deleted successfully");

      await deleteApartment(id).then((response) => {
        if (!response.success) {
          toast.error(response.message);
          queryClient.invalidateQueries({ queryKey: ["all-added-properties"] });
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

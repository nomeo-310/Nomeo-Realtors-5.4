import { AxiosError } from 'axios'
import { toast } from 'sonner';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const apiRequestHandler = async <T>(requestFn: () =>Promise<T>, setLoading?: (loading:boolean) =>void):Promise<T | null> => {
  if (setLoading) setLoading(true);
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.log(error);
    if (axiosError?.response?.data?.message || axiosError?.response?.data?.error) {
      console.log(axiosError?.response?.data?.message)
      toast.error(axiosError?.response?.data?.message || axiosError?.response?.data?.error || 'An unexpected error occurred.')
    } else {
      toast.error('An unexpected error occured. Try again later.')
    }
    return null
  } finally {
    if (setLoading) setLoading(false)
  }
}
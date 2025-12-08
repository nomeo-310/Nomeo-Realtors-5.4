'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Mail01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons'
import { useTermsAndConditionModal } from '@/hooks/general-store';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { setUpSchema, SetUpValues } from '@/utils/form-validations';
import { zodResolver } from "@hookform/resolvers/zod"
import CustomInput from '../ui/custom-input';
import { LoadingButton } from '../ui/loading-button';
import { activateAdmin, requestNewAccessId } from '@/actions/admin-actions';
import { toast } from 'sonner';

const SetUpForm = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [showRequestButton, setShowRequestButton] = React.useState(false);
  const [requesting, setRequesting] = React.useState(false);

  const { onOpen } = useTermsAndConditionModal();

  const router = useRouter();

  const form = useForm<SetUpValues>({
    resolver: zodResolver(setUpSchema),
    defaultValues: {
      email: '',
      accessId: ''
    }
  })

  const submitForm = async (value: SetUpValues) => {
    setIsLoading(true);
    
    try {
      if (!value.email?.trim()) {
        toast.error('Email is required');
        setIsLoading(false);
        return;
      }
      
      if (!value.accessId?.trim()) {
        toast.error('Access ID is required');
        setIsLoading(false);
        return;
      }

      const response = await activateAdmin(value);

      if (response.success) {
        toast.success(response.message);
        router.push(`/set-password?email=${value.email}`)
      } else {
        // Handle different error statuses with appropriate messages
        switch (response.status) {
          case 400:
            toast.error(response.message || 'Invalid input. Please check your details.');
            break;
          case 403:
            toast.error(response.message || 'Access denied. Invalid access ID.');
            break;
          case 404:
            toast.error(response.message || 'Account not found.');
            break;
          case 409:
            toast.error(response.message || 'Account is already activated.');
            break;
          case 410:
            toast.error(response.message || 'Access ID has expired. Please request a new one.');
            setShowRequestButton(true);
            break;
          case 429:
            toast.error(response.message || 'Too many attempts. Please try again later.');
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(response.message || 'An error occurred. Please try again.');
        }
        
        console.error('Activation error:', response);
      }
      
    } catch (error) {
      // Handle network errors, timeouts, etc.
      console.error('Network error during activation:', error);
      
      // Determine error type
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.');
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }    
    } finally {
      setIsLoading(false);
    }
  };

  const requestNewId = async () => {

    const value = {
      email: form.watch('email'),
      accessId: form.watch('accessId')
    }

    setRequesting(true);
    try {
      await toast.promise(requestNewAccessId(value), {
        loading: 'Sending new acess id...',
        success: (response) => {
          if (response.success) {
            return response.message;
          } else {
            throw new Error(response.message);
          }
        },
        error: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return 'Something went wrong. Try again later';
        }
      });
    } catch (error) {
      toast.error('Something went wrong. Try again later')
      console.error('Error approving apartment:', error);
    } finally {
      setRequesting(false)
    }
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Welcome to Admin Setup</h2>
            <p className='text-sm lg:text-base'>Let's get your administration portal ready. This one-time setup will create your master administrator account with full system access.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Create your primary admin credentials</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Set up system security preferences</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Configure basic administrative settings</p>
            </div>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='flex-1 md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    id='email'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Email Address'
                    className='border rounded-md'
                    icon={Mail01Icon}
                    iconClassName='text-white'
                    type='email'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accessId"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    id='accessId'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Access ID'
                    className='border rounded-md'
                    icon={SquareLock01Icon}
                    iconClassName='text-white'
                    type='password'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          { showRequestButton && (
            <div className='flex items-center justify-end -mt-2'>
              <button type="button" className='text-sm cursor-pointer' onClick={() => requestNewId()}>Request New AcessId</button>
            </div>
          )}
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Setup Account'
            loadingLabel='Setting up account...'
            type='submit'
            isLoading={isLoading}
          />
          <p className='text-center text-sm lg:text-base'>By setting up, you agree to our <button type="button" className='underline' onClick={onOpen}>terms and conditions.</button></p>
        </form>
      </Form>
    </React.Fragment>
  )
};

export default SetUpForm
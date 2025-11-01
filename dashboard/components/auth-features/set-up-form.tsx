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

const SetUpForm = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);

  const { onOpen } = useTermsAndConditionModal();

  const router = useRouter();

  const form = useForm<SetUpValues>({
    resolver: zodResolver(setUpSchema),
    defaultValues: {
      email: '',
      accessId: ''
    }
  })

  const submitForm = async (value:SetUpValues) => {
    setIsLoading(true);
    console.log(value);
    setIsLoading(false);
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
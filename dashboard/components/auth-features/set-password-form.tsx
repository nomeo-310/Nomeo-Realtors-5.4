'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { SquareLock01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { setPasswordSchema, SetPasswordValues } from '@/utils/form-validations';
import { zodResolver } from "@hookform/resolvers/zod"
import CustomInput from '../ui/custom-input';
import { LoadingButton } from '../ui/loading-button';

const SetPasswordForm = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();

  const form = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const submitForm = async (value:SetPasswordValues) => {
    setIsLoading(true);
    console.log(value);
    setIsLoading(false);
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Secure Your Account</h2>
            <p className='text-sm lg:text-base'>Create a strong password to protect your administrative access and ensure system security.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Minimum 8 characters with mixed case</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Include numbers and special characters</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Avoid common words and patterns</p>
            </div>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='flex-1 md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    id='password'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Password'
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    id='confirmPassword'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Confirm password'
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
            label='Setup Password'
            loadingLabel='Setting up password...'
            type='submit'
            isLoading={isLoading}
          />
        </form>
      </Form>
    </React.Fragment>
  )
};

export default SetPasswordForm
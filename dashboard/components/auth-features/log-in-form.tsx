'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Mail01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons'
import { useTermsAndConditionModal } from '@/hooks/general-store';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { loginSchema, LoginValues } from '@/utils/form-validations';
import { zodResolver } from "@hookform/resolvers/zod"
import CustomInput from '../ui/custom-input';
import { LoadingButton } from '../ui/loading-button';

const LoginForm = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);

  const { onOpen } = useTermsAndConditionModal();

  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const submitForm = async (value:LoginValues) => {
    setIsLoading(true);
    console.log(value);
    setIsLoading(false);
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Welcome Back</h2>
            <p className='text-sm lg:text-base'>Access your administration dashboard to manage users, content, and system settings securely.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"/>
              <p className="text-sm lg:text-base">Secure authentication system</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"/>
              <p className="text-sm lg:text-base">Role-based access control</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"/>
              <p className="text-sm lg:text-base">Activity monitoring and logging</p>
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
            name="password"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    id='login-password'
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
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Log In'
            loadingLabel='Logging in, please wait...'
            type='submit'
            isLoading={isLoading}
          />
        </form>
      </Form>
    </React.Fragment>
  )
};

export default LoginForm
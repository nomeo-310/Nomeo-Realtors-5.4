'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { sendOtpSchema, sendOtpValues } from '@/lib/form-validations'
import { LoadingButton } from '@/components/ui/loading-button'
import { SquareLock01Icon } from '@hugeicons/core-free-icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { resetPassword } from '@/actions/user-actions'

const SendOtpForm = () => {

  const form = useForm<sendOtpValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      otp: '',
      password: '',
      confirm_password: ''
    }
  })

  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [isLoading, setIsLoading] = React.useState(false);

  const submitForm = async (value:sendOtpValues) => {
    const { otp, password } = value;

    if (email) {
      const data = { otp, password, email };
      setIsLoading(true);
      await resetPassword(data)
      .then((response) => {

        if (response.success && response.status === 200) {
          toast.success(response.message)
          setIsLoading(false)
          router.push('/log-in')
        };

        if (!response.success) {
          toast.error(response.message)
          setIsLoading(false)
        };
      });
    } else return;
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col gap-3 md:max-w-[500px] max-w-[450px]'>
          <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Change Password</h2>
          <p>To actually be sure you initiated this password reset, you have to send the OTP sent to you email address as well as the new password you intend to use.</p>
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="otp"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='reset_otp'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Enter OTP...'
                    className='border rounded-lg'
                    type='text'
                    icon={SquareLock01Icon}
                    iconClassName='text-white'
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
                  <InputWithIcon
                    id='reset_password'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Enter new password...'
                    className='border rounded-lg'
                    type='password'
                    icon={SquareLock01Icon}
                    iconClassName='text-white'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm_password"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='confirm_reset_password'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Confirm new password...'
                    className='border rounded-lg'
                    type='password'
                    icon={SquareLock01Icon}
                    iconClassName='text-white'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          <div className="flex gap-4 mt-6">
            <LoadingButton
              className='bg-secondary-blue text-white h-[50px] rounded-lg disabled:bg-secondary-blue/50 px-4 flex-1'
              label='Change Password'
              loadingLabel='Changing password...'
              type='submit'
              isLoading={isLoading}
            />
            <button type="button" className='h-[50px] rounded-lg px-6'>
              <Link href={'/forgot-password'}>Go Back</Link> 
            </button>
          </div>
        </form>
      </Form>
    </React.Fragment>
  )
};

export default SendOtpForm;
'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { otpSchema, otpValues } from '@/lib/form-validations'
import { LoadingButton } from '@/components/ui/loading-button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { forgotPassword } from '@/actions/user-actions'

const ForgotPasswordForm = () => {
  const form = useForm<otpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: '',
    }
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const submitForm = async (value:otpValues) => {
    const { email } = value;

    try {
      setIsLoading(true);
      await forgotPassword(email)
      .then((response) => {
        if (response.success && response.status === 200) {
          toast.success(response.message)
          setIsLoading(false)
          router.push(`/reset-password?email=${email}`)
        };

        if (!response.success) {
          toast.error(response.message)
          setIsLoading(false)
        };
      });
      
    } catch (error) {
      toast.error('Something went wrong! Try again later')
    }
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[150px]'>
          <div className="flex flex-col gap-4">
            <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Forgot Password</h2>
            <p className="lg:text-base text-sm">To reset your password, input your email address and you will get a one-time pin. This OTP will expire within five minutes and thus must be instantly submitted</p>
          </div>
          <div className="lg:flex flex-col gap-1 hidden">
            <p className='text-sm md:text-base'>Don&apos;t have an account yet? <Link href={'/sign-up'} className='font-semibold'>Sign Up</Link></p>
            <p className='text-sm md:text-base'>Already have an account? <Link href={'/log-in'} className='font-semibold'>Login</Link></p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='reset_email'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Email address...'
                    className='border rounded-lg'
                    icon={Mail01Icon}
                    iconClassName='text-white'
                    type='text'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Continue'
            loadingLabel='Sending email...'
            type='submit'
            isLoading={isLoading}
          />
          <div className="flex flex-col gap-1 lg:hidden">
            <p className='text-sm md:text-base'>Don&apos;t have an account yet? <Link href={'/sign-up'} className='font-semibold'>Sign Up</Link></p>
            <p className='text-sm md:text-base'>Already have an account? <Link href={'/log-in'} className='font-semibold'>Login</Link></p>
          </div>
        </form>
      </Form>
    </React.Fragment>
  )
};

export default ForgotPasswordForm;
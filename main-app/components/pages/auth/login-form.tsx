'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Mail01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, loginValues } from '@/lib/form-validations'
import { LoadingButton } from '@/components/ui/loading-button'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useRestoreAccountModal, useSuspendedAccountModal } from '@/hooks/general-store'
import { protectSignIn } from '@/actions/auth'

const LoginForm = () => {

  const form = useForm<loginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const router = useRouter();
  const nextUrl = localStorage.getItem('nextUrl')

  const restoreAccountModal = useRestoreAccountModal();
  const suspendedAccountModal = useSuspendedAccountModal ();

  const [isLoading, setIsLoading] = React.useState(false);

  const submitForm = async (values: loginValues) => {
    setIsLoading(true);
  
  try {
    const checkEmailValidation = await protectSignIn(values.email);
    if (!checkEmailValidation.success) {
      toast.error(checkEmailValidation.error);
      return;
    }

    const callback = await signIn("credentials", { ...values, redirect: false });
    
    if (callback?.ok) {
      toast.success('Login was successful');
      localStorage.removeItem('nextUrl');
      router.push(nextUrl ? nextUrl : '/');
      router.refresh();
      return;
    }

    if (callback?.error) {
      console.log('Login error:', callback.error);
      
      const errorConfig = {
        account_deleted_by_admin: {
          message: 'Account was deleted by admin.',
          action: () => router.push('/account-deleted?deleted=admin')
        },
        account_deleted_by_self_user: {
          message: 'Account was deleted. Would you like to restore it?',
          action: () => restoreAccountModal.onOpen({ type: 'login', role: 'user' })
        },
        account_deleted_by_self_agent: {
          message: 'Account was deleted. Would you like to restore it?',
          action: () => restoreAccountModal.onOpen({ type: 'login', role: 'agent' })
        },
        account_suspended_user: {
          message: 'Your account has been suspended.',
          action: () => suspendedAccountModal.onOpen({ type: 'login', role: 'user' })
        },
        account_suspended_agent: {
          message: 'Your account has been suspended.',
          action: () => suspendedAccountModal.onOpen({ type: 'login', role: 'agent' })
        },
        invalid_credentials: {
          message: 'Invalid email or password',
          action: null
        }
      };

      const config = errorConfig[callback.error as keyof typeof errorConfig];
      
      if (config) {
        toast.error(config.message);
        if (config.action) {
          setTimeout(config.action, 2000);
        }
      } else {
        toast.error('Authentication failed');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Authentication failed');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[150px]'>
          <div className="flex flex-col gap-4">
            <h2 className="lg:text-4xl text-3xl font-semibold font-quicksand">Welcome Back</h2>
            <p className='text-sm lg:text-base'>Access your personalized dashboard, manage your properties, and stay updated with real-time notifications.</p>
          </div>
          <div className="lg:flex flex-col gap-1 hidden">
            <p className='text-sm md:text-base'>Have you forgotten your password? <Link href={'/forgot-password'} className='font-semibold'>Reset Password</Link></p>
            <p className='text-sm md:text-base'>Don&apos;t have an account yet? <Link href={'/sign-up/user'} className='font-semibold'>Sign Up</Link></p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='user_email'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Email Address'
                    className='border rounded-lg'
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
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='user_password'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Password'
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
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Log In'
            loadingLabel='Logging In...'
            type='submit'
            isLoading={isLoading}
          />
          <div className="flex flex-col gap-1 lg:hidden">
            <p className='text-sm md:text-base'>Have you forgotten your password? <Link href={'/forgot-password'} className='font-semibold'>Reset Password</Link></p>
            <p className='text-sm md:text-base'>Don&apos;t have an account yet? <Link href={'/sign-up/user'} className='font-semibold'>Sign Up</Link></p>
          </div>
        </form>
      </Form>
    </React.Fragment>
  )
};

export default LoginForm
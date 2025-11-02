'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { AtIcon, Mail01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, signupValues } from '@/lib/form-validations'
import { LoadingButton } from '@/components/ui/loading-button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTermsAndConditionModal } from '@/hooks/general-store'
import { createAgent } from '@/actions/user-actions'
import { protectSignUpActions } from '@/actions/auth'

const AgentSignUpForm = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);

  const { onOpen } = useTermsAndConditionModal();

  const router = useRouter();

  const form = useForm<signupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      role: '',
    }
  })

  const submitForm = async (value:signupValues) => {
    setIsLoading(true);
    const data = {...value, role: 'agent'};
    const checkEmailValidation = await protectSignUpActions(data.email);

    if (!checkEmailValidation.success) {
      toast.error(checkEmailValidation.error)
    };

    const newUserData = {username: data.username, email: data.email, password: data.password, role: 'agent'}
    await createAgent(newUserData)
    .then((response) => {
      if (response.success && response.status === 201) {
        toast.success(response.message);
        setIsLoading(false);
        localStorage.setItem('user-details', JSON.stringify({email: value.email, password: value.password}))
        router.push(`/verify-email?email=${data.email}`)
      };

      if (!response.success) {
        toast.error(response.message);
        setIsLoading(false);
      }
    }).catch((error) => {
      if (error) {
        toast.error('Something went! Try again later')
        setIsLoading(false);
      }
    })
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className="lg:text-4xl text-3xl font-semibold font-quicksand">Become a Nomeo Agent</h2>
            <p className='text-sm lg:text-base'>Join our network of professional real estate agents. List properties for lease and sale, connect with buyers, and grow your business with Nomeo Realtors.</p>
          </div>
          <div className="lg:flex flex-col gap-1 hidden">
              <p className='mt-1 text-sm md:text-base'>Do you rather want to be a user? <Link href={'/sign-up/user'} className='font-semibold'>User Signup</Link>
              </p>
            <p className='text-sm md:text-base'>Already have an account? <Link href={'/log-in'} className='font-semibold'>Login</Link></p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="username"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='username'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Username'
                    className='border rounded-lg'
                    icon={AtIcon}
                    iconClassName='text-white'
                    type='text'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='email'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Email Address'
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
          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='password'
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
          <FormField
            control={form.control}
            name="confirm_password"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id='confirm_password'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Confirm Password'
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
            label='Create Account'
            loadingLabel='Creating account...'
            type='submit'
            isLoading={isLoading}
          />
          <p className='text-center text-sm lg:text-base'>By signing up, you agree to our <button type="button" className='underline' onClick={onOpen}>terms and conditions.</button></p>
          <div className="flex flex-col gap-1 lg:hidden">
              <p className='mt-1 text-sm md:text-base'>Do you rather want to be a user? <Link href={'/sign-up/user'} className='font-semibold'>User Signup</Link></p>
            <p className='text-sm md:text-base'>Already have an account? <Link href={'/log-in'} className='font-semibold'>Login</Link></p>
          </div>
        </form>
      </Form>
    </React.Fragment>
  )
};

export default AgentSignUpForm
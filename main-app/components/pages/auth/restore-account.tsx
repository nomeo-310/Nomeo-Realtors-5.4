'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { AtIcon, Mail01Icon, SquareLock01Icon } from '@hugeicons/core-free-icons'
import InputWithIcon from '@/components/ui/input-with-icon'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { restoreSchema, restoreValues } from '@/lib/form-validations'
import { LoadingButton } from '@/components/ui/loading-button'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTermsAndConditionModal } from '@/hooks/general-store'
import { protectSignUpActions } from '@/actions/auth'
import { restoreUser } from '@/actions/user-actions'

const RestoreAccountForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const { onOpen } = useTermsAndConditionModal();

  const router = useRouter();

  React.useEffect(() => {
    const values = JSON.parse(localStorage.getItem('restore-details') || '{}');
    if (values) {
      form.setValue('email', values.email)
      form.setValue('password', values.password)
      form.setValue('username', values.username)
    }
  }, []);

  const form = useForm<restoreValues>({
    resolver: zodResolver(restoreSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  });

  const submitForm = async (value:restoreValues) => {
    setIsLoading(true);
    const data = {...value};
    const checkEmailValidation = await protectSignUpActions(data.email);

    if (!checkEmailValidation.success) {
      toast.error(checkEmailValidation.error)
    };

  const newUserData = {username: data.username, email: data.email, password: data.password}
  await restoreUser(newUserData).then((response) => {
    if (response.success && response.status === 200) {
      toast.success(response.message);
      setIsLoading(false);
      localStorage.setItem('user-details', JSON.stringify({email: value.email, password: value.password}))
      router.push(`/verify-email?email=${data.email}`)
    };

    if (!response.success) {
      if (response.status === 408) {
        toast.error(response.message, 
          { action: {
            label: 'Restore Account',
            onClick: () => {router.push(`/restore-account`)}
          }});
      } else {
        toast.error(response.message);
      }
      setIsLoading(false);
    }
  }).catch((error) => {
    if (error) {
      toast.error('Something went wrong! Try again later')
      setIsLoading(false);
      }
    });
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[450px] max-w-[400px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className='lg:text-5xl text-3xl font-semibold font-quicksand'>Restore Account</h2>
            <p>Welcome back to Nomeo Realtors, we are glad to have you. Please make sure to use the exact details used in creating the account initially inorder to have an effective account restoration.</p>
          </div>
          <div className="lg:flex flex-col gap-1 hidden">
           <p className='mt-1 text-sm md:text-base'>Would you rather clear the old data and start afresh? <button className='font-semibold' onClick={() =>{}}>Signup</button></p>
            <p className='text-sm md:text-base'>Already have an account? <Link href={'/log-in'} className='font-semibold'>Login</Link></p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[450px] max-w-[400px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
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
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Restore Account'
            loadingLabel='Restoring account...'
            type='submit'
            isLoading={isLoading}
          />
          <p className='text-center text-sm lg:text-base'>By completing this actions, you agree to our <button type="button" className='underline' onClick={onOpen}>terms and conditions.</button></p>
          <div className="flex flex-col gap-1 lg:hidden">
           <p className='mt-1 text-sm md:text-base'>Are you intetested in being one of our agents? <Link href={'/sign-up/agent'} className='font-semibold'>Agent Signup</Link></p>
            <p className='text-sm md:text-base'>Already have an account? <Link href={'/log-in'} className='font-semibold'>Login</Link></p>
          </div>
        </form>
      </Form>
    </React.Fragment>
  )
}

export default RestoreAccountForm
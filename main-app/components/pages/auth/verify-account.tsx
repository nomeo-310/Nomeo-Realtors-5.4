'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { verifyEmailSchema, verifyEmailValues } from '@/lib/form-validations'
import { LoadingButton } from '@/components/ui/loading-button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { resendOtp, verifyAccount } from '@/app/action/user-actions'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

const  VerifyAccountForm = () => {

  const form = useForm<verifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    }
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
   const nextUrl = localStorage.getItem('nextUrl')

  const submitForm = async (value:verifyEmailValues) => {
    const { otp } = value;
    const values = JSON.parse(localStorage.getItem('user-details') || '{}')
    const regData = {email: values.email, password: values.password}
    if (email) {
      const dataValue = { otp, email };
      setIsLoading(true);
      try {
        await verifyAccount(dataValue)
        .then((response) => {
          if (response.success && response.status === 200) {
            signIn("credentials", {...regData, redirect: false})
            .then((callback) => {
              if (callback?.ok) {
                router.push(nextUrl ? nextUrl : '/');
                toast.success(response.message);
                localStorage.removeItem('user-details');
                localStorage.removeItem('nextUrl');
                setIsLoading(false);
                router.refresh();
              };
        
              if (callback?.error) {
                setIsLoading(false)
                return toast.error(callback.error)
              };
            })
          };
  
          if (!response.success) {
            setIsLoading(false)
            toast.error(response.message);
          }
        }).catch((error) => {
          if (error) {
            console.error(error);
            toast.error('Something went wrong, Try again later')
          }
        })
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong, Try again later')
      }
    } else return;
  };

  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [showResendButton, setShowResendButton] = React.useState(false);

  const resentOtp = async () => {
    if (email) {
      try {
        setIsSending(true)
        await resendOtp(email)
        .then((response) => {
          if (response.success && response.status === 200) {
            toast.success(response.message);
            setIsSending(false)
            router.push('/log-in')
          };
          if (!response.success) {
            toast.error(response.message);
            setIsSending(false);
          }
        })
      } catch (error) {
        console.error(error);
        setIsSending(false)
        toast.error('Something went wrong, Try again later')
      }
    } else {
      toast.error('Refresh the page please');
      setIsSending(false)
    }
    setShowResendButton(false);
    startDelay();
  };

  const startCountdown = () => {
    setTimeLeft(60);
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime && prevTime <= 1) {
          clearInterval(intervalId);
          setShowResendButton(true);
          return 0
        }
        return prevTime ? prevTime - 1 : 0;
      })
    }, 1000);
  }

  const startDelay = () => {
    setTimeLeft(null);
    setTimeout(() => {
      startCountdown();
    }, 12000)
  };

  React.useEffect(() => {
    startDelay();
  }, []);

  React.useEffect(() =>{
    if (timeLeft && timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime && prevTime <= 1) {
            clearInterval(intervalId);
            setShowResendButton(true);
            return 0
          }
          return prevTime ? prevTime - 1 : 0;
        })
      }, 1000);
      return () => clearInterval(intervalId)
    }
  },[timeLeft]);

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col gap-3 md:max-w-[450px] max-w-[400px]'>
          <h2 className='lg:text-5xl text-3xl font-semibold font-quicksand'>Email Verification</h2>
          <p>To complete the sign up process and verify your email address, we have sent a one-time pin to your email address. If you did not get it ask for a resend.</p>
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[450px] max-w-[400px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="otp"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className='w-full h-12 gap-2 md:gap-3 xl:gap-4 font-quicksand'>
                      <InputOTPSlot index={0} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white'/>
                      <InputOTPSlot index={1} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white' />
                      <InputOTPSlot index={2} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white' />
                      <InputOTPSlot index={3} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white' />
                      <InputOTPSlot index={4} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white' />
                      <InputOTPSlot index={5} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white' />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
              </FormItem>
            )}
          />
          <div className='flex items-center justify-end'>
            {timeLeft !== null && timeLeft > 0 && <p>{timeLeft}s</p>}
            {showResendButton && 
              <button type="button" className='text-white text-sm font-semibold flex items-center gap-3 disabled:text-white/60' onClick={resentOtp} disabled={isSending}>
                {isSending ? 'Resending OTP...' : 'Resend OTP'}
                {isSending && <Loader2 className='animate-spin'/>}
              </button>}
          </div>
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Send'
            loadingLabel='Sending otp...'
            type='submit'
            isLoading={isLoading}
          />
        </form>
      </Form>
    </React.Fragment>
  )
};

export default VerifyAccountForm;
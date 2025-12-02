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
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { resendOtp, verifyAccount } from '@/actions/user-actions'

const VerifyAccountForm = () => {
  const form = useForm<verifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    }
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [showResendButton, setShowResendButton] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const autoResend = searchParams.get('autoResend');
  const nextUrl = localStorage.getItem('nextUrl');

  // Use ref to track if auto-send has been done
  const hasAutoSentRef = React.useRef(false);

  // Dedicated function for sending OTP
  const sendOtp = async (isAutoSend: boolean = false) => {
    if (!email) {
      toast.error('Email not found. Please refresh the page.');
      return false;
    }

    try {
      if (!isAutoSend) {
        setIsSending(true);
      }
      
      const response = await resendOtp(email);
      
      if (response.success && response.status === 200) {
        if (!isAutoSend) {
          toast.success(response.message);
        } else {
          toast.info('New verification code sent to your email');
        }
        return true;
      } else {
        toast.error(response.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Something went wrong. Please try again later.');
      return false;
    } finally {
      if (!isAutoSend) {
        setIsSending(false);
      }
    }
  };

  const submitForm = async (value: verifyEmailValues) => {
    const { otp } = value;
    const values = JSON.parse(localStorage.getItem('user-details') || '{}')
    const regData = { email: values.email, password: values.password }
    
    if (email) {
      const dataValue = { otp, email };
      setIsLoading(true);
      try {
        await verifyAccount(dataValue)
          .then((response) => {
            if (response.success && response.status === 200) {
              signIn("credentials", { ...regData, redirect: false })
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
              console.error('OTP verification failed:', response.message);
              toast.error(response.message);
            }
          }).catch((error) => {
            if (error) {
              console.error(error);
              console.log('Something went wrong, Try again later', error);
              toast.error('Something went wrong, Try again later')
            }
          })
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong, Try again later')
      }
    } else return;
  };

  const handleResendOtp = async () => {
    const success = await sendOtp(false);
    if (success) {
      setShowResendButton(false);
      startCountdown();
    }
  };

  const startCountdown = () => {
    setTimeLeft(60);
  };

  // Countdown timer effect
  React.useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(intervalId);
            setShowResendButton(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [timeLeft]);

  // Initialize component - run only once
  React.useEffect(() => {
    const initialize = async () => {
      // If autoResend is true and we haven't sent yet, send OTP
      if (autoResend === 'true' && email && !hasAutoSentRef.current) {
        hasAutoSentRef.current = true;
        await sendOtp(true);
        startCountdown();
      } else if (email && !hasAutoSentRef.current) {
        // For normal flow, just start countdown without sending OTP
        hasAutoSentRef.current = true;
        startCountdown();
      }
    };

    initialize();
  }, [autoResend, email]); // Remove hasAutoSent from dependencies

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col gap-3 md:max-w-[500px] max-w-[450px]'>
          <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Email Verification</h2>
          <p className="lg:text-base text-sm">
            {autoResend === 'true' 
              ? 'To access your account, please verify your email address. We have sent a new one-time pin to your email.'
              : 'To complete the sign up process and verify your email address, we have sent a one-time pin to your email address. If you did not get it ask for a resend.'
            }
          </p>
          {autoResend === 'true' && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              <strong>Note:</strong> A new verification code has been sent to your email.
            </p>
          )}
        </div>
      </div>
      <Form {...form}>
        <form className='md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className='w-full h-12 gap-2 md:gap-3 xl:gap-4 font-quicksand'>
                      <InputOTPSlot index={0} className='h-full w-full rounded-md border border-solid text-[23px] leading-normal text-white' />
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
            {timeLeft !== null && timeLeft > 0 && (
              <p className="text-sm">
                Resend available in {timeLeft}s
              </p>
            )}
            {showResendButton && (
              <button 
                type="button" 
                className='text-white text-sm font-semibold flex items-center gap-3 disabled:text-white/60' 
                onClick={handleResendOtp} 
                disabled={isSending}
              >
                {isSending ? 'Resending OTP...' : 'Resend OTP'}
                {isSending && <Loader2 className='animate-spin size-4' />}
              </button>
            )}
          </div>
          <LoadingButton
            className='bg-secondary-blue text-white h-[50px] rounded-lg mt-6 disabled:bg-secondary-blue/50'
            label='Verify Email'
            loadingLabel='Verifying...'
            type='submit'
            isLoading={isLoading}
          />
        </form>
      </Form>
    </React.Fragment>
  )
};

export default VerifyAccountForm;
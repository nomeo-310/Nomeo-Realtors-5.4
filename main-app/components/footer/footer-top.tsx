'use client'

import { usePathname } from 'next/navigation';
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { EntranceStairsIcon, Facebook01Icon, InstagramIcon, ThreadsIcon, TwitterIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { useTermsAndConditionModal } from '@/hooks/general-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subscribeUser } from '@/actions/subscription-action';

const FooterTop = () => {
  const { onOpen } = useTermsAndConditionModal();

  const Subscription = () => {
    const [isSending, setIsSending] = React.useState(false);
    const [error, setError] = React.useState('');
    const [email, setEmail] = React.useState('');
    const path = usePathname();

    
    const isValidEmail = (email:string) => {
      const regEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regEx.test(email);
    }

    const onChange = (event:React.ChangeEvent<HTMLInputElement>) => {
      if (error) setError('');
      const input = event.target.value
      setEmail(input)
    };

    const handleSubscribe = async (event:React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = {email: email, path: path};

      if (email.trim().length < 1) {
        setError('Email is required for subscription');
        return;
      };

      if (!isValidEmail(email)) {
        setError('Invalid email address!!');
        return;
      }

      setIsSending(true)
      try {
        await subscribeUser(data)
        .then((response) => {
          if (response && response.status === 200) {
            toast.success(response.message);
            setEmail('');
            setIsSending(false)
          } else {
            toast.error(response.message);
            setIsSending(false)
            setEmail('');
          }
        })
      } catch (error) {
        toast.error('Something went wrong, try again later');
        setIsSending(false)
      } finally {
        () => setIsSending(false)
      }
    };

    return (
      <div className="w-full  flex gap-6 flex-col">
        <p className='lg:text-xl text-lg font-semibold'>Subscribe to our newsletter:</p>
        <div>
          <form className='flex rounded-md overflow-hidden border border-white' onSubmit={handleSubscribe} noValidate>
            <div className="grow flex items-center">
              <input type="email" placeholder='enter your email address' className='w-full pl-5 p-3 outline-none bg-inherit placeholder:text-white lg:text-base text-sm' onChange={onChange} value={email}/>
            </div>
            <div className="w-fit">
              <button className='py-3 px-8 bg-white text-black text-sm lg:text-base flex items-center gap-3' type='submit' disabled={isSending}>
                {isSending ? 'Sending details' : 'Subscribe'}
                {isSending && <Loader2 className='animate-spin'/>}
              </button>
            </div>
          </form> 
          <div className={cn("mt-1 text-sm ml-8", error && 'text-red-500')}>
            {error ? <>{error}</> : <>By subscribing you agree to our <button className='underline' onClick={onOpen} type='button'>Terms And Conditions</button>.</>}
          </div>
        </div>
        <div>
          <p className='lg:text-xl text-lg font-semibold font-quicksand'>Follow us on:</p>
          <div className='flex gap-6 items-center mt-6'>
            <a href="https://wwww.instagram.com/nomeosuites" className='hover:scale-110'>
              <HugeiconsIcon icon={InstagramIcon} className='lg:size-8'/>
            </a>
            <a href="https://wwww.facebook.com/nomeosuites" className='hover:scale-110'>
              <HugeiconsIcon icon={Facebook01Icon} className='lg:size-8'/>
            </a>
            <a href="https://wwww.twitter.com/nomeosuites" className='hover:scale-110'>
              <HugeiconsIcon icon={TwitterIcon} className='lg:size-8'/>
            </a>
            <a href="https://wwww.threads.com/nomeosuites" className='hover:scale-110'>
              <HugeiconsIcon icon={ThreadsIcon} className='lg:size-8'/>
            </a>
          </div>
        </div>
      </div>
    )
  };

  const MainFooter = () => {
    return (
      <div className='w-full md:w-[60%] pb-6 md:pb-0 flex flex-col gap-6'>
        <div className='w-full'>
          <Link href={'/'} className='flex items-center gap-2'>
            <HugeiconsIcon icon={EntranceStairsIcon}/>
            <p className='lg:text-lg text-base font-semibold'>Nomeo Realtors</p>
          </Link>
          <div className='flex flex-col gap-1 mt-6'>
            <p className='text-sm lg:text-base'>Block 12B, Omo-Disu Street, Owutu Estate, Ikeja, Lagos State.</p>
            <p className='text-sm lg:text-base'>Block 12B, Omo-Disu Street, Owutu Estate, Ikeja, Oyo State.</p>
            <p className='text-sm lg:text-base'>Block 12B, Omo-Disu Street, Owutu Estate, Ikeja, Ogun State.</p>
          </div>
        </div>
        <div className='flex gap-4 items-center'>
          <h2 className='lg:text-lg text-base font-semibold'>Company:</h2>
          <div className='flex items-center gap-4 text-sm lg:text-base'>
            <Link href={'/about'} className='hover:underline'>About Us</Link>
            <Link href={'/blogs'} className='hover:underline'>Blogs</Link>
            <Link href={'/contact-us'} className='hover:underline'>Contact</Link>
            <Link href={'/#testimonials'} className='hover:underline'>Testimonials</Link>
            <Link href={'/frequently-asked-questions'} className='hover:underline'>FAQs</Link>
          </div>
        </div>
        <div className='flex gap-4 items-center'>
          <h2 className='text-lg font-semibold'>Real Estate:</h2>
          <div className='flex items-center gap-4 text-sm lg:text-base'>
            <Link href={'/for-sale'} className='hover:underline'>For Sale</Link>
            <Link href={'/for-rent'} className='hover:underline'>For Rent</Link>
            <Link href={'/#featuredProperties'} className='hover:underline'>Featured</Link>
            <Link href={'/#latestBlogs'} className='hover:underline'>Latest Blogs</Link>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="flex lg:gap-8 md:flex-row md:items-start flex-col gap-3 mb-10 w-full">
      <div className="w-full flex lg:flex-row flex-col lg:gap-8 gap-4">
        <MainFooter/>
        <hr className='sm:hidden'/>
        <div className="lg:w-[40%] w-full">
          <Subscription/>
        </div>
      </div>
    </div>
  )
}

export default FooterTop
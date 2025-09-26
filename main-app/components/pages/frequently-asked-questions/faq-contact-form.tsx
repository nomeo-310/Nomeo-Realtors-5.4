'use client'

import React from 'react'
import { Comment01Icon, Mail01Icon, User03Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqMessageSchema, faqMessageValues } from '@/lib/form-validations';
import { toast } from 'sonner';
import { sendFaq } from '@/actions/send-faq';
import { HugeiconsIcon } from '@hugeicons/react';

const FaqContactForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(faqMessageSchema),
    defaultValues: {
      message: '',
      email: '',
      name: ''
    }
  })

  const onSubmitForm = async (value:faqMessageValues) => {
    setIsLoading(true)
   await sendFaq(value)
   .then((response) => {

    if (response.success) {
      toast.success(response.message);
      setIsLoading(false)
      form.reset();
    };

    if (!response.success) {
      toast.error(response.message);
      setIsLoading(false);
    };

   }).catch((error) => {
    console.error(error)
    toast.error('Internal server error!! Try again later');
   })
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3 md:w-1/2 w-full md:mx-auto" onSubmit={form.handleSubmit(onSubmitForm)}>
        <FormField
          control={form.control}
          name='name'
          render={({field}) => (
            <FormItem>
              <FormControl>
                <InputWithIcon
                  type='text'
                  inputClassName='bg-neutral-300 dark:bg-[#424242] placeholder:text-black/80 dark:placeholder:text-white/70'
                  icon={User03Icon}
                  placeholder='Your full name...'
                  {...field}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({field}) => (
            <FormItem>
              <FormControl>
                <InputWithIcon
                  type='email'
                  inputClassName='bg-neutral-300 dark:bg-[#424242] placeholder:text-black/80 dark:placeholder:text-white/70'
                  icon={Mail01Icon}
                  placeholder='Email address...'
                  {...field}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='message'
          render={({field}) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <HugeiconsIcon icon={Comment01Icon} className='absolute top-2 left-3 size-5 md:size-6'/>
                  <Textarea
                    {...field}
                    className='h-[150px] resize-none text-sm lg:text-base placeholder:text-black/80 border-0 shadow-none bg-neutral-300 dark:bg-[#424242] focus-visible:ring-0 pl-10 dark:placeholder:text-white/70'
                    placeholder='What will you like to ask about...'
                  />
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <LoadingButton
          type='submit'
          className='py-2.5 px-5 rounded-lg bg-black text-white text-sm lg:text-base dark:bg-[#424242] mt-3'
          label='Send Message'
          loadingLabel='Sending Message...'
          isLoading={isLoading}
        />
      </form>
    </Form>
  )
}

export default FaqContactForm;
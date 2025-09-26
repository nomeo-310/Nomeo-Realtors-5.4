'use client'

import { contactUs } from '@/actions/contact-us'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { HugeiconsIcon } from '@hugeicons/react';
import { User03Icon, TelephoneIcon, Home04Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon'
import { LoadingButton } from '@/components/ui/loading-button'
import { Textarea } from '@/components/ui/textarea'
import { contactSchema, contactValues } from '@/lib/form-validations'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const ContactUsClient = () => {

  const defaultContactValue =  {
    email: '',
    fullName: '', 
    phoneNumber: '',
    message: ''
  };

  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<contactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultContactValue
  });

  const submitForm = async (values:contactValues) => {
    setIsLoading(true);
    await contactUs(values)
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
  }

  return (
    <div className='w-full md:min-h-screen pt-[70px] lg:pt-[70px] xl:px-16 md:px-10 px-6 h-full flex flex-col items-center justify-center'>
      <div className="w-full h-full flex flex-col lg:flex-row 2xl:gap-24 lg:gap-20 md:items-center">
        <div className="lg:w-[50%] w-full flex flex-col gap-4 lg:gap-5 ">
          <div className='flex flex-col w-full'>
            <h1 className='text-xl md:text-2xl lg:text-3xl font-bold font-quicksand'>Contact Us</h1>
          </div>
          <div className='flex flex-col gap-2'>
            <h3 className='text-gray-500 dark:text-gray-400 lg:text-lg text-base font-medium mb-2'>We&apos;re here for you — anytime, anywhere.</h3>
            <p className='text-sm lg:text-base'>Whether you have a question, need support, or just want to say hello, we&apos;re only a message away. Our team is committed to making your experience smooth, helpful, and human — because your voice truly matters to us.</p>
            <p className='text-sm lg:text-base'>Reach out with your feedback, ideas, or inquiries — no issue is too small, and no dream too big. We&apos;d love to hear from you and help in any way we can. Just drop us a message and we&apos;ll get back to you as soon as possible!</p>
          </div>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
              <div className='size-11 lg:size-12 border rounded-lg flex items-center justify-center bg-[#d4d4d4] dark:bg-[#424242]'>
                <HugeiconsIcon icon={Home04Icon} className='lg:size-7'/>
              </div>
              <div>
                <p className='text-sm font-semibold'>Our head office:</p>
                <p className='text-sm'>Block 12B, Omo-Disu Street, Owutu Estate, Ikeja, Lagos State</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='size-11 lg:size-12 border rounded-lg flex items-center justify-center bg-[#d4d4d4] dark:bg-[#424242]'>
                <HugeiconsIcon icon={Mail01Icon} className='lg:size-7'/>
              </div>
              <div>
                <p className='text-sm font-semibold'>Our Email:</p>
                <p className='text-sm'>support@nomeorealtors.com</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='size-11 lg:size-12 border rounded-lg flex items-center justify-center bg-[#d4d4d4] dark:bg-[#424242]'>
                <HugeiconsIcon icon={TelephoneIcon} className='lg:size-7'/>
              </div>
              <div>
                <p className='text-sm font-semibold'>Our Telephone:</p>
                <p className='text-sm'>+2347037575894</p>
              </div>
            </div>
          </div>
          <hr className='lg:hidden'/>
        </div>
        <Form {...form}>
          <form className="lg:w-[50%] w-full flex flex-col gap-3 pt-6 pb-10 lg:pb-0 lg:pt-0" onSubmit={form.handleSubmit(submitForm)}>
            <FormField
              control={form.control}
              name='fullName'
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      {...field}
                      id='user_full_name'
                      type='text'
                      placeholder='Your full name'
                      icon={User03Icon}
                      className='rounded-lg bg-[#d4d4d4] dark:bg-[#424242] border'
                      inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
                    />
                  </FormControl>
                  <FormMessage className='-mt-4'/>
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <InputWithIcon
                        {...field}
                        id='user_phone_number'
                        type='tel'
                        placeholder='Your phone number'
                        icon={TelephoneIcon}
                        className='rounded-lg bg-[#d4d4d4] dark:bg-[#424242] border'
                        inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
                      />
                    </FormControl>
                    <FormMessage className='-mt-4'/>
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
                        {...field}
                        id='user_email_address'
                        type='email'
                        placeholder='Your email address'
                        icon={Mail01Icon}
                        className='rounded-lg bg-[#d4d4d4] dark:bg-[#424242] border'
                        inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
                      />
                    </FormControl>
                    <FormMessage className='-mt-4'/>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='message'
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      id='user_message' 
                      className='border rounded-lg bg-[#d4d4d4] dark:bg-[#424242] 2xl:h-[180px] lg:h-[130px] h-[110px] resize-none p-2.5 lg:text-base dark:placeholder:text-white/70 placeholder:text-black/70'
                      placeholder='How can we help?'
                    />
                  </FormControl>
                  <FormMessage className='-mt-4'/>
                </FormItem>
              )}
            />
            <div className='mt-6'>
              <LoadingButton label={'Submit'} loadingLabel={'Submitting'} isLoading={isLoading} className='lg:h-12 h-11 w-full bg-black text-white rounded-lg' />
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ContactUsClient
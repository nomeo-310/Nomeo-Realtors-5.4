'use client'

import React from 'react'
import Modal from '../ui/modal'
import { usePaymentModal, useTransactionModal } from '@/hooks/general-store'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { transactionSchema, transactionValues } from '@/lib/form-validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { userDetails } from '@/lib/types'
import InputWithIcon from '../ui/input-with-icon'
import { CreditCardIcon, Mail01Icon, TelephoneIcon } from '@hugeicons/core-free-icons';
import { LoadingButton } from '../ui/loading-button'

const TransactionModal = ({user}:{user:userDetails}) => {

  const { isOpen, onClose } = useTransactionModal();
  const { onOpen } = usePaymentModal();

  const TransactionForm = () => {
    const fullPayment = localStorage.getItem('totalPayment');

    const form = useForm<transactionValues>({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        amount: fullPayment ? fullPayment : '',
        email: user?.email,
        phoneNumber: user?.phoneNumber
      }
    });
  
    const amount = form.watch('amount');
    const email = form.watch('email');
  
    const onSubmit = (data:transactionValues) => {

      if (amount !== fullPayment) {
        form.setError('amount', {type: 'manual', message: 'Please make full payment'})
      };

      const transactionData = {
        email: data.email,
        amount: parseInt(data.amount),
        phone_number: data.phoneNumber
      };

      localStorage.removeItem('totalPayment');
      localStorage.setItem('transaction-data', JSON.stringify(transactionData));
      onClose();
      onOpen();
    };

    return (
      <Form {...form}>
        <form action="" className='flex flex-col gap-3' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='email'
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    className='bg-gray-200 rounded-lg'
                    icon={Mail01Icon}
                    inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                    placeholder='Email address'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='-mt-2'/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phoneNumber'
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    className='bg-gray-200 rounded-lg'
                    icon={TelephoneIcon}
                    inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                    placeholder='Phone number'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='-mt-2'/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='amount'
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    className='bg-gray-200 rounded-lg'
                    icon={CreditCardIcon}
                    inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                    placeholder='Total amount'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='-mt-2'/>
              </FormItem>
            )}
          />
          { email &&
            <LoadingButton
              label='Proceed'
              loadingLabel='Proceeding ...'
              className='mt-6 w-full py-2 lg:py-2.5 bg-secondary-blue text-white text-sm lg:text-base rounded-lg'
            />
          }
        </form>
      </Form>
    )
  }
  return (
    <Modal
      title='Start Transaction'
      useCloseButton
      isOpen={isOpen}
      onClose={onClose}
      description='Make payment and get email notification of your payment'
    >
      <TransactionForm/>
    </Modal>
  )
}

export default TransactionModal
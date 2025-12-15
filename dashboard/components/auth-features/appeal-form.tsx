'use client'

import React from 'react'
import { appealSchema, AppealValues } from '@/utils/form-validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAppealForm } from '@/hooks/general-store';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import CustomInput from '../ui/custom-input';
import { Mail01Icon } from '@hugeicons/core-free-icons';
import { Textarea } from '../ui/textarea';
import { LoadingButton } from '../ui/loading-button';

const AppealForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { appealType } = useAppealForm();

  const form = useForm<AppealValues>({
    resolver: zodResolver(appealSchema),
    defaultValues: {
      email: '',
      message: ''
    }
  });

  const submitForm = async (value: AppealValues) => {
    setIsLoading(true);
    try {
      console.log('Submitting appeal:', { type: appealType, ...value });
      // Add your API call here
      // await submitAppeal({ appealType, ...value });
    } catch (error) {
      console.error('Appeal submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Configuration based on appeal type
  const appealConfig = {
    suspension: {
      title: 'Appeal Account Suspension',
      subtitle: 'Request a review of your account suspension. Provide details to help us understand your situation.',
      points: [
        'Explain the circumstances leading to suspension',
        'Provide any supporting evidence or context',
        'Describe steps taken to prevent future violations',
        'Allow 3-5 business days for review'
      ],
      placeholder: 'Explain why your account suspension should be reconsidered. Include any relevant details, dates, or supporting information...',
      buttonText: 'Submit Suspension Appeal'
    },
    deactivation: {
      title: 'Request Account Reactivation',
      subtitle: 'Appeal to reactivate your deactivated account. Share your case for consideration.',
      points: [
        'Explain why your account was deactivated',
        'Provide context for the deactivation',
        'Describe corrective actions taken',
        'Allow 5-7 business days for review process'
      ],
      placeholder: 'Explain why your account should be reactivated. Include details about the deactivation and what has changed since then...',
      buttonText: 'Submit Reactivation Request'
    }
  };

  const config = appealConfig[appealType];

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>
              {config.title}
            </h2>
            <p className='text-sm lg:text-base'>
              {config.subtitle}
            </p>
          </div>
          <div className="space-y-3 md:space-y-4 md:mt-6 mt-4">
            {config.points.map((point, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0"/>
                <p className="text-sm lg:text-base">{point}</p>
              </div>
            ))}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6 hidden lg:block">
              <p className="text-sm font-medium text-blue-800 mb-1">What to include:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
                <li>Clear explanation of your situation</li>
                <li>Date of {appealType === 'suspension' ? 'suspension' : 'deactivation'}</li>
                <li>Any supporting documentation references</li>
                <li>Contact information for follow-up</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='flex-1 md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <CustomInput
                    id='email'
                    inputClassName='placeholder:text-white/70'
                    placeholder='Your registered email address'
                    className='border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    icon={Mail01Icon}
                    iconClassName='text-white'
                    type='email'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='bg-red-50 text-red-600 rounded py-1 px-3 w-fit border border-red-100' />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({field}) => (
              <FormItem>
                <FormControl>
                <Textarea
                  {...field}
                  placeholder={config.placeholder}
                  className="min-h-[100px] p-3 bg-inherit rounded-lg border border-gray-300 hover:border-gray-300 focus:border-gray-300 focus:ring-0 focus:outline-none resize-y text-sm lg:text-base text-white placeholder:text-white/70 placeholder:text-xs placeholder:md:text-sm focus-visible:ring-none focus-visible:ring-none focus-visible:ring-offset-0"
                  style={{ minHeight: '100px', maxHeight: '300px' }}
                />
                </FormControl>
                <div className="flex justify-between items-center mt-1">
                  <FormMessage className='bg-red-50 text-red-600 rounded py-1 px-3 w-fit border border-red-100' />
                  <span className="text-xs">
                    {field.value?.length || 0}/2000 characters
                  </span>
                </div>
              </FormItem>
            )}
          />

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2 hidden lg:block">Appeal Type: 
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                appealType === 'suspension' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {appealType === 'suspension' ? 'Suspension Appeal' : 'Deactivation Appeal'}
              </span>
            </p>
            <p className="text-xs text-gray-600">
              {appealType === 'suspension' 
                ? 'Your appeal will be reviewed by the support team. Suspensions are typically reviewed within 3-5 business days.'
                : 'Reactivation requests require additional verification. Please allow 5-7 business days for processing.'
              }
            </p>
          </div>
          
          <LoadingButton
            className={`h-[50px] rounded-lg mt-2 font-medium transition-all ${
              appealType === 'suspension'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            } disabled:opacity-50`}
            label={config.buttonText}
            loadingLabel={`Submitting ${appealType} appeal...`}
            type='submit'
            isLoading={isLoading}
          />
          
          <p className="text-xs text-center md:mt-4 mt-0 mb-2 text-white/70">
            By submitting this appeal, you acknowledge that {appealType === 'suspension' 
              ? 'all suspension decisions are final but subject to appeal review.'
              : 'account reactivation is not guaranteed and depends on policy compliance.'
            }
          </p>
        </form>
      </Form>
    </React.Fragment>
  )
}

export default AppealForm;
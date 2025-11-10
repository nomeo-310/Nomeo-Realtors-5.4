'use client'

import React from 'react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { SquareLock01Icon } from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { setPasswordSchema, SetPasswordValues } from '@/utils/form-validations';
import { zodResolver } from "@hookform/resolvers/zod"
import CustomInput from '../ui/custom-input';
import { LoadingButton } from '../ui/loading-button';
import { CheckIcon, X, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SetPasswordForm = () => {
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const router = useRouter();

  const form = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange', // Validate on every change
    reValidateMode: 'onChange' // Re-validate on every change
  })

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    checkPasswordStrength(password);
    
    // Clear error when field becomes empty
    if (password === '' && form.formState.errors.password) {
      form.clearErrors('password');
    }
    
    form.setValue('password', password, { shouldValidate: true });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    
    // Clear error when field becomes empty
    if (confirmPassword === '' && form.formState.errors.confirmPassword) {
      form.clearErrors('confirmPassword');
    }
    
    form.setValue('confirmPassword', confirmPassword, { shouldValidate: true });
  };

  // Watch form values to clear errors when they become empty
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Clear errors when fields become empty
      if (name === 'password' && value.password === '' && form.formState.errors.password) {
        form.clearErrors('password');
      }
      if (name === 'confirmPassword' && value.confirmPassword === '' && form.formState.errors.confirmPassword) {
        form.clearErrors('confirmPassword');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const submitForm = async (value: SetPasswordValues) => {
    // Double-check validation before submission
    if (!isPasswordStrong) {
      form.setError('password', { 
        type: 'manual', 
        message: 'Please meet all password requirements' 
      });
      return;
    }

    if (value.password !== value.confirmPassword) {
      form.setError('confirmPassword', { 
        type: 'manual', 
        message: 'Passwords do not match' 
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Setting up password:', value);
      // Add your actual API call here
      // await setupPasswordAPI(value);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect or show success message
      router.push('/dashboard');
    } catch (error) {
      console.error('Password setup failed:', error);
      form.setError('root', { 
        type: 'manual', 
        message: 'Failed to set up password. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const fulfilledCount = Object.values(passwordStrength).filter(Boolean).length;
  const totalRequirements = Object.values(passwordStrength).length;

  // Check if form is valid (both password strong and passwords match)
  const isFormValid = isPasswordStrong && 
                     form.watch('password') === form.watch('confirmPassword') && 
                     form.watch('password').length > 0;

  // Get all requirements with their status
  const requirements = [
    { key: 'hasMinLength', label: '8+ chars', fulfilled: passwordStrength.hasMinLength },
    { key: 'hasUpperCase', label: 'A-Z', fulfilled: passwordStrength.hasUpperCase },
    { key: 'hasLowerCase', label: 'a-z', fulfilled: passwordStrength.hasLowerCase },
    { key: 'hasNumber', label: '0-9', fulfilled: passwordStrength.hasNumber },
    { key: 'hasSpecialChar', label: '!@#$', fulfilled: passwordStrength.hasSpecialChar },
  ];

  const getStrengthColor = () => {
    if (isPasswordStrong) return 'text-green-600 bg-green-50';
    if (fulfilledCount >= 3) return 'text-yellow-600 bg-yellow-50';
    if (fulfilledCount >= 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStrengthLabel = () => {
    if (isPasswordStrong) return 'Strong';
    if (fulfilledCount >= 3) return 'Medium';
    if (fulfilledCount >= 1) return 'Weak';
    return 'Very Weak';
  };

  const getProgressColor = () => {
    if (isPasswordStrong) return 'bg-green-500';
    if (fulfilledCount >= 3) return 'bg-yellow-500';
    if (fulfilledCount >= 1) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className='flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[200px]'>
          <div className="flex flex-col gap-3">
            <h2 className='lg:text-4xl text-3xl font-semibold font-quicksand'>Secure Your Account</h2>
            <p className='text-sm lg:text-base'>Create a strong password to protect your administrative access and ensure system security.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Minimum 8 characters with mixed case</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Include numbers and special characters</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm lg:text-base">Avoid common words and patterns</p>
            </div>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form className='flex-1 md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4' autoComplete='off' onSubmit={form.handleSubmit(submitForm)}>
          {/* Root Error Message */}
          {form.formState.errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{form.formState.errors.root.message}</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <CustomInput
                      id='password'
                      inputClassName='placeholder:text-white/70 pr-10'
                      placeholder='Password'
                      className='border rounded-md'
                      icon={SquareLock01Icon}
                      iconClassName='text-white'
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                      onChange={handlePasswordChange}
                      onBlur={() => {
                        // Clear error when field is empty on blur
                        if (field.value === '' && form.formState.errors.password) {
                          form.clearErrors('password');
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                
                {/* Only show FormMessage when there's an error AND the field is not empty */}
                {form.formState.errors.password && form.watch('password') && (
                  <FormMessage className='bg-white rounded py-1 px-3 w-fit mt-2' />
                )}
                
                {/* Password Strength Indicator - Compact Design */}
                {form.watch('password') && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    {/* Progress Header - Compact */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Strength</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor()}`}>
                        {getStrengthLabel()}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor()}`}
                          style={{ width: `${(fulfilledCount / totalRequirements) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {fulfilledCount}/{totalRequirements}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round((fulfilledCount / totalRequirements) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Requirements - Flex Wrap without borders */}
                    <div className="flex flex-wrap gap-2">
                      {requirements.map((requirement) => (
                        <div 
                          key={requirement.key}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 ${
                            requirement.fulfilled 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${
                            requirement.fulfilled ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {requirement.fulfilled ? (
                              <CheckIcon className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </div>
                          <span className="text-xs font-medium whitespace-nowrap">
                            {requirement.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Success Message - Compact */}
                    {isPasswordStrong && (
                      <div className="mt-2 p-2 bg-green-100 rounded-md flex items-center gap-2">
                        <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-xs font-medium text-green-800">All requirements met!</p>
                      </div>
                    )}

                    {/* Tips for Weak Passwords - Compact */}
                    {!isPasswordStrong && fulfilledCount < 3 && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-600">
                          💡 Combine different character types for better security
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({field}) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <CustomInput
                      id='confirmPassword'
                      inputClassName='placeholder:text-white/70 pr-10'
                      placeholder='Confirm password'
                      className='border rounded-md'
                      icon={SquareLock01Icon}
                      iconClassName='text-white'
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...field}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => {
                        // Clear error when field is empty on blur
                        if (field.value === '' && form.formState.errors.confirmPassword) {
                          form.clearErrors('confirmPassword');
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                {/* Only show FormMessage when there's an error AND the field is not empty */}
                {form.formState.errors.confirmPassword && form.watch('confirmPassword') && (
                  <FormMessage className='bg-white rounded py-1 px-3 w-fit' />
                )}
              </FormItem>
            )}
          />

          <LoadingButton
            className={`h-[50px] rounded-lg mt-6 transition-all duration-300 ${
              isFormValid && !isLoading
                ? 'bg-secondary-blue text-white hover:bg-blue-700 shadow-lg cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            label='Setup Password'
            loadingLabel='Setting up password...'
            type='submit'
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
          />

          {/* Additional validation hints */}
          {!isFormValid && form.watch('password') && form.watch('confirmPassword') && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {!isPasswordStrong && 'Complete all password requirements • '}
                {form.watch('password') !== form.watch('confirmPassword') && 'Passwords must match'}
              </p>
            </div>
          )}
        </form>
      </Form>
    </React.Fragment>
  )
};

export default SetPasswordForm
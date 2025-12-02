'use client';

import React from 'react'
import { Cropper, ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, ImageAdd02Icon, Location06Icon, TelephoneIcon, User03Icon, Alert01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import InputWithIcon from '../ui/input-with-icon'
import Image from 'next/image'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { userProfileSchema, userProfileValues } from '@/lib/form-validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadingButton } from '../ui/loading-button'
import { toast } from 'sonner'
import { Textarea } from '../ui/textarea'
import { uploadImage } from '@/utils/upload-image'
import { Loader2 } from 'lucide-react'
import { useUserOnboardingModal } from '@/hooks/general-store'
import { userDetails } from '@/lib/types'
import { cn } from '@/lib/utils'
import { createUserProfile } from '@/actions/user-actions'
import { useBioAnalyzer } from '@/hooks/use-bio-analyzer';

const fieldNames = [
  {
    name: 'Step 1',
    fields: ['surName', 'lastName', 'city', 'state',]
  },
  {
    name: 'Step 2',
    fields: ['phoneNumber', 'additionalPhoneNumber', 'userBio']
  }
];

const UserMultiStepForm = ({user}:{user:userDetails}) => {
  type FieldName = keyof userProfileValues;
  const onboarding = useUserOnboardingModal();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageCropped, setImageCropped] = React.useState<File | null>(null);
  const [imageFile, setImageFile] = React.useState<File>();
  const [imageUrls, setImageUrls] = React.useState({public_id: '', secure_url: ''});
  const [imageUploaded, setImageUploaded] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cropperRef = React.useRef<ReactCropperElement>(null);

  // Bio analyzer for users
  const { analysis, updateAnalysis } = useBioAnalyzer({
    type: 'user',
    minLength: 200,
    targetLength: 400
  });

  const onImageSelection = (image: File | undefined) => {
    if (!image) {
      return;
    }
    setImageFile(image);
  };

  const onClose = () => {
    setImageFile(undefined);
    if (fileInputRef.current?.value) {
      fileInputRef.current.value = "";
    }
  };

  const crop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      return;
    }

    cropper.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = new Uint8Array(reader.result as ArrayBuffer);
          const file = new File([arrayBuffer], 'cropped_image.jpg', { type: 'image/jpeg' });
          setImageCropped(file);
        };
        reader.readAsArrayBuffer(blob);
      }
    },
      "image/jpeg");
    onClose();
  };

  React.useEffect(() => {
    if (imageCropped) {
      handleUploadImage()
    }
  },[imageCropped]);

  const handleUploadImage = async () => {
    if (!imageCropped) {
      return;
    };
    
    const data = {image: imageCropped, uploadPreset: 'profileImages'}
    try {
      setUploadingImage(true);
      const imageData = await uploadImage(data)
      const imageUrls = { public_id: imageData?.public_id, secure_url: imageData?.secure_url };
      setImageUrls(imageUrls);
      toast.success('Profile image succesfully uploaded!');
      setUploadingImage(false);
      setImageUploaded(true);
    } catch (error) {
      setUploadingImage(false);
      setImageCropped(null);
      setImageFile(undefined);
      toast.error('Error while uploading profile image, try again later.')
    }
  };

  const resetField = () => {
    form.reset();
    setCurrentStep(0);
    setImageCropped(null);
    setImageFile(undefined);
    setImageUrls({public_id: '', secure_url: ''});
    setImageUploaded(false);
    form.reset();
  };

  const form = useForm<userProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      surName: '',
      lastName: '',
      city: '',
      state: '',
      phoneNumber: '',
      additionalPhoneNumber: '',
      userBio: '',
    }
  });

  // Bio analysis handler
  const handleBioChange = (value: string) => {
    if (value.length > 10) { // Only analyze after some content
      updateAnalysis(value);
    }
  };

  const previousStep = () => {
    setCurrentStep((current) => current - 1);
  };

  const nextStep = async () => {
    const fields = fieldNames[currentStep].fields;
    const output = await form.trigger(fields as FieldName[], {shouldFocus: true})

    if (!output) {
      return;
    };

    if (output && !imageFile && !imageCropped ) {
      toast.error('Profile image is required!!')
      return;
    };

    if (currentStep < fieldNames.length - 1) {
      if (currentStep === 0 && imageCropped && !imageUploaded) {
        toast.error('Upload your profile image')
        return;
      }
    }

    setCurrentStep((current) => current + 1);
  };

  const onSubmit: (values: userProfileValues) => Promise<void> = async (values) => {
    setIsLoading(true)
    await createUserProfile({ ...values, profileImage: imageUrls, userId: user._id })
    .then((response) => {
      if (response.success && response.status === 201) {
        toast.success(response.message);
        resetField();
        setIsLoading(false);
        onboarding.onClose();
      };

      if (!response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {
      toast.error('Something went wrong!!')
    })
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3 lg:gap-4 w-full" onSubmit={form.handleSubmit(onSubmit)}>
        {currentStep === 0 && (
          <React.Fragment>
            { imageFile ?
              <div className="-mb-10 xl:w-[400px] xl:h-[500px] lg:w-[350] lg:h-[450px] md:w-[400px] md:h-[500px] w-[310px] h-[410px] rounded mx-auto my-auto">
                <Cropper 
                  src={URL.createObjectURL(imageFile)} 
                  aspectRatio={1} 
                  guides={false} 
                  zoomable={false} 
                  ref={cropperRef}
                  className='mx-auto xl:size-[400px] lg:size-[350px] md:size-[450px] size-[350px]'
                />
                <div className="flex items-center justify-end gap-3 mt-4">
                  <Button variant={'secondary'} onClick={onClose} className='rounded' type="button">Cancel</Button>
                  <Button onClick={crop} className='rounded' type="button">Crop</Button>
                </div>
              </div> :
              <React.Fragment>
                <div className="xl:h-[165px] lg:[150px] md:h-[160px] h-auto sm:flex-row flex-col flex xl:gap-4 gap-3 w-full sm:items-center group">
                  <div className="cursor-pointer xl:w-[165px] lg:[150px] md:w-[160px] w-[130px] aspect-square bg-gray-200 flex items-center justify-center rounded-lg mx-auto sm:mx-0 relative" onClick={() => fileInputRef.current?.click()}>
                    <Input type="file" ref={fileInputRef} className="hidden sr-only" onChange={(e) => onImageSelection(e.target.files?.[0])}/>
                    <Image src={ imageCropped ? URL.createObjectURL(imageCropped) : '/images/default_user.png' } alt="avatar" fill priority className='rounded-lg object-cover object-center' />
                    <div className={cn("p-3 text-center text-white text-sm absolute top-0 right-0 w-full h-full bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex justify-center items-center", uploadingImage && "opacity-100")}>
                      { imageCropped && uploadingImage ? 
                        <Loader2 className='animate-spin size-[50px] xl:size-[60px]'/> : 
                        <HugeiconsIcon icon={ImageAdd02Icon} className='size-[50px] xl:size-[60px]'/>
                      }
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col xl:gap-4 gap-3">
                    <FormField
                      control={form.control}
                      name='surName'
                      render={({field}) => (
                        <FormItem>
                          <FormControl>
                            <InputWithIcon
                              className='bg-gray-200 rounded-lg'
                              inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                              icon={User03Icon}
                              placeholder='Enter your surname'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({field}) => (
                        <FormItem>
                          <FormControl>
                            <InputWithIcon
                              className='bg-gray-200 rounded-lg'
                              inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                              icon={User03Icon}
                              placeholder='Enter your last name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex-1 flex xl:gap-4 gap-3 flex-col">
                  <FormField
                      control={form.control}
                      name='city'
                      render={({field}) => (
                        <FormItem>
                          <FormControl>
                            <InputWithIcon
                              className='bg-gray-200 rounded-lg'
                              icon={Location06Icon}
                              inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                              placeholder='Enter city of residence'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  <FormField
                      control={form.control}
                      name='state'
                      render={({field}) => (
                        <FormItem>
                          <FormControl>
                            <InputWithIcon
                              className='bg-gray-200 rounded-lg'
                              icon={Location06Icon}
                              inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                              placeholder='Enter state of residence'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                </div>
              </React.Fragment>
            }
          </React.Fragment>
        )}
        {currentStep === 1 && (
          <div className="flex xl:gap-4 gap-3 flex-col">
            <FormField
              control={form.control}
              name='phoneNumber'
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className='bg-gray-200 rounded-lg'
                      inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                      icon={TelephoneIcon}
                      placeholder='Enter your main phone number'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='additionalPhoneNumber'
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className='bg-gray-200 rounded-lg'
                      inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 '
                      icon={TelephoneIcon}
                      placeholder='Enter an additional phone number'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name='userBio'
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <div className='w-full h-[200px] relative'>
                        <HugeiconsIcon icon={SparklesIcon} className='absolute top-3 left-3'/>
                        <Textarea 
                          className='border-0 h-full resize-none shadow-none bg-gray-200 p-3 pl-10 placeholder:text-black text-base' 
                          placeholder='Describe what you are looking for in a property. Mention your preferences, lifestyle, and needs...' 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleBioChange(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
              
              {/* Bio Analysis Panel */}
              {analysis && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                      <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4" />
                      Bio Analysis
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analysis.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        {analysis.score}/100
                      </span>
                    </div>
                  </div>

                  {analysis.score >= 70 ? (
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" />
                      <span className="text-sm font-medium">Great bio! This will help find the perfect property.</span>
                    </div>
                  ) : analysis.score >= 40 ? (
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                      <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
                      <span className="text-sm font-medium">Good start! Consider these improvements:</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
                      <span className="text-sm font-medium">Your bio needs more detail to help match you with properties:</span>
                    </div>
                  )}

                  {analysis.strengths.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.strengths.map((strength, index) => (
                          <span
                            key={index}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-1">Suggestions:</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.improvedBio && analysis.score < 70 && (
                    <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                      <p className="text-xs font-medium text-blue-700 mb-1">Example improved bio:</p>
                      <p className="text-xs text-gray-600 italic">{analysis.improvedBio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          { currentStep > 0 && <button className="rounded-lg py-3 px-5 bg-black text-white text-sm lg:text-sm" type="button" onClick={previousStep}>Previous</button> }
          { currentStep === 1 ?   
            <LoadingButton isLoading={isLoading} disabled={isLoading} className="rounded-lg py-3 px-5 bg-green-600 text-white text-sm lg:text-sm" type="submit" label='Create Profile' loadingLabel='Creating Profile...'/>
            : <button className="rounded-lg py-3 px-5 bg-black text-white text-sm lg:text-sm" type="button" onClick={nextStep}>Next</button> }
        </div>
      </form>
    </Form>
  )
}

export default UserMultiStepForm
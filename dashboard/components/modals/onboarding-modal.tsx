"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, X, Phone, Image as ImageIcon, User, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AdminDetailsProps } from "@/lib/types";
import Modal from "../ui/modal";
import { useOnboardingModal } from "@/hooks/general-store";
import ScrollableWrapper from "../ui/scrollable-wrapper";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd02Icon, User03Icon, ImageAdd02Icon, TextAlignLeftIcon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { Cropper, ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { uploadImage } from "@/utils/upload-image";
import { usePathname } from "next/navigation";
import { createProfile } from "@/actions/auth-actions";

// Phone number validation regex (adjust based on your requirements)
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

// Define form schemas
const baseAdminSchema = z.object({
  surName: z.string().min(2, "Surname must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phoneNumber: z.string()
    .regex(phoneRegex, "Please enter a valid phone number")
    .optional()
    .or(z.literal('')),
});

const creatorSchema = baseAdminSchema.extend({
  bio: z.string()
    .min(50, "Bio must be at least 50 characters")
    .max(1000, "Bio must be less than 1000 characters")
    .optional()
    .or(z.literal('')),
});

type BaseAdminFormData = z.infer<typeof baseAdminSchema>;
type CreatorFormData = z.infer<typeof creatorSchema>;

const OnboardingModal = ({ user }: { user: AdminDetailsProps }) => {
  const { isOpen, onClose, onOpen } = useOnboardingModal();
  const queryClient = useQueryClient();
  
  const [showSkipWarning, setShowSkipWarning] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageCropped, setImageCropped] = React.useState<File | null>(null);
  const [imageFile, setImageFile] = React.useState<File>();
  const [imageUrls, setImageUrls] = React.useState({ 
    public_id: user?.userId.profileImage?.public_id || '', 
    secure_url: user?.userId.profileImage?.secure_url || '' 
  });
  const [hasExistingImage, setHasExistingImage] = React.useState(
    !!user?.userId.profileImage?.secure_url
  );
  const [imageUploaded, setImageUploaded] = React.useState(
    !!user?.userId.profileImage?.secure_url
  );
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cropperRef = React.useRef<ReactCropperElement>(null);
  
  const userRole = user?.role?.toLowerCase() || 'admin';
  const isCreator = userRole === 'creator';
  const totalSteps = isCreator ? 3 : 2; // Bio step only for creators
  
  // Determine which schema to use
  const schema = isCreator ? creatorSchema : baseAdminSchema;
  const path = usePathname();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch, 
    trigger,
    reset
  } = useForm<BaseAdminFormData & { bio?: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      surName: user?.userId?.surName || '',
      lastName: user?.userId?.lastName || '',
      username: user?.userId?.username || '',
      phoneNumber: user?.userId?.phoneNumber || '',
      bio: user?.userId?.bio || ''
    },
    mode: "onChange"
  });

  // Get watched values
  const watchedValues = watch();
  
  // Auto-open modal if admin needs onboarding
  React.useEffect(() => {
    if (user && !user.adminOnboarded) {
      onOpen();
    }
  }, [user, onOpen]);

  // Auto-generate username from email if not provided
  React.useEffect(() => {
    if (user?.userId?.email && !user?.userId?.username && !watchedValues.username) {
      const usernameFromEmail = user.userId.email.split('@')[0];
      setValue('username', usernameFromEmail, { shouldValidate: true });
    }
  }, [user, setValue, watchedValues.username]);

  // Image handling functions
  const onImageSelection = (image: File | undefined) => {
    if (!image) {
      return;
    }
    setImageFile(image);
  };

  const onCloseCrop = () => {
    setImageFile(undefined);
    if (fileInputRef.current?.value) {
      fileInputRef.current.value = "";
    }
  };

  const cropImage = () => {
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
    }, "image/jpeg");
    onCloseCrop();
  };

  React.useEffect(() => {
    if (imageCropped) {
      handleUploadImage();
    }
  }, [imageCropped]);

  const handleUploadImage = async () => {
    if (!imageCropped) {
      return;
    };

    const data = { image: imageCropped, uploadPreset: 'profileImages' }
    try {
      setUploadingImage(true);
      const imageData = await uploadImage(data);
      const imageUrls = { public_id: imageData?.public_id, secure_url: imageData?.secure_url };
      setImageUrls(imageUrls);
      toast.success('Profile image successfully uploaded!');
      setUploadingImage(false);
      setImageUploaded(true);
      setHasExistingImage(true);
    } catch (error) {
      setUploadingImage(false);
      setImageCropped(null);
      setImageFile(undefined);
      toast.error('Error while uploading profile image, try again later.');
    }
  };

  const removeImage = () => {
    setImageUrls({ public_id: "", secure_url: "" });
    setImageUploaded(false);
    setHasExistingImage(false);
    setImageCropped(null);
    setImageFile(undefined);
    toast.info("Profile image removed. Please upload a new one.");
  };

  const handleNextStep = async () => {
    const isValid = await trigger();
    
    // For step 1 (basic info), validate form
    if (currentStep === 1) {
      if (!isValid) {
        return;
      }
    }
    
    // For step 2 (profile image), check if image is uploaded
    if (currentStep === 2 && !imageUploaded && !hasExistingImage) {
      toast.error('Profile image is required!');
      return;
    }

    // For creators going from step 2 to 3, no additional validation needed
    // For non-creators at step 2, handleFormSubmit will be called directly
    if (currentStep === 2 && !isCreator) {
      // For non-creators, submit form directly from step 2
      await handleSubmit(handleFormSubmit)();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFormSubmit = async (data: BaseAdminFormData & { bio?: string }) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        surName: data.surName, 
        lastName: data.lastName, 
        username: data.username,
        phoneNumber: data.phoneNumber,
        profileImage: imageUploaded || hasExistingImage ? imageUrls : { public_id: '', secure_url: '' },
        bio: isCreator ? data.bio : undefined, // Only include bio for creators
        adminId: user._id,
        path
      };
      
      const response = await createProfile(submitData);
      
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['admin', user._id] });
        queryClient.invalidateQueries({ queryKey: ['admins'] });
      } else {
        toast.error(response.message);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error onboarding admin:', error);
      toast.error('Failed to onboard admin. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setCurrentStep(1);
    setShowSkipWarning(false);
    setImageCropped(null);
    setImageFile(undefined);
    setImageUrls({ 
      public_id: user?.userId.profileImage?.public_id || '', 
      secure_url: user?.userId.profileImage?.secure_url || '' 
    });
    setImageUploaded(!!user?.userId.profileImage?.secure_url);
    setHasExistingImage(!!user?.userId.profileImage?.secure_url);
    reset();
  };

  const handleClose = () => {
    // Check if form has any data entered
    const hasData = watchedValues.surName || watchedValues.lastName || 
                    watchedValues.username || watchedValues.bio || 
                    watchedValues.phoneNumber || imageUploaded;
    
    if (hasData) {
      // Show warning if there's unsaved data
      setShowSkipWarning(true);
    } else {
      // Close immediately if no data entered
      onClose();
      resetForm();
    }
  };

  const handleSkipAnyway = () => {
    toast.warning('Onboarding skipped. You can complete it later from your profile.');
    onClose();
    resetForm();
  };

  const handleContinueEditing = () => {
    setShowSkipWarning(false);
  };

  const handleSaveProgress = () => {
    // In a real implementation, you would save the form data to localStorage or backend
    // For now, we'll just show a message
    toast.info('Progress saved. You can continue later from your profile settings.');
    onClose();
    resetForm();
  };

  // Step 1: Basic Information (All admins)
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Step Header with Icon */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-blue-100 rounded-lg flex-shrink-0">
          <HugeiconsIcon icon={User03Icon} className="w-6 h-6 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          <p className="text-sm text-gray-500">
            Provide the admin's basic details. These will be used for identification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Surname */}
        <div className="space-y-2">
          <Label htmlFor="surName" className="text-sm font-medium">
            First Name / Surname <span className="text-red-500">*</span>
          </Label>
          <Input
            id="surName"
            placeholder="Enter surname or first name"
            {...register("surName")}
            className={errors.surName ? 'border-red-500 text-sm' : ' text-sm'}
          />
          {errors.surName && (
            <p className="text-sm text-red-500">{errors.surName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            {...register("lastName")}
            className={errors.lastName ? 'border-red-500 text-sm' : ' text-sm'}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          Username <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="username"
            placeholder="Enter username"
            {...register("username")}
            className={`pl-8 ${errors.username ? 'border-red-500 text-sm' : ' text-sm'}`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            @
          </div>
        </div>
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
        <p className="text-xs text-gray-500">
          This will be used for login and profile identification
        </p>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="text-sm font-medium">
          Phone Number <span className="text-gray-500 text-xs">(Optional but recommended)</span>
        </Label>
        <div className="relative">
          <Input
            id="phoneNumber"
            placeholder="+2348123456789"
            {...register("phoneNumber")}
            className={`pl-10 ${errors.phoneNumber ? 'border-red-500 text-sm' : ' text-sm'}`}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Phone className="w-4 h-4" />
          </div>
        </div>
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Used for emergency contact and two-factor authentication
        </p>
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          value={user?.userId?.email || ''}
          readOnly
          className="bg-gray-50 cursor-not-allowed text-sm"
        />
        <p className="text-xs text-gray-500">
          Email address cannot be changed during onboarding
        </p>
      </div>

      {/* Role Display */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Role</Label>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            userRole === 'superadmin' ? 'bg-purple-100 text-purple-800' :
            userRole === 'admin' ? 'bg-blue-100 text-blue-800' :
            userRole === 'creator' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
          {isCreator && (
            <span className="text-sm text-gray-600">
              (Content Creator - Bio required in next step)
            </span>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
          className="border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Button>
        
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreator ? "Next: Profile Image" : "Next: Add Profile Image"}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );

  // Step 2: Profile Image (All admins)
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Step Header with Icon */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-blue-100 rounded-lg flex-shrink-0">
          <HugeiconsIcon icon={ImageAdd02Icon} className="w-6 h-6 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Profile Image</h3>
          <p className="text-sm text-gray-500">
            Add a profile picture for identification in the admin dashboard.
          </p>
        </div>
      </div>

      {/* Image Upload Section */}
      {imageFile ? (
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4">
            <Cropper
              src={URL.createObjectURL(imageFile)}
              aspectRatio={1}
              guides={false}
              zoomable={false}
              ref={cropperRef}
              className='w-full h-64 md:h-80 rounded-lg'
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onCloseCrop} 
              className="border-gray-300 hover:bg-gray-50" 
              type="button"
              disabled={uploadingImage}
            >
              Cancel
            </Button>
            <Button 
              onClick={cropImage} 
              className="bg-blue-600 hover:bg-blue-700" 
              type="button"
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Crop & Upload'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          {/* Image Preview/Upload Area */}
          <div className="relative group">
            <div 
              className="cursor-pointer w-48 h-48 bg-gray-100 flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden sr-only" 
                onChange={(e) => onImageSelection(e.target.files?.[0])} 
                accept="image/*"
              />
              
              {imageUrls.secure_url ? (
                <Image 
                  src={imageUrls.secure_url} 
                  alt="Profile preview" 
                  fill 
                  priority 
                  className='rounded-full object-cover object-center'
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm">Click to upload</span>
                </div>
              )}
              
              <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                uploadingImage ? 'opacity-100' : ''
              }`}>
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            {/* Current tag and remove button */}
            {hasExistingImage && (
              <div className="absolute -top-2 -right-2 flex flex-col items-end gap-1">
                <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap shadow-sm">
                  Current
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold shadow-sm"
                  aria-label="Remove profile image"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Upload Instructions */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {imageUploaded || hasExistingImage 
                ? "Profile image uploaded successfully!"
                : "Upload a clear photo of yourself"
              }
            </p>
            <p className="text-xs text-gray-500">
              Recommended: Square image, at least 400x400 pixels, JPG or PNG format
            </p>
            
            {(imageUploaded || hasExistingImage) && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg inline-block">
                <p className="text-xs text-green-700 font-medium">
                  ✓ Image ready for onboarding
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between pt-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={isSubmitting || uploadingImage}
            className="w-1/2 md:w-fit"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Basic Info
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || uploadingImage}
            className="border-gray-300 hover:bg-gray-50 w-1/2 md:w-fit"
          >
            Cancel
          </Button>
        </div>
        
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={(!imageUploaded && !hasExistingImage) || isSubmitting || uploadingImage}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isCreator ? "Next: Add Bio" : "Complete Onboarding"}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );

  // Step 3: Bio Information (Creators only)
  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Step Header with Icon */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-blue-100 rounded-lg flex-shrink-0">
          <HugeiconsIcon icon={TextAlignLeftIcon} className="w-6 h-6 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Content Creator Bio</h3>
          <p className="text-sm text-gray-500">
            As a content creator, your bio helps users understand your expertise and style.
          </p>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          Professional Bio <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-gray-500 font-normal">
            (50-1000 characters)
          </span>
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself, your expertise, and what kind of content you create..."
          rows={6}
          {...register("bio")}
          className={`resize-none text-sm ${errors.bio ? 'border-red-500' : ''}`}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio.message}</p>
          )}
          <p className="text-xs text-gray-500">
            {watchedValues.bio?.length || 0}/1000 characters
          </p>
        </div>
        
        {/* Bio Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Tips for a great bio:</h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Mention your areas of expertise</li>
            <li>Include your content style or niche</li>
            <li>Share your experience or background</li>
            <li>Keep it professional but engaging</li>
            <li>Minimum 50 characters recommended</li>
          </ul>
        </div>
      </div>

      {/* Profile Image Preview (if uploaded) */}
      {(imageUploaded || hasExistingImage) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Profile Preview</h4>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 relative rounded-full overflow-hidden border-2 border-blue-500">
              <Image
                src={imageUrls.secure_url}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {watchedValues.surName} {watchedValues.lastName}
              </p>
              <p className="text-xs text-gray-600">@{watchedValues.username}</p>
              <p className="text-xs text-green-600 mt-1">✓ Profile image uploaded</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex justify-between pt-4">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile Image
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
        
        <Button
          type="button"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Onboarding...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Complete Onboarding
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Progress Indicator
  const renderProgressIndicator = () => {
    const stepLabels = isCreator 
      ? ['Basic Info', 'Profile Image', 'Bio']
      : ['Basic Info', 'Profile Image'];
    
    // Icons for each step in the progress indicator
    const stepIcons = [
      { icon: User03Icon, color: 'text-blue-600' },
      { icon: ImageAdd02Icon, color: 'text-blue-600' },
      ...(isCreator ? [{ icon: TextAlignLeftIcon, color: 'text-blue-600' }] : [])
    ];
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-none ${
                  index + 1 === currentStep
                    ? 'bg-blue-600 text-white'
                    : index + 1 < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1 < currentStep ? (
                    '✓'
                  ) : (
                    <HugeiconsIcon 
                      icon={stepIcons[index]?.icon || User03Icon} 
                      className={`w-4 h-4 ${index + 1 === currentStep ? 'text-white' : stepIcons[index]?.color || 'text-gray-500'}`} 
                    />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index + 1 === currentStep ? 'text-blue-600' : 
                  index + 1 < currentStep ? 'text-green-600' : 
                  'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
              
              {index < totalSteps - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Skip Warning Modal
  const renderSkipWarning = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
          </div>
          <button
            onClick={handleContinueEditing}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              You have unsaved changes. Are you sure you want to skip onboarding?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You can complete onboarding later from your profile settings.
            </p>
          </div>
          
          <div className="flex gap-3 justify-end pt-4 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleContinueEditing}
              className="border-gray-300 text-sm"
            >
              Continue <span className="hidden sm:block">Editing</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveProgress}
              className="border-blue-300 text-blue-600 hover:bg-blue-50 text-sm"
            >
              Save & Continue <span className="hidden sm:block">Later</span>
            </Button>
            <Button
              type="button"
              onClick={handleSkipAnyway}
              className="bg-amber-600 hover:bg-amber-700 text-sm"
            >
              Skip <span className="hidden sm:block">Anyway</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        // Only show bio step for creators
        return isCreator ? renderStep3() : renderStep2();
      default:
        return renderStep1();
    }
  };

  return (
    <>
      <Modal
        title=''
        isOpen={isOpen}
        onClose={handleClose}
        useCloseButton={false}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        width="lg:w-[650px] xl:w-[700px] md:w-[550px]"
      >
        <ScrollableWrapper>
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-lg flex-shrink-0">
                    <HugeiconsIcon icon={UserAdd02Icon} className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Welcome! Complete Your Profile
                    </h2>
                    <p className="text-sm text-gray-500">
                      {isCreator 
                        ? "Set up your creator profile to start sharing content"
                        : "Complete your profile to access all admin features"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {renderProgressIndicator()}

            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Summary (for review) */}
            {currentStep === totalSteps && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserPlus className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">Profile Summary</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {watchedValues.surName} {watchedValues.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">@{watchedValues.username}</span>
                  </div>
                  {watchedValues.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{watchedValues.phoneNumber}</span>
                    </div>
                  )}
                  {isCreator && watchedValues.bio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bio Length:</span>
                      <span className="font-medium">{watchedValues.bio.length} characters</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Image:</span>
                    <span className={`font-medium ${(imageUploaded || hasExistingImage) ? 'text-green-600' : 'text-gray-600'}`}>
                      {(imageUploaded || hasExistingImage) ? 'Uploaded ✓' : 'Not uploaded'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollableWrapper>
      </Modal>
      
      {/* Skip Warning Overlay */}
      {showSkipWarning && renderSkipWarning()}
    </>
  );
};

export default OnboardingModal;
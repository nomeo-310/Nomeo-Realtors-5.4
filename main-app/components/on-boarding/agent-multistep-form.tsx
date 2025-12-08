'use client';

import React from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, PlazaIcon, Coffee02Icon, ImageAdd02Icon, Location06Icon, MapsIcon, TelephoneIcon, User03Icon, Alert01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import InputWithIcon from "../ui/input-with-icon";
import Image from "next/image";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { agentProfileSchema, agentProfileValues } from "@/lib/form-validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "../ui/loading-button";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { uploadImage } from "@/utils/upload-image";
import { Loader2 } from "lucide-react";
import { useAgentOnboardingModal } from "@/hooks/general-store";
import { userDetails } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createAgentProfile } from "@/actions/user-actions";
import { useBioAnalyzer } from "@/hooks/use-bio-analyzer";

const fieldNames = [
  {
    name: "Personal Info",
    fields: [
      "surName",
      "lastName",
      "phoneNumber",
      "additionalPhoneNumber",
      "officeNumber",
    ],
    icon: User03Icon
  },
  {
    name: "Agency Details",
    fields: [
      "city",
      "state",
      "agencyName",
      "agencyAddress",
      "inspectionFeePerHour",
    ],
    icon: PlazaIcon
  },
  {
    name: "Professional Bio",
    fields: ["agentBio"],
    icon: SparklesIcon
  },
];

const AgentMultiStepForm = ({ user }: { user: userDetails }) => {

  type FieldName = keyof agentProfileValues;
  const onboarding = useAgentOnboardingModal();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageCropped, setImageCropped] = React.useState<File | null>(null);
  const [imageFile, setImageFile] = React.useState<File>();
  const [imageUrls, setImageUrls] = React.useState({
    public_id: user.profileImage?.public_id || "",
    secure_url: user.profileImage?.secure_url || "",
  });
  const [hasExistingImage, setHasExistingImage] = React.useState(
    !!user.profileImage?.secure_url
  );
  const [imageUploaded, setImageUploaded] = React.useState(
    !!user.profileImage?.secure_url
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cropperRef = React.useRef<ReactCropperElement>(null);

  // Bio analyzer for agents
  const { analysis, updateAnalysis } = useBioAnalyzer({
    type: 'agent',
    minLength: 200,
    targetLength: 1000
  });

  const totalSteps = fieldNames.length;

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
          const file = new File([arrayBuffer], "cropped_image.jpg", {
            type: "image/jpeg",
          });
          setImageCropped(file);
        };
        reader.readAsArrayBuffer(blob);
      }
    }, "image/jpeg");
    onClose();
  };

  React.useEffect(() => {
    if (imageCropped) {
      handleUploadImage();
    }
  }, [imageCropped]);

  const handleUploadImage = async () => {
    if (!imageCropped) {
      return;
    }

    const data = { image: imageCropped, uploadPreset: "profileImages" };
    try {
      setUploadingImage(true);
      const imageData = await uploadImage(data);
      const imageUrls = {
        public_id: imageData?.public_id,
        secure_url: imageData?.secure_url,
      };
      setImageUrls(imageUrls);
      toast.success("Profile image successfully uploaded!");
      setUploadingImage(false);
      setImageUploaded(true);
      setHasExistingImage(true);
    } catch (error) {
      setUploadingImage(false);
      setImageCropped(null);
      setImageFile(undefined);
      toast.error("Error while uploading profile image, try again later.");
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

  const resetField = () => {
    form.reset();
    setCurrentStep(0);
    setImageCropped(null);
    setImageFile(undefined);
    setImageUrls({ public_id: "", secure_url: "" });
    setImageUploaded(false);
    setHasExistingImage(false);
    form.reset();
  };

  const form = useForm({
    resolver: zodResolver(agentProfileSchema),
    defaultValues: {
      surName: user.surName,
      lastName: user.lastName,
      city: user.city,
      state: user.state,
      phoneNumber: user.phoneNumber,
      additionalPhoneNumber: user.additionalPhoneNumber,
      agencyAddress: user?.agentId?.officeAddress,
      agencyName: user?.agentId?.agencyName,
      officeNumber: user?.agentId?.officeNumber,
      inspectionFeePerHour: user?.agentId?.inspectionFeePerHour,
      agentBio: user?.bio,
    },
  });

  // Bio analysis handler
  const handleBioChange = (value: string) => {
    if (value.length > 10) {
      updateAnalysis(value);
    }
  };

  const previousStep = () => {
    setCurrentStep((current) => current - 1);
  };

  const nextStep = async () => {
    const fields = fieldNames[currentStep].fields;
    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!output) {
      return;
    }

    // Allow users to proceed if they have an existing image OR have uploaded a new one
    if (!imageUploaded && !imageCropped && !hasExistingImage) {
      toast.error("Profile image is required!");
      return;
    }

    // If user uploaded a new image but hasn't completed upload
    if (currentStep === 0 && imageCropped && !imageUploaded && !hasExistingImage) {
      toast.error("Upload your profile image");
      return;
    }

    setCurrentStep((current) => current + 1);
  };

  const onSubmit: (values: agentProfileValues) => Promise<void> = async (
    values
  ) => {
    setIsLoading(true);
    
    // Prepare image data - ensure it's not undefined
    const profileImageData = (imageUploaded || hasExistingImage) ? imageUrls : {
      public_id: user.profileImage?.public_id || "",
      secure_url: user.profileImage?.secure_url || "/images/default_user.png"
    };
    
    await createAgentProfile({
      ...values,
      profileImage: profileImageData,
      userId: user._id,
    })
      .then((response) => {
        if (response.success && response.status === 201) {
          toast.success(response.message);
          resetField();
          setIsLoading(false);
          onboarding.onClose();
        }

        if (!response.success) {
          toast.error(response.message);
        }
      })
      .catch((error) => {
        toast.error("Something went wrong!!");
      });
  };

  // Progress Indicator
  const renderProgressIndicator = () => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {fieldNames.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                  index === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index === currentStep ? 'text-blue-600' :
                    index < currentStep ? 'text-green-600' :
                      'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>

              {index < totalSteps - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Step Header
  const renderStepHeader = () => {
    const currentStepInfo = fieldNames[currentStep];
    const stepTitles = [
      "Personal Information & Profile",
      "Agency Details",
      "Professional Bio"
    ];
    const stepDescriptions = [
      "Start by adding your personal details and profile picture",
      "Tell us about your agency and services",
      "Create a compelling bio to attract clients"
    ];

    return (
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <HugeiconsIcon icon={currentStepInfo.icon} className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {stepTitles[currentStep]}
            </h2>
            <p className="text-sm text-gray-500">
              {stepDescriptions[currentStep]}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3 lg:gap-4 w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Step Header */}
        {renderStepHeader()}

        {/* Progress Indicator */}
        {renderProgressIndicator()}

        {currentStep === 0 && (
          <React.Fragment>
            {imageFile ? (
              <div className="-mb-10 xl:w-[400px] xl:h-[500px] lg:w-[350] lg:h-[450px] md:w-[400px] md:h-[500px] w-[310px] h-[410px] rounded mx-auto my-auto">
                <Cropper
                  src={URL.createObjectURL(imageFile)}
                  aspectRatio={1}
                  guides={false}
                  zoomable={false}
                  ref={cropperRef}
                  className="mx-auto xl:size-[400px] lg:size-[350px] md:size-[450px] size-[350px]"
                />
                <div className="flex items-center justify-end gap-3 mt-4">
                  <Button
                    variant={"outline"}
                    onClick={onClose}
                    className="rounded border-gray-300 hover:bg-gray-50"
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={crop} 
                    className="rounded bg-blue-600 hover:bg-blue-700" 
                    type="button"
                  >
                    Crop Image
                  </Button>
                </div>
              </div>
            ) : (
              <React.Fragment>
                <div className="xl:h-[165px] lg:[150px] md:h-[160px] h-auto sm:flex-row flex-col flex xl:gap-4 gap-3 w-full sm:items-center group">
                  <div className="relative group">
                    <div
                      className="cursor-pointer xl:w-[165px] lg:[150px] md:w-[160px] w-[130px] aspect-square bg-gray-200 flex items-center justify-center rounded-lg mx-auto sm:mx-0 relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden sr-only"
                        onChange={(e) => onImageSelection(e.target.files?.[0])}
                        accept="image/*"
                      />
                      <Image
                        src={
                          imageCropped
                            ? URL.createObjectURL(imageCropped)
                            : imageUrls.secure_url || "/images/default_user.png"
                        }
                        alt="avatar"
                        fill
                        priority
                        className="rounded-lg object-cover object-center"
                      />
                      <div
                        className={cn(
                          "p-3 text-center text-white text-sm absolute top-0 right-0 w-full h-full bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex justify-center items-center",
                          uploadingImage && "opacity-100",
                          hasExistingImage && "opacity-100 bg-black/20"
                        )}
                      >
                        {uploadingImage ? (
                          <Loader2 className="animate-spin size-[50px] xl:size-[60px]" />
                        ) : hasExistingImage ? (
                          <div className="text-center">
                            <HugeiconsIcon
                              icon={ImageAdd02Icon}
                              className="size-[50px] xl:size-[60px] mb-2 mx-auto"
                            />
                            <p className="text-xs">Click to change image</p>
                          </div>
                        ) : (
                          <HugeiconsIcon
                            icon={ImageAdd02Icon}
                            className="size-[50px] xl:size-[60px]"
                          />
                        )}
                      </div>
                      {/* Indicators container - positioned at top-right corner */}
                      <div className="absolute -top-2 -right-2 flex flex-col items-end gap-1">
                        {/* Current tag */}
                        {hasExistingImage && (
                          <div className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap shadow-sm">
                            Current
                          </div>
                        )}
                        
                        {/* Remove button */}
                        {(hasExistingImage || imageUploaded) && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold shadow-sm"
                            aria-label="Remove profile image"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col xl:gap-4 gap-3">
                    <FormField
                      control={form.control}
                      name="surName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputWithIcon
                              className="bg-gray-200 rounded-lg"
                              inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                              icon={User03Icon}
                              placeholder="Enter your surname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InputWithIcon
                              className="bg-gray-200 rounded-lg"
                              inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                              icon={User03Icon}
                              placeholder="Enter your last name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex-1 flex xl:gap-4 gap-3 flex-col">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputWithIcon
                            className="bg-gray-200 rounded-lg"
                            inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                            icon={TelephoneIcon}
                            placeholder="Enter your main phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalPhoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputWithIcon
                            className="bg-gray-200 rounded-lg"
                            inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                            icon={TelephoneIcon}
                            placeholder="Enter an additional phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="officeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputWithIcon
                            className="bg-gray-200 rounded-lg"
                            inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                            icon={TelephoneIcon}
                            placeholder="Enter your office phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        {currentStep === 1 && (
          <div className="w-full flex flex-col gap-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-gray-200 rounded-lg"
                      icon={Location06Icon}
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                      placeholder="Enter city of residence"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-gray-200 rounded-lg"
                      icon={Location06Icon}
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                      placeholder="Enter state of residence"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agencyName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-gray-200 rounded-lg"
                      icon={PlazaIcon}
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                      placeholder="Enter name of your agency"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agencyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-gray-200 rounded-lg"
                      icon={MapsIcon}
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                      placeholder="Enter address of your agency"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inspectionFeePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-gray-200 rounded-lg"
                      icon={Coffee02Icon}
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70 "
                      placeholder="How much do you charge per hour for inspection?"
                      name={field.name}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={(field.value as string) || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="agentBio"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="w-full h-[250px] relative">
                      <HugeiconsIcon
                        icon={SparklesIcon}
                        className="absolute top-3 left-3"
                      />
                      <Textarea
                        className="border-0 h-full resize-none shadow-none bg-gray-200 p-3 pl-10 placeholder:text-black text-base"
                        placeholder="Give a description of yourself to your future clients. Mention your experience, services, and expertise..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleBioChange(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
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
                    <span className="text-sm font-medium">Great bio! This looks professional.</span>
                  </div>
                ) : analysis.score >= 40 ? (
                  <div className="flex items-center gap-2 text-yellow-600 mb-2">
                    <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
                    <span className="text-sm font-medium">Good start! Consider these improvements:</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
                    <span className="text-sm font-medium">Your bio needs more detail to attract clients:</span>
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
        )}

        {/* Profile Summary (for review) */}
        {currentStep === totalSteps - 1 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Agent Profile Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Agent Name:</span>
                <span className="font-medium">
                  {form.watch('surName')} {form.watch('lastName')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Agency:</span>
                <span className="font-medium">{form.watch('agencyName')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">
                  {form.watch('city')}, {form.watch('state')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="font-medium">{form.watch('phoneNumber')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inspection Fee:</span>
                <span className="font-medium">
                  ₦{String(form.watch('inspectionFeePerHour') || '0')}/hour
                </span>
              </div>
              {form.watch('agentBio') && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bio Length:</span>
                  <span className="font-medium">{form.watch('agentBio')?.length || 0} characters</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Picture:</span>
                <span className={`font-medium ${imageUploaded || hasExistingImage ? 'text-green-600' : 'text-amber-600'}`}>
                  {(imageUploaded || hasExistingImage) ? 'Uploaded ✓' : 'Required'}
                </span>
              </div>
              {/* Show preview of profile image */}
              {(imageUploaded || hasExistingImage) && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Preview:</span>
                  <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-green-500">
                    <Image
                      src={imageUrls.secure_url || user.profileImage?.secure_url || ""}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation */}
        <div className="mt-3 flex items-center justify-between">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={isLoading}
              className="rounded-lg py-3 px-5 border-gray-300 hover:bg-gray-50"
            >
              Previous
            </Button>
          )}
          {currentStep === totalSteps - 1 ? (
            <LoadingButton
              isLoading={isLoading}
              disabled={isLoading || (!imageUploaded && !hasExistingImage)}
              className="rounded-lg py-3 px-5 bg-green-600 hover:bg-green-700 text-white text-sm lg:text-sm"
              type="submit"
              label="Complete Agent Profile"
              loadingLabel="Creating Profile..."
            />
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-lg py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm lg:text-sm"
            >
              Next Step
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AgentMultiStepForm;
"use client";

import { location } from "@/assets/constants/locations";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/ui/custom-select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AtIcon, Bathtub01Icon, BedIcon, Cancel01Icon, CenterFocusIcon, CreditCardIcon, DashboardSquare01Icon, ImageAdd01Icon, Location06Icon, PlusSignIcon, StarIcon, Toilet01Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from "@/components/ui/input-with-icon";
import { Textarea } from "@/components/ui/textarea";
import { addApartmentSchema, addApartmentValues } from "@/lib/form-validations";
import { cn, nairaSign } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { createProperty } from "@/actions/property-actions";
import { deleteCloudinaryImages } from "@/actions/delete-cloudinary-image";
import { HugeiconsIcon } from "@hugeicons/react";

type imageProps = {
  public_id: string;
  secure_url: string;
};

type feesProps = {
  name: string;
  amount: number;
};

type landmarkProps = {
  name: string;
  distanceAway: string;
};

export interface IAddApartmentClient extends addApartmentValues {
  uploadedImages: imageProps[];
  mainAmenities: string[];
  optionalAmenities: string[];
  mainFees: feesProps[];
  optionalFees: feesProps[];
  closestLandmarks: landmarkProps[];
}

const AddApartmentClient = () => {
  const defaultValues = {
    propertyTag: "",
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    monthlyRent: undefined,
    propertyPrice: undefined,
    annualRent: undefined,
    bedrooms: "",
    bathrooms: "",
    toilets: "",
    squareFootage: "",
    facilityStatus: "",
  };

  const form = useForm({
    resolver: zodResolver(addApartmentSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: defaultValues,
  });

  const maxAmenities = 6;

  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const watchedState = form.watch("state");
  const watchedPropertyTag = form.watch("propertyTag");
  const watchedAnnualRent = form.watch("annualRent");
  const watchedMonthlyRent = form.watch("monthlyRent");
  const watchedPropertyPrice = form.watch("propertyPrice");

  const states = location.map((item) => item.state);
  const lgas = location.find((item) => item.state === watchedState);
  const lga = lgas ? lgas.lgas : [];

  const [uploadedImages, setUploadedImages] = React.useState<imageProps[]>([]);

  const [mainAmenity, setMainAmenity] = React.useState("");
  const [mainAmenities, setMainAmenities] = React.useState<string[]>([]);

  const [optionalAmenity, setOptionalAmenity] = React.useState("");
  const [optionalAmenities, setOptionalAmenities] = React.useState<string[]>(
    []
  );

  const [mainFeeName, setMainFeeName] = React.useState("");
  const [mainFeeAmount, setMainFeeAmount] = React.useState(0);
  const [mainFees, setMainFees] = React.useState<feesProps[]>([]);

  const [optionalFeeName, setOptionalFeeName] = React.useState("");
  const [optionalFeeAmount, setOptionalFeeAmount] = React.useState(0);
  const [optionalFees, setOptionalFees] = React.useState<feesProps[]>([]);

  const [landmarkName, setLandmarkName] = React.useState("");
  const [distanceAway, setDistanceAway] = React.useState("");
  const [closestLandmarks, setClosestLandmarks] = React.useState<
    landmarkProps[]
  >([]);

  const uploadOptions = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
    multiple: true,
    maxFiles: 16,
    uploadPreset: "apartmentImages",
  };

  const handleUploadPropertyImages = (result: { info?: any }) => {
    const images = Array.isArray(result.info) ? result.info : [result.info];

    const newImage = images.map((image) => ({
      public_id: image.public_id as string,
      secure_url: image.secure_url as string,
    }));
    setUploadedImages((prevImages) => [...prevImages, ...newImage]);
  };

  //delete single images
  const handleDeleteImages = async (publicId: string) => {
    try {
      deleteCloudinaryImages(publicId);
      const newImages = uploadedImages.filter(
        (item) => item.public_id !== publicId
      );
      setUploadedImages(newImages);
    } catch (error) {
      return;
    }
  };

  //reorder the uploaded images
  const reorderImages = (
    array: imageProps[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(array);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Drag start handler
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  // Drag over handler
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Drop handler
  const onDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    const newImages = reorderImages(uploadedImages, dragIndex, dropIndex);
    setUploadedImages(newImages);
  };

  //container for each images
  const ImageHolder = ({
    public_id,
    secure_url,
    index,
  }: {
    public_id: string;
    secure_url: string;
    index: number;
  }) => {
    return (
      <div
        className="rounded-lg bg-gray-200 overflow-hidden relative cursor-pointer group"
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      >
        <Image
          src={secure_url}
          priority
          alt={`preview-image_${index}`}
          className="aspect-square object-center size-fit object-cover text-sm bg-black/40"
          width={500}
          height={600}
        />
        <div className="bg-black/40 absolute left-0 top-0 w-full h-full z-10 text-white flex flex-col items-end justify-end p-2 opacity-0 group-hover:opacity-100">
          <div className="flex justify-between w-full">
            <HugeiconsIcon icon={StarIcon}
              className={cn(
                "",
                index === 0 && "fill-yellow-400 text-yellow-400"
              )}
            />
            <button type="button" onClick={() => handleDeleteImages(public_id)}>
              <HugeiconsIcon icon={Cancel01Icon} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const createMainAmenities = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      if (mainAmenities.length < maxAmenities) {
        if (!mainAmenities.includes(mainAmenity) && mainAmenity.length > 0) {
          setMainAmenities([...mainAmenities, mainAmenity]);
        }
        setMainAmenity("");
      } else {
        toast.error(
          "You have gotten to maximum number of amenities, to add more remove some"
        );
        return;
      }
    }
  };

  const createOptionalAmenities = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      if (optionalAmenities.length < maxAmenities) {
        if (
          !optionalAmenities.includes(optionalAmenity) &&
          optionalAmenity.length > 0
        ) {
          setOptionalAmenities([...optionalAmenities, optionalAmenity]);
        }
        setOptionalAmenity("");
      } else {
        toast.error(
          "You have gotten to maximum number of amenities, to add more remove some"
        );
        return;
      }
    }
  };

  const createMainFees = React.useCallback(() => {
    const singleMainFee = { name: mainFeeName, amount: mainFeeAmount };

    if (
      (mainFeeName && mainFeeAmount) ||
      (mainFeeName !== "" && mainFeeAmount !== 0)
    ) {
      setMainFees(
        [...mainFees, singleMainFee].filter((item) => item.amount !== 0)
      );
      setMainFeeName("");
      setMainFeeAmount(0);
    }
    return;
  }, [mainFees, mainFeeAmount, mainFeeName]);

  const createOptionalFees = React.useCallback(() => {
    const singleOptionalFee = {
      name: optionalFeeName,
      amount: optionalFeeAmount,
    };

    if (
      (optionalFeeName && optionalFeeAmount) ||
      (optionalFeeName !== "" && optionalFeeAmount !== 0)
    ) {
      setOptionalFees(
        [...optionalFees, singleOptionalFee].filter((item) => item.amount !== 0)
      );
      setOptionalFeeName("");
      setOptionalFeeAmount(0);
    }
    return;
  }, [optionalFees, optionalFeeAmount, optionalFeeName]);

  const createClosestLandmarks = React.useCallback(() => {
    const singleClosestLandmark = {
      name: landmarkName,
      distanceAway: distanceAway,
    };

    if (
      (landmarkName && distanceAway) ||
      (landmarkName !== "" && distanceAway !== "")
    ) {
      setClosestLandmarks(
        [...closestLandmarks, singleClosestLandmark].filter(
          (item) => item.distanceAway !== ""
        )
      );
      setLandmarkName("");
      setDistanceAway("");
    }
    return;
  }, [closestLandmarks, distanceAway, landmarkName]);

  const removeMainAmenity = (value: string) => {
    const renderedAmenities = mainAmenities.filter((item) => item !== value);
    setMainAmenities(renderedAmenities);
  };

  const removeOptionalAmenity = (value: string) => {
    const renderedAmenities = optionalAmenities.filter(
      (item) => item !== value
    );
    setOptionalAmenities(renderedAmenities);
  };

  const removeSingleMainFee = (value: string) => {
    const renderedMainFees = mainFees.filter((item) => item.name !== value);
    setMainFees(renderedMainFees);
  };

  const removeSingleOptionalFee = (value: string) => {
    const renderedOptionalFees = optionalFees.filter(
      (item) => item.name !== value
    );
    setOptionalFees(renderedOptionalFees);
  };

  const removeLandmark = (value: string) => {
    const renderedLandmarks = closestLandmarks.filter(
      (item) => item.name !== value
    );
    setClosestLandmarks(renderedLandmarks);
  };

  const onSubmitForm = async (values: addApartmentValues) => {
    if (watchedPropertyTag === "for-rent" && !watchedAnnualRent) {
      toast.error("Annual rent is required for a rental property.");
      return;
    }

    if (watchedAnnualRent && !watchedMonthlyRent) {
      toast.error(
        "Include monthly rent for the apartment inorder to continue."
      );
      return;
    }

    if (watchedPropertyTag === "for-sale" && !watchedPropertyPrice) {
      toast.error("Property price is required, include it.");
      return;
    }

    if (uploadedImages.length < 1 || uploadedImages.length < 6) {
      toast.error(
        uploadedImages.length < 1
          ? "Apartment images are required, upload to continue"
          : "Add atleast six images of the apartment or property."
      );
      return;
    }

    if (watchedPropertyTag === "for-rent" && mainFees.length < 2) {
      toast.error(
        "Include the following amounts for agreement and commission inorder to continue."
      );
      return;
    }

    if (watchedPropertyTag === "for-sale" && mainFees.length < 2) {
      toast.error(
        "Include the following amounts for agreement and commission inorder to continue."
      );
      return;
    }

    if (mainAmenities.length < 3) {
      toast.error(
        "Include at least three amenities that your clients will enjoy"
      );
      return;
    }

    if (closestLandmarks.length < 3) {
      toast.error("Include at least three close landmarks to your property.");
      return;
    }

    const fulldata = {
      ...values,
      uploadedImages,
      mainAmenities,
      optionalAmenities,
      mainFees,
      optionalFees,
      closestLandmarks,
    };

    try {
      setIsLoading(true);
      await createProperty({ values: fulldata }).then((response) => {
        if (response.status === 200) {
          form.reset();
          setUploadedImages([]);
          setMainAmenities([]);
          setOptionalAmenities([]);
          setMainFees([]);
          setOptionalFees([]);
          setClosestLandmarks([]);
          setIsLoading(false);
          toast.success(response.message);
          return router.push("./apartments");
        }

        if (response.status !== 200) {
          setIsLoading(false);
          return toast.error(response.message);
        }
      });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error(
        "An error occurred while creating the property, please try again later."
      );
    }
  };

  return (
    <div className="w-full lg:w-[80%] xl:w-[70%] md:w-[80%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6">
      <h2 className="text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl">
        Add Apartments
      </h2>
      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmitForm)}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h2 className="lg:text-sm text-xs font-semibold">
                BASIC DETAILS
              </h2>
              <hr className="flex-1 dark:border-white/70" />
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                      icon={AtIcon}
                      placeholder="Title of the property"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                      inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                      icon={Location06Icon}
                      placeholder="Street name and house number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="w-full">
                        <CustomSelect
                          placeholder="Select state of location"
                          data={states}
                          value={field.value}
                          onChange={field.onChange}
                          style="border-black/80"
                          height="lg:h-12 h-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="w-full">
                        <CustomSelect
                          placeholder="Select LGA of location"
                          data={lga}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={lga.length === 0}
                          style="border-black/80"
                          height="lg:h-12 h-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
              <FormField
                control={form.control}
                name="propertyTag"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="w-full">
                        <CustomSelect
                          placeholder="Select property tag"
                          data={["for-rent", "for-sale"]}
                          value={field.value}
                          onChange={field.onChange}
                          style="border-black/80"
                          height="lg:h-12 h-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facilityStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="w-full">
                        <CustomSelect
                          placeholder="Select facility status"
                          data={["serviced", "non serviced"]}
                          value={field.value}
                          onChange={field.onChange}
                          style="border-black/80"
                          height="lg:h-12 h-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid lg:grid-cols-4 grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputWithIcon
                        {...field}
                        icon={BedIcon}
                        placeholder="No of rooms"
                        className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                        inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputWithIcon
                        {...field}
                        icon={Bathtub01Icon}
                        placeholder="No of baths"
                        className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                        inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toilets"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputWithIcon
                        {...field}
                        icon={Toilet01Icon}
                        placeholder="No of toilets"
                        className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                        inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputWithIcon
                        {...field}
                        icon={CenterFocusIcon}
                        placeholder="Area in sqft"
                        className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                        inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the property (keep it simple and short)"
                      className="text-sm lg:text-base h-[12rem] resize-none rounded-lg bg-[#d4d4d4] dark:bg-[#424242] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-none focus-visible:ring-offset-0 p-2.5 shadow-none dark:placeholder:text-white/70 placeholder:text-black/70"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h2 className="lg:text-sm text-xs font-semibold">
                APARTMENT IMAGES
              </h2>
              <hr className="flex-1 dark:border-white/70" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <CldUploadWidget
                options={uploadOptions}
                onSuccess={handleUploadPropertyImages}
              >
                {({ open }) => {
                  return (
                    <div
                      onClick={() => open?.()}
                      className="w-full h-[12rem] md:h-[15rem] bg-[#d4d4d4] dark:bg-[#424242] rounded-lg flex items-center justify-center flex-col lg:text-lg cursor-pointer p-4"
                    >
                      <HugeiconsIcon icon={ImageAdd01Icon} className="size-[60px] md:size-[80px] lg:size-[100px]" />
                      <span className="text-sm lg:text-base">
                        Add images of the property, not more than 16.
                      </span>
                    </div>
                  );
                }}
              </CldUploadWidget>
              {uploadedImages.length > 0 && (
                <React.Fragment>
                  <div className="w-full h-auto grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                    {uploadedImages.map((item, index: number) => (
                      <ImageHolder
                        key={index}
                        secure_url={item.secure_url}
                        public_id={item.public_id}
                        index={index}
                      />
                    ))}
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <h2 className="lg:text-sm text-xs font-semibold">
                PAYMENTS & FEES
              </h2>
              <hr className="flex-1 dark:border-white/70" />
            </div>
            {watchedPropertyTag === "for-rent" ? (
              <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="annualRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputWithIcon
                          className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                          inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                          icon={CreditCardIcon}
                          placeholder={`Annual rent in ${nairaSign}`}
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
                <FormField
                  control={form.control}
                  name="monthlyRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputWithIcon
                          className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                          inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                          icon={CreditCardIcon}
                          placeholder={`Monthly rent in ${nairaSign}`}
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
            ) : watchedPropertyTag === "for-sale" ? (
              <FormField
                control={form.control}
                name="propertyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputWithIcon
                        className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                        inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                        icon={CreditCardIcon}
                        placeholder={`Property price in ${nairaSign}`}
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
            ) : (
              ""
            )}
            <div className="flex flex-col gap-2">
              {watchedPropertyTag === "for-sale" ? (
                <h2 className="text-sm ml-2">
                  Main fees (excluding property price) that must be paid.
                </h2>
              ) : (
                <h2 className="text-sm ml-2">
                  Main fees (excluding annual or monthly rent) that must be
                  paid.
                </h2>
              )}
              <div className="grid gap-3 grid-cols-2">
                <InputWithIcon
                  type="text"
                  placeholder="name"
                  value={mainFeeName}
                  icon={AtIcon}
                  onChange={(e) => setMainFeeName(e.target.value)}
                  className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                  inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                />
                <InputWithIcon
                  type="number"
                  placeholder={`amount (${nairaSign})`}
                  value={mainFeeAmount || ""}
                  icon={CreditCardIcon}
                  onChange={(e) =>
                    setMainFeeAmount(parseInt(e.target.value) || 0)
                  }
                  className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                  inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                />
              </div>
              <div className="flex items-center justify-end">
                <Button
                  className="py-2 px-4 md:px-6 flex items-center gap-2 mt-1 justify-end rounded-full text-sm bg-secondary-blue text-white hover:bg-primary-blue/80"
                  type="button"
                  onClick={createMainFees}
                >
                  <HugeiconsIcon icon={PlusSignIcon} />
                  {mainFees.length === 0 ? "Add fee" : "Add more"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                {mainFees.length > 0 &&
                  mainFees
                    .filter((item) => item.amount !== 0)
                    .map((item: feesProps, index: number) => (
                      <div
                        key={index}
                        className="bg-[#d4d4d4] dark:bg-[#424242] text-sm capitalize lg:py-2.5 py-2 px-4 rounded-full flex items-center md:gap-3 gap-2"
                      >
                        {item.name}: {nairaSign}
                        {item.amount.toLocaleString()}.00
                        <button
                          type="button"
                          onClick={() => removeSingleMainFee(item.name)}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                        </button>
                      </div>
                    ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm ml-2">
                Optional fees (they may be paid later or even waived).
              </h2>
              <div className="grid gap-3 grid-cols-2">
                <InputWithIcon
                  type="text"
                  placeholder="name"
                  value={optionalFeeName}
                  icon={AtIcon}
                  onChange={(e) => setOptionalFeeName(e.target.value)}
                  className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                  inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                />
                <InputWithIcon
                  type="number"
                  placeholder={`amount (${nairaSign})`}
                  value={optionalFeeAmount || ""}
                  icon={CreditCardIcon}
                  onChange={(e) =>
                    setOptionalFeeAmount(parseInt(e.target.value) || 0)
                  }
                  className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                  inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                />
              </div>
              <div className="flex items-center justify-end">
                <Button
                  className="py-2 px-4 md:px-6 flex items-center gap-2 mt-1 justify-end rounded-full text-sm bg-secondary-blue text-white hover:bg-primary-blue/80"
                  type="button"
                  onClick={createOptionalFees}
                >
                  <HugeiconsIcon icon={PlusSignIcon} />
                  {optionalFees.length === 0 ? "Add fee" : "Add more"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                {optionalFees.length > 0 &&
                  optionalFees
                    .filter((item) => item.amount !== 0)
                    .map((item: feesProps, index: number) => (
                      <div
                        key={index}
                        className="bg-[#d4d4d4] dark:bg-[#424242] text-sm capitalize lg:py-2.5 py-2 px-4 rounded-full flex items-center md:gap-3 gap-2"
                      >
                        {item.name}: {nairaSign}
                        {item.amount.toLocaleString()}.00
                        <button
                          type="button"
                          onClick={() => removeSingleOptionalFee(item.name)}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                        </button>
                      </div>
                    ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="lg:text-sm text-xs font-semibold">
                AMENITIES & CLOSE LANDMARK
              </h2>
              <hr className="flex-1 dark:border-white/70" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm ml-2">
                Main Amenities (major things users enjoy).
              </h2>
              <InputWithIcon
                placeholder="enter names of amenities and separate with a comma"
                onChange={(e) => setMainAmenity(e.target.value)}
                icon={DashboardSquare01Icon}
                onKeyDown={createMainAmenities}
                className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                value={mainAmenity}
              />
              <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                {mainAmenities.length > 0 &&
                  mainAmenities.map((item: string, index: number) => (
                    <div
                      key={index}
                      className="capitalize border text-sm py-2 px-4 rounded-full flex items-center md:gap-3 gap-2 bg-[#d4d4d4] dark:bg-[#424242]"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeMainAmenity(item)}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm ml-2">
                Optional Amenities (additional amenities apartments offers).
              </h2>
              <InputWithIcon
                placeholder="enter names of amenities and separate with a comma"
                onChange={(e) => setOptionalAmenity(e.target.value)}
                icon={DashboardSquare01Icon}
                onKeyDown={createOptionalAmenities}
                className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                value={optionalAmenity}
              />
              <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                {optionalAmenities.length > 0 &&
                  optionalAmenities.map((item: string, index: number) => (
                    <div
                      key={index}
                      className="capitalize border text-sm bg-[#d4d4d4] dark:bg-[#424242] py-2 px-4 rounded-full flex items-center md:gap-3 gap-2"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeOptionalAmenity(item)}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm ml-2">
                Closest Landmarks (this makes it easy to tag apartments)
              </h2>
              <div className="flex flex-col gap-2">
                <div className="grid gap-3 grid-cols-2">
                  <InputWithIcon
                    type="text"
                    placeholder="name"
                    value={landmarkName}
                    icon={Location06Icon}
                    onChange={(e) => setLandmarkName(e.target.value)}
                    className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                    inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                  />
                  <InputWithIcon
                    type="text"
                    placeholder="distance away (km)"
                    value={distanceAway}
                    icon={AtIcon}
                    onChange={(e) => setDistanceAway(e.target.value)}
                    className="bg-[#d4d4d4] rounded-lg dark:bg-[#424242]"
                    inputClassName="rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    className="py-2 px-4 md:px-6 flex items-center gap-2 mt-1 justify-end rounded-full text-sm bg-secondary-blue text-white hover:bg-primary-blue/80"
                    type="button"
                    onClick={createClosestLandmarks}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} />
                    {closestLandmarks.length === 0
                      ? "Add landmark"
                      : "Add more landmarks"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                  {closestLandmarks.length > 0 &&
                    closestLandmarks
                      .filter((item) => item.distanceAway !== "")
                      .map((item: landmarkProps, index: number) => (
                        <div
                          key={index}
                          className="bg-[#d4d4d4] dark:bg-[#424242] text-sm capitalize lg:py-2.5 py-2 px-4 rounded-full flex items-center md:gap-3 gap-2"
                        >
                          {item.name}: {item.distanceAway}
                          <button
                            type="button"
                            onClick={() => removeLandmark(item.name)}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
                          </button>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm lg:text-base font-semibold dark:text-secondary-red text-primary-red">
              Upon creation all data entered regarding the apartment is saved
              and only few of the details can be modified later. Hence make sure
              all data are checked carefully and you have details before
              creating property details.
            </p>
          </div>
          <div className="mt-8 flex items-center">
            <LoadingButton
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              loadingLabel="Creating Property.."
              label="Create Property"
              className="text-white bg-secondary-blue py-2 px-6 rounded-full text-sm lg:text-base"
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddApartmentClient;

"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { Bathtub01Icon, BedIcon, Building03Icon, Calendar04Icon, Cancel01Icon, CenterFocusIcon, ArrowRight01Icon, ArrowLeft01Icon, MapsIcon, TelephoneIcon, Toilet01Icon, User03Icon, Timer01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from '@hugeicons/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { scheduleInspectionSchema, scheduleInspectionValues } from "@/lib/form-validations";
import { propertyProps, userProps } from "@/lib/types";
import { cn, formatDateWithOrdinal, nairaSign } from "@/lib/utils";
import { formatMoney } from "@/utils/formatMoney";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import CustomSelect from "@/components/ui/custom-select";
import InputWithIcon from "@/components/ui/input-with-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingButton } from "@/components/ui/loading-button";
import { useInspectionConditionModal, useStartRentOutModal } from "@/hooks/general-store";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import LikeButton from "./like-button";
import BookmarkButton from "./bookmark-button";
import { scheduleInspection } from "@/actions/inspection-actions";
import { cancelRentOut } from "@/actions/rentout-actions";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type Props = {
  property: Partial<propertyProps>;
  user: userProps;
};

const SingleApartmentClient = ({ property, user }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    title,
    address,
    state,
    city,
    apartmentImages,
    annualRent,
    propertyPrice,
    monthlyRent,
    propertyTag,
    bedrooms,
    bathrooms,
    toilets,
    squareFootage,
    facilityStatus,
    description,
    mainAmenities,
    optionalAmenities,
    mainFees,
    optionalFees,
    closestLandmarks,
    agent,
  } = property;

  const [openSlider, setOpenSlider] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false)

  const userIsAuthor = user?._id === property?.agent?.userId?._id;

  const { onOpen } = useStartRentOutModal();

  const queryClient = useQueryClient();

  const userId = user?._id;
  const agentId = property?.agent?._id;

  const initiateRentOut = () => {
    const rentOutData = {
      userId: agentId,
      agentUserId: userId,
      propertyId: property.propertyIdTag, 
      propertyType: property.propertyTag
    }

    localStorage.setItem('rent-data', JSON.stringify(rentOutData))
    onOpen();
  };

  const cancelApartmentRentOut = async () => {

    const data =  {
      propertyIdTag: property.propertyIdTag || '',
      agentId: agentId || '',
      path: pathname
    };

    setCancelling(true);
    const response = await cancelRentOut(data)
    if (response && response.status === 200) {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['added-properties'] });
      setCancelling(false);
    } else {
      toast.error(response.message);
      setCancelling(false);
    }
  }

  const handleRentOut = () => {
    if (property.availabilityStatus === 'available') {
      initiateRentOut();
    } else {
      cancelApartmentRentOut();
    }
  };

  const Header = () => {
    return (
      <div className="flex flex-col gap-1">
        <h2 className="md:text-lg text-base font-semibold uppercase">
          {title}.
        </h2>
        <div className="flex w-full md:justify-between flex-col md:flex-row gap-1.5">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={MapsIcon} className="size-5 text-black/60 dark:text-white/70" />
            <h3 className="md:text-base text-sm font-medium mt-1 md:mt-0 text-black/60 dark:text-white/70">
              {address}, {city}, {state}.
            </h3>
          </div>
          { !userIsAuthor ?
            <div className="flex items-center gap-4">
              <LikeButton property={property} user={user} />
              <BookmarkButton property={property} user={user} />
            </div> :
            <div>
              { property.availabilityStatus === 'rented' ?
                <div className='flex items-center gap-3 px-3 py-1.5 border rounded-md text-sm lg:text-base text-white bg-secondary-blue border-secondary-blue'>
                  Apartment Rented
                </div> :
                <button className='flex items-center gap-3 px-3 py-1.5 border rounded-md text-sm lg:text-base text-white bg-secondary-blue border-secondary-blue' onClick={handleRentOut}>
                  { cancelling ? <Loader2 className="animate-spin size-4 lg:size-5" /> : <HugeiconsIcon icon={Timer01Icon} className='size-4 lg:size-5'/>}
                  { property.availabilityStatus === 'available' ? (property.propertyTag === 'for-rent' ? 'Initiate Rent-out' : 'Initiate Sell-out') : (cancelling ? (property.propertyTag === 'for-rent' ? 'Cancelling Rent-out' : 'Cancelling Sell-out') : (property.propertyTag === 'for-rent' ? 'Cancel Rent-out' : 'Cancel Sell-out'))}
                </button>
              }
            </div>
          }
        </div>
      </div>
    );
  };

  const ImageGrid = () => {
    return (
      <React.Fragment>
        <div className="w-full xl:h-[500px] lg:h-[450px] h-[420px] md:grid grid-cols-2 lg:gap-3 gap-2 hidden ">
          <div className="bg-gray-200 rounded-md w-full h-full relative shadow-md">
            <div className="dark:bg-transparent bg-black/20 left-0 top-0 w-full h-full rounded-md z-[200] absolute" />
            <Image
              src={apartmentImages?.images[0] || ""}
              alt="aprtment_image_1"
              fill
              className="object-cover object-center rounded-md "
            />
          </div>
          <div className="rounded-md w-full h-full grid grid-rows-2 lg:gap-3 gap-2">
            <div className="w-full h-full grid grid-cols-2 lg:gap-3 gap-2">
              <div className="relative bg-gray-200 rounded-md shadow-md">
                <div className="dark:bg-transparent bg-black/20 left-0 top-0 w-full h-full rounded-md z-[200] absolute" />
                <Image
                  src={apartmentImages?.images[1] || ""}
                  alt="aprtment_image_2"
                  fill
                  className="object-cover object-center rounded-md"
                />
              </div>
              <div className="relative bg-gray-200 rounded-md shadow-md">
                <div className="dark:bg-transparent bg-black/20 left-0 top-0 w-full h-full rounded-md z-[200] absolute" />
                <Image
                  src={apartmentImages?.images[2] || ""}
                  alt="aprtment_image_3"
                  fill
                  className="object-cover object-center rounded-md"
                />
              </div>
            </div>
            <div className="w-full h-full grid grid-cols-2 lg:gap-3 gap-2">
              <div className="relative bg-gray-200 rounded-md shadow-md">
                <div className="dark:bg-transparent bg-black/20 left-0 top-0 w-full h-full rounded-md z-[200] absolute" />
                <Image
                  src={apartmentImages?.images[3] || ""}
                  alt="aprtment_image_4"
                  fill
                  className="object-cover object-center rounded-md"
                />
              </div>
              <div className="relative bg-gray-200 rounded-md shadow-md">
                <div className="dark:bg-transparent bg-black/40 left-0 top-0 w-full h-full rounded-md z-[200] absolute flex flex-col justify-end p-4 items-end">
                  <div
                    className="bg-white dark:bg-[#424242] rounded-md z-[500] cursor-pointer py-2 px-3 flex items-center gap-2"
                    onClick={() => setOpenSlider(true)}
                  >
                    <span className="text-sm font-medium ">
                      View All {apartmentImages?.images.length}
                    </span>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
                  </div>
                </div>
                <Image
                  src={apartmentImages?.images[4] || ""}
                  alt="aprtment_image_5"
                  fill
                  className="object-cover object-center rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[325px] rounded-md md:hidden relative bg-gray-200">
          <div className="dark:bg-transparent bg-black/30 left-0 top-0 w-full h-full rounded-md z-[200] absolute flex flex-col justify-end p-4 items-end">
            <div
              className="bg-white dark:bg-[#424242] rounded-md z-[500] cursor-pointer py-2 px-3 flex items-center gap-2"
              onClick={() => setOpenSlider(true)}
            >
              <span className="text-sm font-medium ">
                View All {apartmentImages?.images.length} Photos
              </span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
            </div>
          </div>
          <Image
            src={apartmentImages?.images[0] || ""}
            alt="aprtment_image_1"
            fill
            className="object-cover object-center rounded-md"
          />
        </div>
        <div className="flex md:items-center justify-between md:flex-row flex-col gap-1">
          <div className="flex items-center gap-3">
            {propertyTag === "for-rent" && annualRent && (
              <h2 className="md:text-base text-sm">
                Annual Rent:{" "}
                <span className="font-semibold text-red-500">
                  {nairaSign}
                  {formatMoney(annualRent)}
                </span>
              </h2>
            )}
            {propertyTag === "for-rent" && monthlyRent && (
              <h2 className="md:text-base text-sm">
                Monthly Rent:{" "}
                <span className="font-semibold text-red-500">
                  {nairaSign}
                  {formatMoney(monthlyRent)}
                </span>
              </h2>
            )}
            {propertyTag === "for-sale" && propertyPrice && (
              <h2 className="md:text-base text-sm">
                Property Price:{" "}
                <span className="font-semibold text-red-500">
                  {nairaSign}
                  {formatMoney(propertyPrice)}
                </span>
              </h2>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-black/60 dark:text-white/70">
              <div className="flex gap-1 items-center md:text-base text-sm">
                <HugeiconsIcon icon={BedIcon} className="lg:size-6 md:size-5 size-5" />
                {bedrooms}
              </div>
              <div className="flex gap-1 items-center md:text-base text-sm">
                <HugeiconsIcon icon={Bathtub01Icon} className="lg:size-6 md:size-5 size-5" />
                {bathrooms}
              </div>
              <div className="flex gap-1 items-center md:text-base text-sm">
                <HugeiconsIcon icon={Toilet01Icon} className="lg:size-6 md:size-5 size-5" />
                {toilets}
              </div>
              <div className="flex gap-1 items-center md:text-base text-sm">
                <HugeiconsIcon icon={CenterFocusIcon} className="lg:size-6 md:size-5 size-5" />
                {squareFootage} sqm
              </div>
            </div>
            <p className="md:text-base text-sm font-semibold capitalize ml-6 md:ml-8 text-red-500">
              {`${facilityStatus}` === "service"
                ? "Serviced Apartment"
                : "Non-Serviced Apartment"}
            </p>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const ImageSlider = () => {
    const lastImageIndex = (apartmentImages?.images?.length ?? 0) - 1;

    const [currentIndex, setCurrentIndex] = React.useState(0);

    const nextSlide = () => {
      if (!apartmentImages) {
        return;
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
    };

    const prevSlide = () => {
      if (!apartmentImages) {
        return;
      }

      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
    };

    return (
      <div className="slide-in-left fixed left-0 top-0 w-full h-full bg-neutral-800/70 z-[300000] overflow-hidden lg:p-8 md:p-12 p-6">
        <div className="absolute right-6 top-6 lg:p-2.5 p-2 flex gap-3 bg-white rounded-full items-center dark:text-black">
          <button
            onClick={() => {
              (setOpenSlider(false), setCurrentIndex(0));
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-6" />
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-4 lg:gap-5 h-full w-full justify-center">
          <div>
            {currentIndex > 0 && (
              <button
                className="bg-white hover:scale-110 md:w-11 md:h-11 w-10 h-10 flex items-center justify-center rounded-full dark:text-black"
                onClick={prevSlide}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />
              </button>
            )}
          </div>
          <div className="h-full text-white overflow-hidden flex items-center justify-center relative w-full">
            <Image
              src={apartmentImages?.images[currentIndex] || ""}
              alt={`image_${currentIndex + 1}`}
              fill
              className="size-fit object-contain rounded-md"
            />
          </div>
          <div>
            {currentIndex < lastImageIndex! && (
              <button
                className="bg-white hover:scale-110 md:w-11 md:h-11 w-10 h-10 flex items-center justify-center rounded-full dark:text-black"
                onClick={nextSlide}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Features = () => {
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm({
      resolver: zodResolver(scheduleInspectionSchema),
      defaultValues: {
        date: new Date(),
        time: "",
        additionalPhoneNumber: "",
        agreement: false,
      },
    });

    const { onOpen } = useInspectionConditionModal();

    const watchedAgreement = form.watch("agreement");

    const timeList = [
      "8:00am",
      "9:00am",
      "10:00am",
      "11:00am",
      "12:00pm",
      "1:00pm",
      "2:00pm",
      "3:00pm",
      "4:00pm",
      "5:00pm",
      "6:00pm",
    ];

    const onSubmitForm = async (values: scheduleInspectionValues) => {
      if (!user) {
        localStorage.setItem("nextUrl", pathname);
        router.push("/log-in");
      } else {
        if (watchedAgreement !== true) {
          form.setError("agreement", {
            type: "manual",
            message: "To continue, agree to our terms of inspections.",
          });
          return;
        }

        const data = {
          time: values.time,
          additionalPhoneNumber: values.additionalPhoneNumber || "",
          date: formatDateWithOrdinal(values.date.toISOString().split("T")[0]),
          agentId: agent?._id || "",
          apartment: property.propertyIdTag || "",
          path: pathname,
        };

        setIsLoading(true);
        await scheduleInspection(data)
          .then((response) => {
            if (response.success && response.status === 201) {
              toast.success(response.message);
              setIsLoading(false);
            }

            if (!response.success && response.status !== 201) {
              toast.error(response.message);
              setIsLoading(false);
            }
          })
          .catch((error) => {

            setIsLoading(false);
            toast.error("Something went wrong, try again later!!");
          });
      }
    };

    return (
      <div className="flex flex-col lg:gap-4 gap-3">
        <div className="flex items-center gap-4">
          <h2 className="lg:text-sm text-xs font-semibold">DESCRIPTION</h2>
          <hr className="flex-1 dark:border-white/70" />
        </div>
        <div className="text-justify text-sm lg:text-base dark:text-white/70 text-black/60">
          {description}
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 lg:gap-6">
          <div className="w-full flex flex-col xl:gap-6 lg:gap-5 gap-4">
            <div className="w-full">
              <div className="flex items-center gap-4 lg:mb-4 mb-3">
                <h2 className="lg:text-sm text-xs font-semibold">AMENITIES</h2>
                <hr className="flex-1 dark:border-white/70" />
              </div>
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {mainAmenities &&
                  mainAmenities.length > 0 &&
                  mainAmenities.map((item: string) => (
                    <div
                      className="bg-gray-200 dark:bg-[#424242] px-3 py-1 lg:py-1.5 text-sm rounded-full"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                {optionalAmenities &&
                  optionalAmenities.length > 0 &&
                  optionalAmenities.map((item: string) => (
                    <div
                      className="bg-gray-200 dark:bg-[#424242] px-3 py-1 lg:py-1.5 text-sm rounded-full"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
              </div>
            </div>
            <div className="w-full">
              <div className="flex items-center gap-4 lg:mb-4 mb-3">
                <h2 className="lg:text-sm text-xs font-semibold">FEES</h2>
                <hr className="flex-1 dark:border-white/70" />
              </div>
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {mainFees &&
                  mainFees.length > 0 &&
                  mainFees.map((item) => (
                    <div
                      className="bg-gray-200 dark:bg-[#424242] px-3 py-1 lg:py-1.5 text-sm rounded-full flex items-center gap-2 capitalize"
                      key={item.name}
                    >
                      {item.name}:
                      <span>
                        {nairaSign}
                        {item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                {optionalFees &&
                  optionalFees.length > 0 &&
                  optionalFees.map((item) => (
                    <div
                      className="bg-gray-200 dark:bg-[#424242] px-3 py-1 lg:py-1.5 text-sm rounded-full flex items-center gap-2 capitalize"
                      key={item.name}
                    >
                      {item.name}:
                      <span>
                        {nairaSign}
                        {item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="w-full">
              <div className="flex items-center gap-4 lg:mb-4 mb-3">
                <h2 className="lg:text-sm text-xs font-semibold">
                  CLOSEST LANDMARKS
                </h2>
                <hr className="flex-1 dark:border-white/70" />
              </div>
              <div className="flex flex-wrap gap-x-1 gap-y-2">
                {closestLandmarks &&
                  closestLandmarks.length > 0 &&
                  closestLandmarks.map((item) => (
                    <div
                      className="bg-gray-200 dark:bg-[#424242] px-3 py-1 lg:py-1.5 text-sm rounded-full flex items-center gap-2 capitalize"
                      key={item.name}
                    >
                      {item.name}:<span>{item.distanceAway}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col xl:gap-6 lg:gap-5 gap-4">
            <div className="w-full">
              <div className="flex items-center gap-4">
                <h2 className="lg:text-sm text-xs font-semibold">
                  ABOUT AGENT & AGENCY
                </h2>
                <hr className="flex-1 dark:border-white/70" />
              </div>
              <div className="flex gap-3 mt-3 lg:mt-4 items-center">
                <div className="size-[120px] lg:size-[150px] rounded-full relative flex-none">
                  <Image
                    src={
                      agent?.userId.profilePicture || "/images/defult_user.png"
                    }
                    alt="agent_profile_pix"
                    className="object-cover object-center rounded-full"
                    fill
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 lg:text-base text-sm">
                    <HugeiconsIcon icon={User03Icon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70">
                      {agent?.userId.surName} {agent?.userId.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 lg:text-base text-sm">
                    <HugeiconsIcon icon={Building03Icon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70 capitalize">
                      {agent?.agencyName}
                    </span>
                  </div>
                  <div className="flex gap-2 lg:text-base text-sm">
                    <HugeiconsIcon icon={MapsIcon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70 capitalize">
                      {agent?.officeAddress}, {agent?.userId.city},{" "}
                      {agent?.userId.state}.
                    </span>
                  </div>
                  <div className="flex gap-2 lg:text-base text-sm">
                    <HugeiconsIcon icon={TelephoneIcon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70 capitalize">
                      {agent?.officeNumber}
                    </span>
                  </div>
                  <button className="lg:text-base text-sm mt-2 lg:mt-3 cursor-pointer w-fit ml-6 lg:ml-0">
                    Check out the full profile
                  </button>
                </div>
              </div>
            </div>
            { user?.role === 'user' &&
              <div className="w-full">
                <div className="flex items-center gap-4">
                  <h2 className="lg:text-sm text-xs font-semibold">
                    INSPECTION SCHEDULE
                  </h2>
                  <hr className="flex-1 dark:border-white/70" />
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitForm)}>
                    <div className="flex flex-col gap-3">
                      <div className="flex mt-3 gap-3 flex-col md:flex-row">
                        <div className="lg:w-3/5 md:w-3/4 w-full">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <button
                                        className={cn(
                                          "p-2.5 w-full justify-start text-left font-normal rounded-lg bg-inherit lg:h-12 h-10 text-base text-black/60 dark:text-white border flex items-center dark:border-white/60",
                                          !field.value && "text-black/60"
                                        )}
                                      >
                                        <HugeiconsIcon icon={Calendar04Icon} className="mr-2 size-5" />
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span className="text-base">
                                            Select date
                                          </span>
                                        )}
                                      </button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      className="rounded-md border shadow-sm"
                                      captionLayout="dropdown"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="rounded lg:w-2/5 md:w-1/4 w-full">
                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <CustomSelect
                                    data={timeList}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select time"
                                    height="lg:h-12 h-10 data-[placeholder]:text-black/60 shadow-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="additionalPhoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <InputWithIcon
                                iconClassName="text-black/60 dark:text-white"
                                placeholder="Additional phone number"
                                icon={TelephoneIcon}
                                inputClassName="rounded-lg dark:placeholder:text-white placeholder:text-black/60"
                                className="rounded-lg border dark:border-white/60 "
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="agreement"
                        render={({ field }) => (
                          <div className="flex flex-col">
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 -mt-1">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-black/60 cursor-pointer">
                                  By creating a schedule, you have agreed to our{" "}
                                  <span
                                    className="underline text-black font-medium capitalize cur"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onOpen();
                                    }}
                                  >
                                    inspection terms and policy
                                  </span>
                                  .
                                </FormLabel>
                              </div>
                            </FormItem>
                            <FormMessage className="inline-block mt-1" />
                          </div>
                        )}
                      />
                    </div>
                    <div className="mt-5 flex items-end justify-end">
                      <LoadingButton
                        label="Schedule Inspection"
                        loadingLabel="Scheduling Inspection"
                        className="lg:text-base text-sm py-2 px-6 bg-black dark:bg-[#424242] rounded-lg text-white"
                        type="submit"
                        isLoading={isLoading}
                      />
                    </div>
                  </form>
                </Form>
              </div>
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-[60px] lg:pt-[70px] xl:px-16 lg:px-10 md:px-6 px-3 min-h-screen xl:pb-16 pb-12">
      <div className="xl:py-6 lg:py-5 py-4 flex flex-col xl:gap-6 lg:gap-5 gap-4">
        <Header />
        <ImageGrid />
        <Features />
      </div>
      {openSlider && <ImageSlider />}
    </div>
  );
};

export default SingleApartmentClient;

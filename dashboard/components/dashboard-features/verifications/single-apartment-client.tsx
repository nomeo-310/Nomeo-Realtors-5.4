"use client";

import { Bathtub01Icon, BedIcon, Building03Icon, Cancel01Icon, CenterFocusIcon, ArrowRight01Icon, ArrowLeft01Icon, MapsIcon, TelephoneIcon, Toilet01Icon, User03Icon, ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from '@hugeicons/react'
import { getUserRole, nairaSign } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { AdminDetailsProps, PropertyProps } from "@/lib/types";
import { formatMoney } from "@/utils/formatMoney";
import { usePathname, useRouter } from "next/navigation";
import { canManageApartments } from "@/utils/permission-utils";
import { verifyApartment } from "@/actions/verification-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  property: Partial<PropertyProps>;
};

interface singleApartmentProps extends Props {
  type: 'rent-verification' | 'sale-verification' | 'apartment-verification';
  user: AdminDetailsProps;
 }

const SingleApartmentClient = ({property, type, user}: singleApartmentProps) => {

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
    propertyApproval
  } = property;

  const [openSlider, setOpenSlider] = React.useState(false);

  const Header = () => {
    return (
      <div className="flex flex-col gap-1">
        <h2 className="lg:text-lg md:text-base text-sm font-semibold uppercase">
          {title}.
        </h2>
        <div className="flex w-full md:justify-between flex-col md:flex-row gap-1.5">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={MapsIcon} className="size-5 text-black/60 dark:text-white/70" />
            <h3 className="md:text-sm lg:text-base text-xs font-medium mt-1 md:mt-0 text-black/60 dark:text-white/70">
              {address}, {city}, {state}.
            </h3>
          </div>
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
                  {formatMoney (annualRent)}
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
            <p className="md:text-base text-sm font-semibold capitalize text-red-500 md:ml-6 lg:ml-10">
              {`${facilityStatus}` === "service"
                ? "Serviced"
                : "Non-Serviced"}
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
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={User03Icon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70">
                      {agent?.userId.surName} {agent?.userId.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Building03Icon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70 capitalize">
                      {agent?.agencyName}
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <HugeiconsIcon icon={MapsIcon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70 capitalize">
                      {agent?.officeAddress}, {" "}
                      {agent?.userId.state}.
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <HugeiconsIcon icon={TelephoneIcon} className="lg:size-5 size-4 flex-none" />
                    <span className="text-black/60 dark:text-white/70 capitalize">
                      {agent?.officeNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const router = useRouter();
  
  const [approving, setApproving] = React.useState(false);
  
  const canApprove = canManageApartments(getUserRole(user.role));
  const path = usePathname();
  const queryClient = useQueryClient();

  const handleApproval = async () => {

    if (!property._id) {
      console.error('Property ID is missing');
      return;
    }

    setApproving(true);

    const values = {
      apartmentId: property._id,
      path: path
    };

    try {
      await verifyApartment(values)
      .then((response) => {
        if (response.success) {
          toast.success(response.message);
          queryClient.invalidateQueries({queryKey: ['unverified-apartments']})
        } else {
          toast.error(response.message)
        }
      })
    } catch (error) {
      toast.error('Something went wrong. Try again later')
      console.error('Error approving apartment:', error);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="lg:px-10 md:px-6 min-h-screen xl:pb-16 pb-12">
      <div className="w-full flex items-center justify-between">
        <button type="button" className='flex items-center gap-3 text-xs md:text-sm' onClick={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft02Icon} className='size-5 md:size-6'/>
          <span>Go Back</span>
        </button>
        { canApprove && type === 'apartment-verification' && 
          <React.Fragment>
            { propertyApproval === 'pending' &&
              <button 
                onClick={handleApproval}
                disabled={approving}
                className="text-xs md:text-sm bg-secondary-blue text-white rounded-md py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {approving && <Loader2 className="animate-spin size-5"/>}
                {approving ? 'Approving...' : 'Approve Apartment'}
              </button>
            }
          </React.Fragment>
        }
      </div>
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

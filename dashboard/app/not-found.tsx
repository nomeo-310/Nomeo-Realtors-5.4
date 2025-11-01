'use client'

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back(); 
    } else {
      router.push("/"); 
    }
  };

  return (
    <div className='flex items-center justify-center w-full min-h-screen font-urbanist dark:bg-[#424242]'>
      <div className="flex md:gap-6 items-center flex-col md:flex-row p-8 gap-14">
        <div className="relative overflow-hidden rounded-md md:size-72 lg:size-80 size-60 shadow-lg flex-none">
          <Image src="/images/404.jpg" className='rounded-md aspect-square' fill alt='404_banner' />
        </div>
        <div className='text-secondary-blue'>
          <h1 className='text-4xl lg:text-5xl leading-7 text-center md:text-left'>Page not found!</h1>
          <p className='text-dark-grey text-xl leading-7 mt-5 text-center md:text-left'>The page you are looking for does not exist.{" "}
            <button onClick={handleGoBack} className='text-primary-red underline text-xl font-semibold hover:no-underline cursor-pointer'>
              Go back to where you came from.
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

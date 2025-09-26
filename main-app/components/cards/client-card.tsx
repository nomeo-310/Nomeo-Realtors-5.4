import { Loader2 } from 'lucide-react';
import Image from 'next/image'
import React from 'react'

const ClientCard = () => {
  const user = false;

  const CountdownTimer = ({dateString}:{dateString: string}) => {

    const [timeLeft, setTimeLeft] = React.useState<{ days: number; hours: number; minutes: number; seconds: number; } | null>(null);
    const [message, setMessage] = React.useState('');
    const [loading, setLoading] = React.useState(true); // Add a loading state
    const [intervalId, setIntervalId] = React.useState<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
      const targetDate = new Date(dateString);
      const targetYear = new Date(targetDate);
      targetYear.setFullYear(targetDate.getFullYear() + 1);

      const updateTimer = () => {
          const now = new Date();
          const difference = targetYear.getTime() - now.getTime();

          if (difference <= 0) {
              if (intervalId) {
                clearInterval(intervalId);
              }
              setIntervalId(null);
              setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
              setMessage("Time's up!");
              setLoading(false); // Set loading to false when countdown finishes
          } else {
              const days = Math.floor(difference / (1000 * 60 * 60 * 24));
              const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((difference % (1000 * 60)) / 1000);

              setTimeLeft({ days, hours, minutes, seconds });
              setMessage('');
              setLoading(false); // Set loading to false when countdown starts
          }
      };

      // Check if dateString is valid before proceeding.
      if (dateString) {
          try {
              new Date(dateString).toISOString(); // Check if it's a valid date
              updateTimer(); // Initial update
              const id = setInterval(updateTimer, 1000);
              setIntervalId(id);

              return () => {
                if (intervalId) clearInterval(intervalId);
              };
          } catch (error) {
              console.error("Invalid date string:", dateString, error);
              setMessage("Invalid date provided."); // set error message
              setLoading(false);
              setTimeLeft(null);
              return;
          }
      } else {
          setLoading(false); // dateString is empty
          setTimeLeft(null);
          return;
      }

    }, [dateString]);

    return (
      <div className="md:w-[380px] w-full">
        {!loading && timeLeft && timeLeft.days === 0 ? 
          ( <div className='flex items-center justify-between'>
            <button className='text-xs uppercase font-medium px-3 py-0.5 rounded-full border-red-500 bg-red-500 text-white'>Cancel renewal</button>
            <button className='text-xs uppercase font-medium px-3 py-0.5 rounded-full border'>Renew rent</button>
            <button className='text-xs uppercase font-medium px-3 py-0.5 rounded-full border'>Contact Agent</button>
          </div> ) : 
          ( <p className='font-semibold text-xs uppercase'>Coundown to {user && 'your'} next rent</p> )
        }
        { loading ? (<Loader2 className='animate-spin'/>) : timeLeft ? (
          <div className="w-full md:h-[90px] h-[75px] flex-none flex items-center justify-between gap-2">
            <div className="md:h-[80px] w-full rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold font-quicksand flex-col gap-1">
              {timeLeft.days} <span className='text-xs uppercase'>days</span>
            </div>
            <span className='text-4xl font-extrabold mb-4'>:</span>
            <div className="md:h-[80px] w-full rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold font-quicksand flex-col gap-1">
              {timeLeft.hours} <span className='text-xs uppercase'>hours</span>
            </div>
            <span className='text-4xl font-extrabold mb-4'>:</span>
            <div className="md:h-[80px] w-full rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold font-quicksand flex-col gap-1">
              {timeLeft.minutes} <span className='text-xs uppercase'>mins</span>
            </div>
            <span className='text-4xl font-extrabold mb-4'>:</span>
            <div className="md:h-[80px] w-full rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold font-quicksand flex-col gap-1">
              {timeLeft.seconds} <span className='text-xs uppercase'>secs</span>
            </div>
          </div>
        ) : (<div>{message}</div>)
        }
        {message && !loading && <p className="text-lg text-green-600">{message}</p>}
      </div>
    )
  };

  return (
    <div className='w-full border-b dark:border-b-white/70 last:border-b-0 flex gap-3 flex-col py-3'>
      <div className="flex md:flex-row flex-col md:items-center gap-3 md:gap-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="size-[90px] md:size-[100px] rounded-full relative overflow-hidden">
            <Image src={'/images/profile_3.jpg'} alt='client_image' className='rounded-full object-cover' fill priority />
          </div>
          <div>
            <p className='lg:text-sm text-xs uppercase font-semibold'>salomi onome</p>
            <p className='text-sm font-medium'>salomi_onoms</p>
            <p className='text-sm font-medium'>07037575894</p>
            <p className='text-sm font-medium'>onomesalomi@gmail.com</p>
          </div>
        </div>
        <CountdownTimer dateString='2025-03-30T18:27:52.640+00:00' />
      </div>
    </div>
  )
}

export default ClientCard
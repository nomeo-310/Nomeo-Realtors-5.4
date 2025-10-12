'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CountdownTimerProps {
  dateString: string;
  onOpenReminder: () => void;
  onOpenContact: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({dateString, onOpenReminder, onOpenContact}) => {

  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(null);
  const [months, setMonths] = React.useState(0);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [isOverdue, setIsOverdueLocal] = React.useState(false);

  const calculateMonthsDiff = (date1: Date, date2: Date): number => {
    const earlier = date1 < date2 ? date1 : date2;
    const later = date1 < date2 ? date2 : date1;
    let months = (later.getFullYear() - earlier.getFullYear()) * 12;
    months += later.getMonth() - earlier.getMonth();
    if (later.getDate() < earlier.getDate()) months--;
    return Math.max(months, 0);
  };

  const getStatusMessage = (overdue: boolean, months: number, days: number): string => {
    if (overdue) {
      if (months === 1) return 'One month overdue.';
      if (months === 2) return 'Two months overdue.';
      if (months >= 3) return 'Three or more months overdue.';
      return `Overdue by ${days} days.`;
    } else {
      if (months === 1) return 'One month remaining.';
      if (months === 2) return 'Two months remaining.';
      if (months === 3) return 'Three months remaining.';
      return '';
    }
  };

  const getStatusColor = (overdue: boolean, months: number) => {
    if (overdue) {
      return months === 1 ? "text-red-500" :
             months === 2 ? "text-red-600" :
             months >= 3 ? "text-red-700" : "text-red-400";
    }
    
    return months === 1 ? "text-green-500" :
           months === 2 ? "text-green-600" :
           months === 3 ? "text-green-700" : "text-green-400";
  };

  React.useEffect(() => {
    if (!dateString) {
      setMessage('No date provided.');
      setLoading(false);
      return;
    }

    let targetDate: Date;
    try {
      targetDate = new Date(dateString);
      if (isNaN(targetDate.getTime())) throw new Error('Invalid date');
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    } catch {
      setMessage('Invalid date provided.');
      setLoading(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      const overdue = difference <= 0;
      const diff = Math.abs(difference);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const monthsDiff = calculateMonthsDiff(now, targetDate);
      
      setTimeLeft({ days, hours, minutes, seconds });
      setIsOverdueLocal(overdue);
      setMonths(monthsDiff);
      setLoading(false);

      setMessage(getStatusMessage(overdue, monthsDiff, days));
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [dateString]);

  const TimeUnit = ({ value, unit }: { value: number; unit: string }) => (
    <div className="md:h-[80px] w-full rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold font-quicksand flex-col gap-1">
      {value} <span className="text-xs uppercase">{unit}</span>
    </div>
  );

  return (
    <div className="md:w-[380px] w-full">
      <div className="flex items-center gap-4">
        {months < 4 && (
          <button 
            className="text-xs uppercase font-medium px-3 py-0.5 rounded-full border" 
            onClick={onOpenReminder}
          >
            Send Reminder
          </button>
        )}
        <button className="text-xs uppercase font-medium px-3 py-0.5 rounded-full border"
          onClick={onOpenContact}
        >
          Contact User
        </button>
      </div>
      
      <div className="py-2">
        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : timeLeft ? (
          <>
            <div className="w-full md:h-[90px] h-[75px] flex items-center justify-between gap-2">
              <TimeUnit value={timeLeft.days} unit="days" />
              <span className="text-4xl font-extrabold mb-4">:</span>
              <TimeUnit value={timeLeft.hours} unit="hours" />
              <span className="text-4xl font-extrabold mb-4">:</span>
              <TimeUnit value={timeLeft.minutes} unit="mins" />
              <span className="text-4xl font-extrabold mb-4">:</span>
              <TimeUnit value={timeLeft.seconds} unit="secs" />
            </div>
            
            <p className={cn("text-sm mt-2 text-center font-bold uppercase", getStatusColor(isOverdue, months))}>
              {isOverdue 
                ? `Overdue by ${months} month${months === 1 ? '' : 's'}` 
                : `${months} month${months === 1 ? '' : 's'} remaining`
              }
            </p>
          </>
        ) : (
          <div className="text-center text-gray-700">{message}</div>
        )}
      </div>
      
      {message && !loading && (
        <p className={cn(
          "text-xs md:text-sm p-2 rounded-lg text-center uppercase font-bold",
          isOverdue ? 'bg-red-100 text-red-400' : 'bg-gray-50 text-gray-700'
        )}>
          {message}
        </p>
      )}
    </div>
  );
};
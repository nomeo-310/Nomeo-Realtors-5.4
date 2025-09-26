import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const validatePhoneNumber = (phoneNumber:string) => {
  const phoneRegex = /^\d{11}$/;
  const phoneNumberStartValue = phoneNumber.slice(0,4);
  const startValueList = [
    '0701', '0703', '0704', '0705', '0706', '0707', '0708', '0802','0803','0804','0805','0806','0807','0808','0809','0810','0811','0812','0813',
    '0814','0815','0816','0817','0818','0819','0909','0908','0901','0902','0903','0904','0905','0906','0907','0915','0913','0912','0916','0911'];

  const isElevenDigits = phoneRegex.test(phoneNumber);
  const isValidPhoneNumber = startValueList.includes(phoneNumberStartValue) && !Number.isNaN(Number(phoneNumber));

  return isElevenDigits && isValidPhoneNumber
};

export const formatDate = (date:string):string => {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const dateValue = newDate.getDate();
  const month = newDate.getMonth();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  const formatedDate = dateValue + ' ' + months[month]+',' + ' ' + year;

  return formatedDate;
};

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const newDate = new Date(date);

  const timezoneOffsetMinutes = now.getTimezoneOffset();

  const timezoneOffsetMilliseconds = timezoneOffsetMinutes * 60 * 1000;

  const localNewDate = new Date(newDate.getTime() - timezoneOffsetMilliseconds);

  const diffInMs = now.getTime() - localNewDate.getTime();

  if (diffInMs < 60000) {
    return 'just now';
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return rtf.format(-days, 'day');
  } else if (hours > 0) {
    return rtf.format(-hours, 'hour');
  } else if (minutes > 0) {
    return rtf.format(-minutes, 'minute');
  } else {
    return rtf.format(-seconds, 'second');
  }
};

export const nairaSign:string = String.fromCodePoint(8358);

const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export const formatDateWithOrdinal = (isoString: string): string => {
  try {
    const date = parseISO(isoString);
    const day = format(date, 'd');
    const dayWithOrdinal = `${day}${getOrdinal(parseInt(day, 10))}`;
    const formattedDate = format(date, 'MMMM yyyy');
    return `${dayWithOrdinal} ${formattedDate}`;
  } catch (error) {
    console.error('Error parsing the ISO string:', error);
    return 'Invalid Date';
  }
}

export const capitalizeName = (name: string): string  => {
  if (!name) {
    return "";
  }

  const firstLetter = name.charAt(0).toUpperCase();
  const restOfName = name.slice(1);
  
  return firstLetter + restOfName;
};

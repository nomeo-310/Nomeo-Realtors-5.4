import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nairaSign:string = String.fromCodePoint(8358);

export const getUserRole = (role: string): 'SUPERADMIN' | 'ADMIN' | 'CREATOR' | 'USER' => {
  switch (role.toLowerCase()) {
    case 'superadmin':
      return 'SUPERADMIN';
    case 'admin':
      return 'ADMIN';
    case 'creator':
      return 'CREATOR';
    default:
      return 'USER';
  }
};

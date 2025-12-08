import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

interface ActionResponse {
  success: boolean;
  message: string;
  status?: number;
  data?: any
}

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

export const createSuccessResponse = ( message: string, status = 200, data?: any): ActionResponse => ({
  success: true, message, status, data
});

export const createErrorResponse = ( message: string, status = 500, data?: any): ActionResponse => ({
  success: false, message, status, data
});

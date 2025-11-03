import { AdminDetailsProps } from "@/lib/types";
import { IUser } from "@/models/user";

export const isUser = (user: any): user is IUser => {
  return user && typeof user === 'object' && 'profileImage' in user;
};

export const isAdminDetails = (user: any): user is AdminDetailsProps => {
  return user && typeof user === 'object' && 'adminId' in user;
};
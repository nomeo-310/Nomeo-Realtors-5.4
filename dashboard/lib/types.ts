export type BasicUserProps = {
  _id: string;
  password: string;
  email: string;
  surName: string;
  lastName: string;
  profilePicture: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
}

export type AdminDetailsProps = {
  _id: string;
  userId: {
    email: string; 
    surName: string; 
    lastName: string; 
    placeholderColor: string;
    profilePicture: string;
  };
  role: string;
  adminAccess: 'full_access' | 'limited_access' | 'no_access';
  adminPermissions: string[];
  adminId: string;
  isActivated: boolean;
  activatedAt: Date;
  activatedBy: string;
  accessId: string;
  accessIdExpires?:  number;
  otp?: string;
  otpExpiresIn?: number;
  resetAccessIdOtp?: string;
  resetAccessIdOtpExpiresIn?: number;
  lockUntil?: Date;
  deactivatedAt: Date;
  deactivatedBy: string;
  adminOnboarded: boolean;
  createdBy:  string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationProps {
  _id: string;
  type: 'notification' | 'inspection' | 'rentouts' | 'verification' | 'pending' | 'payment' | 'add-clients' | 'profile' | 'blog-invitation';
  title: string;
  content: string;
  propertyId?: string;
  blogId?: string;
  issuer?: {
    _id: string;
    surName: string;
    lastName: string;
    profilePicture: string;
    phoneNumber: string;
  };
  recipient?: {
    _id: string;
    surName: string;
    lastName: string;
    profilePicture: string;
    phoneNumber: string;
  };
  agentId?: {
    _id: string,
    userId: {
      _id: string,
      email: string,
      lastName: string;
      profilePicture: string;
      phoneNumber: string;  
      surName: string;
    },
    agencyName: string,
    officeAddress: string
    officeNumber: string
  },
  inspectionId?: string;
  seen: boolean;
  createdAt: string;
}
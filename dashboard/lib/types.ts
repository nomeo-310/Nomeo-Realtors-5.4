export interface BasicUserProps {
  _id: string;
  password: string;
  email: string;
  surName: string;
  lastName: string;
  profilePicture: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
}

export interface ExtendedUserProps extends BasicUserProps {
  city: string;
  state: string;
  placeholderColor: string;
  userVerified: boolean;
  username: string;
  createdAt: string;
  phoneNumber: string;
  userAccountSuspended: boolean;
  suspendedBy: string;
  deletedAt: string;
  deletedBy: string;
}

export interface BasicAgentProps extends ExtendedUserProps {
  agentId : {
    _id: string;
    agentVerified: boolean;
    licenseNumber: string;
    officeNumber: string;
    agencyName: string;
    verificationStatus: string;
  }
}

export interface AdminDetailsProps {
  _id: string;
  userId: {
    _id: string;
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
  isSuspended: boolean;
  adminOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface FullAdminDetailsProps extends AdminDetailsProps {
  activatedAt: string;
  activatedBy: string;
  suspendedAt: string;
  suspendedBy: string;
  suspensionReason: string;
  password?: string;
  passwordAdded: boolean;
  accessId: string;
  accessIdExpires?: number;
  otp?: string;
  otpExpiresIn?: number;
  resetAccessIdOtp?: string;
  resetAccessIdOtpExpiresIn?: number;
  lockUntil?: string;
  deactivatedAt: string;
  deactivatedBy: string;
  deactivationReason: string;
  reactivatedAt: string;
  reactivatedBy: string;
  adminOnboarded: boolean;
  createdBy: string;
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
};

export interface VerificationPropertyProps {
  _id: string;
  propertyTag: string;
  propertyTypeTag: string;
  propertyIdTag: string;
  city: string;
  state: string;
  propertyPrice: number;
  annualRent: number;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  propertyApproval: boolean
  agent: {
    _id: string;
    userId: {
      _id: string;
      email: string;
      lastName: string;
      profilePicture: string;
      phoneNumber: string;
      surName: string;
    };
    agencyName: string;
  };
  createdAt: string;
  updatedAt: string;
};

export interface VerificationRentalProps {
  _id: string;
  user: {
    _id: string;
    email: string;
    placeholderColor: string;
    lastName: string;
    profilePicture: string;
    surName: string;
  };
  apartment: {
    _id: string;
    propertyTag: string;
    propertyIdTag: string;
    city: string;
    state: string;
    annualRent: number;
  };
  agent: {
    _id: string;
    userId: {
      _id: string;
      email: string;
      placeholderColor: string;
      lastName: string;
      profilePicture: string;
      surName: string;
    };
    agencyName: string;
  };
  rented: boolean;
  status: string;
  startDate: string;
  endDate: string;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VerificationSalesProps {
  _id: string;
  user: {
    _id: string;
    email: string;
    placeholderColor: string;
    lastName: string;
    profilePicture: string;
    surName: string;
  };
  apartment: {
    _id: string;
    propertyTag: string;
    propertyIdTag: string;
    city: string;
    state: string;
    propertyPrice: number;
  };
  agent: {
    _id: string;
    userId: {
      _id: string;
      email: string;
      placeholderColor: string;
      lastName: string;
      profilePicture: string;
      surName: string;
    };
    agencyName: string;
  };
  sold: boolean;
  status: string;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type Fee = {
  name: string;
  amount: number;
};

type Landmark = {
  name: string;
  distanceAway: string;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  perPage: number,
}

export interface PropertyProps {
  _id: string;
  propertyTag: string;
  propertyIdTag: string;
  propertyTypeTag: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  monthlyRent: number;
  propertyPrice: number;
  annualRent: number;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  mainAmenities: string[];
  optionalAmenities: string[];
  squareFootage: number;
  hideProperty: boolean;
  mainFees: Fee[];
  optionalFees: Fee[];
  closestLandmarks: Landmark[];
  apartmentImages: {
    _id: string;
    images: string[];
  };
  agent: {
    _id: string;
    licenseNumber: string; 
    coverPicture: string; 
    officeNumber: string; 
    officeAddress: string; 
    agencyName: string; 
    agentRatings: string; 
    agentVerified: boolean; 
    verificationStatus: string; 
    inspectionFeePerHour: number; 
    apartments: string[];
    userId: {
      _id: string;
      username: string; 
      email: string; 
      surName: string; 
      lastName: string; 
      profilePicture: string; 
      bio: string; 
      address: string; 
      city: string; 
      state: string; 
      phoneNumber: string; 
      additionalPhoneNumber: string; 
      role: string;
    }
  };
  availabilityStatus: string;
  furnitureStatus: string;
  facilityStatus: string;
  likes: string[];
  propertyApproval: string;
  bookmarks: string[];
};

interface SuspensionHistory {
  _id: string;
  action: 'suspension' | 'lift' | 'extension' | 'appeal' | 'appeal_approved' | 'appeal_rejected' | 'auto_lift';
  description: string;
  performedBy: string;
  performedAt: string;
  reason: string;
  data?: {
    category?: string;
    suspensionCount?: number;
    originalSuspensionId?: string;
    appealDate?: string;
  };
  duration?: '3_days' | '7_days' | '30_days' | 'permanent';
}

interface UserDetails {
  _id: string;
  email: string;
  role: string;
  additionalPhoneNumber?: string;
  bio?: string;
  city: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
  state: string;
  surName: string;
  agentId?: string | AgentId | null;
}

interface AgentId {
  _id: string;
  agencyName: string;
  officeAddress: string;
  officeNumber: string;
  licenseNumber?: string;
  inspectionFeePerHour?: number;
  agentVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface SuspensionData {
  _id: string;
  user: UserDetails;
  isActive: boolean;
  suspendedUntil: string;
  history: SuspensionHistory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface userProps {
  _id: string;
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  surName?: string;
  lastName?: string;
  profilePicture?: string;
  profileImage?: {
    public_id?: string;
    secure_url?: string;
  };
  bio?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  refreshToken?: string;
  otp?: string;
  otpExpiresIn?: number | null;
  resetPasswordOtp?: string;
  placeholderColor?: string;
  resetPasswordOtpExpresIn?: number | null;
  userOnboarded?: boolean;
  profileCreated?: boolean;
  userVerified?: boolean;
  userIsAnAgent?: boolean;
  userAccountDeleted:  boolean;
  userAccountSuspended: boolean;
  showLikedApartments: boolean;
  showBookmarkedApartments: boolean;
  showLikedBlogs: boolean;
  showBookmarkedBlogs: boolean;
  subscribedToNewsletter?: boolean;
  blogCollaborator: boolean;
  collaborations: string[];
  createdBlogs: string[];
  agentId?: string;
  notifications?: string[];
  likedApartments?: string[];
  bookmarkedApartments?: string[];
  likedBlogs?: string[];
  bookmarkedABlogs?: string[];
  comments?: string[];
  propertyAgents?: string[];
  propertiesRented?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type Image = {
  public_id: string;
  secure_url: string;
};

export interface userDetails {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  profileImage?: Image;
  bio?: string;
  phoneNumber?: string;
  additionalPhoneNumber?:string;
  address?: string;
  city?: string;
  state?: string;
  role: 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';
  placeholderColor: string;
  userOnboarded: boolean;
  profileCreated: boolean;
  userVerified: boolean;
};

export interface notificationProps {
  _id: string;
  type: 'notification' | 'inspection' | 'rentouts' | 'verification' | 'pending' | 'payment' | 'add-clients' | 'profile' | 'blog-invitation';
  title: string;
  content: string;
  propertyId?: string;
  blogId?: string;
  issuer?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    phoneNumber: string;
  };
  recipient?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    phoneNumber: string;
  };
  seen: boolean;
  createdAt: string;
}

export interface userProfile {
  _id: string; 
  username: string; 
  surName: string; 
  lastName: string; 
  role: string; 
  email: string; 
  profilePicture: string; 
  bio: string; 
  phoneNumber: string; 
  city: string; 
  state: string;
  userVerified: boolean; 
  additionalPhoneNumber: string;
  agentId: {
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
    clients: string[];
    createdAt: string;
  }
};

type Fee = {
  name: string;
  amount: number;
};

type Landmark = {
  name: string;
  distanceAway: string;
};

export interface propertyProps {
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
      firstName: string; 
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
  bookmarks: string[];
};

export interface agentProps {
  _id: string;
  agentVerified: boolean;
  verificationStatus: string;
  inspectionFeePerHour: number;
  userId: string;
  inspections: string[];
  apartments: string[];
  clients: string[],
  getListings: boolean,
  isACollaborator: boolean,
  createdAt: string;
  updatedAt: string;
  licenseNumber: string;
  agencyName: string;
  officeAddress: string;
  officeNumber: string;
};

export interface latestBlogProps {
  banner: {
  public_id: string;
  secure_url: string;
  }
  _id: string;
  title: string;
  description: string;
  author: {
    firstName?: string; 
    lastName?: string; 
    profilePicture?: string; 
    email: string; 
    username?: string;
    role: string;
    placeholderColor: string;
  };
  collaboration: boolean;
  collaborators: {
    firstName?: string; 
    lastName?: string; 
    profilePicture?: string; 
    email: string; 
    username?: string;
    role: string;
    placeholderColor: string;
  }[];
  total_likes: number;
  total_comments: number;
  total_saves: number;
  total_reads: number;
  reads: string[];
  likes: string[];
  saves: string[];
  read_time: number;
  created_at: string;
};

export interface userBlogData {
  blogs: Blog[];
  pagination: Pagination;
};

export interface Blog {
  banner: {
    public_id: string;
    secure_url: string;
  };
  total_reads: number;
  reads: string[];
  _id: string;
  title: string;
  description: string;
  is_published: boolean,
  author: userDetailsProps;
  collaboration: boolean;
  collaborators: userDetailsProps[];
  total_likes: number;
  total_comments: number;
  total_saves: number;
  likes: string[];
  saves: string[];
  read_time: number;
  created_at: string;
}

interface userDetailsProps {
  _id: string;
  username: string;
  email: string;
  role: string;
  placeholderColor: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};


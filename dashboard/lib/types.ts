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
};

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

{
    "_id": "6902175a32db6b526366259d",
    "user": {
        "_id": "68c2769bcc44d66269abe100",
        "email": "olatayomakinde@gmail.com",
        "placeholderColor": "#7D7A81",
        "lastName": "Olatayo",
        "profilePicture": "https://res.cloudinary.com/dqj9nko02/image/upload/v1757577875/profileImages/cszlpgzwxk436woax0er.jpg",
        "surName": "Makinde"
    },
    "apartment": {
        "_id": "68f62e643dbece5fe90bd197",
        "propertyTag": "for-rent",
        "propertyIdTag": "apartment-0c5274",
        "city": "Abeokuta-South",
        "state": "Ogun",
        "propertyPrice": 0
    },
    "agent": {
        "_id": "68c394d6d78636f5c6c88029",
        "userId": {
            "_id": "68c394d5d78636f5c6c88027",
            "email": "onomesalomi@gmail.com",
            "placeholderColor": "#D71AB0",
            "lastName": "Onome",
            "profilePicture": "https://res.cloudinary.com/dqj9nko02/image/upload/v1757648182/profileImages/ljkgbxrovdbwlmazvvtd.jpg",
            "surName": "Salomi"
        },
        "agencyName": "Salbio Realtors Inc"
    },
    "sold": false,
    "status": "pending",
    "createdAt": "2025-10-29T13:32:10.514Z",
    "updatedAt": "2025-10-29T13:32:10.514Z",
    "__v": 0
}

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
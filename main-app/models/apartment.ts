import mongoose, { Schema, Types, Document, Model } from 'mongoose';

type Fee = {
  name: string;
  amount: number;
};

type Landmark = {
  name: string;
  distanceAway: string;
};

interface IApartment extends Document {
  propertyTag: 'for-rent' | 'for-sale';
  propertyIdTag?: string;
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
  apartmentImages: Types.ObjectId;
  agent: Types.ObjectId;
  availabilityStatus: 'available' | 'rented' | 'pending';
  furnitureStatus: 'furnished' | 'non furnished';
  facilityStatus: 'service' | 'non service';
  propertyApproval: 'approved' | 'pending' | 'unapproved';
  bookmarks: Types.ObjectId[];
  likes: Types.ObjectId[];
  reviews: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const apartmentSchema: Schema<IApartment> = new Schema(
  {
    propertyTag: { 
      type: String, 
      enum: ['for-rent', 'for-sale'], 
      default: 'for-rent',
      index: true 
    },
    propertyTypeTag: { 
      type: String, 
      default: undefined,
      index: true 
    },
    propertyIdTag: { 
      type: String, 
      default: undefined,
      index: true 
    },
    title: { 
      type: String, 
      default: undefined,
      index: true 
    },
    description: { 
      type: String, 
      default: undefined,
      index: true 
    },
    address: { 
      type: String, 
      default: undefined,
      index: true 
    },
    city: { 
      type: String, 
      default: undefined,
      index: true 
    },
    state: { 
      type: String, 
      default: undefined,
      index: true 
    },
    mainAmenities: [{ 
      type: String, 
      default: undefined 
    }],
    optionalAmenities: [{ 
      type: String, 
      default: undefined 
    }],
    monthlyRent: { 
      type: Number, 
      default: 0,
      index: true 
    },
    propertyPrice: { 
      type: Number, 
      default: 0,
      index: true 
    },
    annualRent: { 
      type: Number, 
      default: 0,
      index: true 
    },
    bedrooms: { 
      type: Number, 
      default: 0,
      index: true 
    },
    bathrooms: { 
      type: Number, 
      default: 0,
      index: true 
    },
    toilets: { 
      type: Number, 
      default: 0,
      index: true 
    },
    squareFootage: { 
      type: Number, 
      default: 0,
      index: true 
    },
    hideProperty: {
      type: Boolean, 
      default: false,
      index: true 
    },
    mainFees: [{ 
      name: { type: String, default: undefined }, 
      amount: { type: Number, default: 0 } 
    }],
    optionalFees: [{ 
      name: { type: String, default: undefined }, 
      amount: { type: Number, default: 0 } 
    }],
    closestLandmarks: [{ 
      name: { type: String, default: undefined }, 
      distanceAway: { type: String, default: undefined } 
    }],
    apartmentImages: { 
      type: Schema.Types.ObjectId, 
      ref: 'Attachment',
      index: true 
    },
    agent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Agent',
      index: true 
    },
    bookmarks: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    likes: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    reviews: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Review' 
    }],
    availabilityStatus: { 
      type: String, 
      enum: ['available', 'rented', 'pending'], 
      default: 'available',
      index: true 
    },
    propertyApproval: { 
      type: String, 
      enum: ['approved', 'pending', 'unapproved'], 
      default: 'unapproved',
      index: true 
    },
    furnitureStatus: { 
      type: String, 
      enum: ['furnished', 'non furnished'], 
      default: 'non furnished',
      index: true 
    },
    facilityStatus: { 
      type: String, 
      enum: ['service', 'non service'], 
      default: 'non service',
      index: true 
    },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
apartmentSchema.index({ propertyTag: 1, availabilityStatus: 1 });
apartmentSchema.index({ propertyTag: 1, propertyApproval: 1 });
apartmentSchema.index({ city: 1, state: 1 });
apartmentSchema.index({ city: 1, propertyTag: 1 });
apartmentSchema.index({ state: 1, propertyTag: 1 });
apartmentSchema.index({ monthlyRent: 1, propertyTag: 1 });
apartmentSchema.index({ propertyPrice: 1, propertyTag: 1 });
apartmentSchema.index({ bedrooms: 1, bathrooms: 1 });
apartmentSchema.index({ squareFootage: 1, propertyTag: 1 });
apartmentSchema.index({ agent: 1, propertyApproval: 1 });
apartmentSchema.index({ agent: 1, availabilityStatus: 1 });
apartmentSchema.index({ availabilityStatus: 1, propertyApproval: 1 });
apartmentSchema.index({ createdAt: -1, propertyApproval: 1 });
apartmentSchema.index({ updatedAt: -1, propertyApproval: 1 });
apartmentSchema.index({ furnitureStatus: 1, facilityStatus: 1 });

// Price range indexes
apartmentSchema.index({ monthlyRent: 1, bedrooms: 1, city: 1 });
apartmentSchema.index({ propertyPrice: 1, bedrooms: 1, city: 1 });

// Multi-key indexes for array fields
apartmentSchema.index({ mainAmenities: 1 });
apartmentSchema.index({ optionalAmenities: 1 });
apartmentSchema.index({ bookmarks: 1 });
apartmentSchema.index({ likes: 1 });

// Text search index for property search
apartmentSchema.index({
  title: 'text',
  description: 'text',
  address: 'text',
  city: 'text',
  state: 'text'
});

// Geospatial index (if you add coordinates later)
// apartmentSchema.index({ location: '2dsphere' });

// Sparse indexes for optional fields
apartmentSchema.index({ propertyIdTag: 1 }, { sparse: true });
apartmentSchema.index({ apartmentImages: 1 }, { sparse: true });

// Popular properties index (based on engagement)
apartmentSchema.index({ 
  likes: -1, 
  bookmarks: -1, 
  propertyApproval: 1,
  availabilityStatus: 1 
});

// Simplified model creation
const Apartment: Model<IApartment> = mongoose.models.Apartment || 
  mongoose.model<IApartment>('Apartment', apartmentSchema);

export default Apartment;
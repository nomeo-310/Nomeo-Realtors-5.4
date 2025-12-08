import mongoose, { Schema, Document } from 'mongoose';

const PROPERTY_TAGS = ['for-rent', 'for-sale'] as const;
const AVAILABILITY_STATUS = ['available', 'rented', 'pending'] as const;
const APPROVAL_STATUS = ['approved', 'pending', 'unapproved'] as const;
const FURNITURE_STATUS = ['furnished', 'unfurnished'] as const;
const FACILITY_STATUS = ['serviced', 'unserviced'] as const;

export type PropertyTag = typeof PROPERTY_TAGS[number];
export type AvailabilityStatus = typeof AVAILABILITY_STATUS[number];
export type ApprovalStatus = typeof APPROVAL_STATUS[number];
export type FurnitureStatus = typeof FURNITURE_STATUS[number];
export type FacilityStatus = typeof FACILITY_STATUS[number];

type Fee = { name: string; amount: number };
type Landmark = { name: string; distanceAway: string };


export interface IApartment extends Document {
  // Core
  propertyTag: PropertyTag;
  propertyIdTag?: string;
  propertyTypeTag?: string;

  title: string;
  description: string;
  address: string;
  city: string;
  state: string;

  // Pricing
  monthlyRent: number;
  annualRent: number;
  propertyPrice: number;

  // Specs
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  squareFootage?: number;

  // Amenities & Fees
  mainAmenities: string[];
  optionalAmenities: string[];
  mainFees: Fee[];
  optionalFees: Fee[];
  closestLandmarks: Landmark[];

  // Relationships
  agent: mongoose.Types.ObjectId;
  apartmentImages?: mongoose.Types.ObjectId;
  bookmarks: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  reviews: mongoose.Types.ObjectId[];

  // Status
  availabilityStatus: AvailabilityStatus;
  propertyApproval: ApprovalStatus;
  furnitureStatus: FurnitureStatus;
  facilityStatus: FacilityStatus;

  hideProperty: boolean;
  hiddenAt?: Date;
  hiddenReason?: string;

  // Geolocation (RECOMMENDED!)
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SCHEMA ====================
const apartmentSchema = new Schema<IApartment>(
  {
    propertyTag: {
      type: String,
      enum: PROPERTY_TAGS,
      default: 'for-rent',
      index: true,
    },
    propertyIdTag: { type: String, unique: true, sparse: true },
    propertyTypeTag: String,

    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },

    monthlyRent: { type: Number, default: 0, min: 0 },
    annualRent: { type: Number, default: 0, min: 0 },
    propertyPrice: { type: Number, default: 0, min: 0 },

    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    toilets: { type: Number, default: 0, min: 0 },
    squareFootage: { type: Number, min: 0 },

    mainAmenities: [{ type: String }],
    optionalAmenities: [{ type: String }],
    mainFees: [{ name: String, amount: Number }],
    optionalFees: [{ name: String, amount: Number }],
    closestLandmarks: [{ name: String, distanceAway: String }],

    agent: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },
    apartmentImages: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },

    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],

    availabilityStatus: {
      type: String,
      enum: AVAILABILITY_STATUS,
      default: 'available',
      index: true,
    },
    propertyApproval: {
      type: String,
      enum: APPROVAL_STATUS,
      default: 'pending',
      index: true,
    },
    furnitureStatus: {
      type: String,
      enum: FURNITURE_STATUS,
      default: 'unfurnished',
    },
    facilityStatus: {
      type: String,
      enum: FACILITY_STATUS,
      default: 'unserviced',
    },

    hideProperty: { type: Boolean, default: false },
    hiddenAt: Date,
    hiddenReason: String,

    // Geospatial (HIGHLY RECOMMENDED)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


apartmentSchema.index({ location: '2dsphere' });

apartmentSchema.index(
  {
    title: 'text',
    description: 'text',
    address: 'text',
    city: 'text',
    state: 'text',
    mainAmenities: 'text',
  },
  {
    weights: {
      title: 10,
      description: 8,
      address: 7,
      city: 6,
      mainAmenities: 5,
    },
    name: 'apartment_search_text',
  }
);


apartmentSchema.index({ propertyTag: 1, propertyApproval: 1, availabilityStatus: 1 });
apartmentSchema.index({ city: 1, state: 1 });
apartmentSchema.index({ agent: 1, propertyApproval: 1 });
apartmentSchema.index({ propertyApproval: 1, createdAt: -1 }); // Admin pending list
apartmentSchema.index({ availabilityStatus: 1, propertyTag: 1 });

// Price + location + bedrooms (common filter)
apartmentSchema.index({ city: 1, bedrooms: 1, monthlyRent: 1 });
apartmentSchema.index({ city: 1, bedrooms: 1, propertyPrice: 1 });

// Engagement sorting
apartmentSchema.index({ 'likes.0': 1 }); // Has likes (avoid full array index)
apartmentSchema.index({ createdAt: -1 });


apartmentSchema.virtual('totalLikes').get(function () {
  return this.likes.length;
});

apartmentSchema.virtual('totalBookmarks').get(function () {
  return this.bookmarks.length;
});


apartmentSchema.pre('save', function (next) {
  if (!this.propertyIdTag) {
    const tag = `${this.propertyTag === 'for-rent' ? 'RENT' : 'SALE'}-${Date.now().toString(36).toUpperCase()}`;
    this.propertyIdTag = tag;
  }
  next();
});


const ApartmentModel =
  (mongoose.models.Apartment as mongoose.Model<IApartment>) ||
  mongoose.model<IApartment>('Apartment', apartmentSchema);

export default ApartmentModel;
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
}

const apartmentSchema: Schema<IApartment> = new Schema(
  {
    propertyTag: { type: String, enum: ['for-rent', 'for-sale'], default: 'for-rent' },
    propertyTypeTag: { type: String, default: undefined },
    propertyIdTag: { type: String, default: undefined},
    title: { type: String, default: undefined },
    description: { type: String, default: undefined },
    address: { type: String, default: undefined },
    city: { type: String, default: undefined },
    state: { type: String, default: undefined },
    mainAmenities: [{ type: String, default: undefined}],
    optionalAmenities: [{ type: String, default: undefined },],
    monthlyRent: { type: Number, default: 0 },
    propertyPrice:  { type: Number, default: 0 },
    annualRent:  { type: Number, default: 0 },
    bedrooms:  { type: Number, default: 0 },
    bathrooms:  { type: Number, default: 0 },
    toilets:  { type: Number, default: 0 },
    squareFootage:  { type: Number, default: 0 },
    hideProperty: {type: Boolean, default: false},
    mainFees: [{ name: { type: String, default: undefined }, amount: { type: Number, default: 0 } }],
    optionalFees: [{ name: { type: String, default: undefined }, amount: { type: Number, default: 0 } }],
    closestLandmarks: [{ name: { type: String, default: undefined }, distanceAway: { type: String, default: undefined } }],
    apartmentImages: { type: Schema.Types.ObjectId, ref: 'Attachment'},
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    availabilityStatus: { type: String, enum: ['available', 'rented', 'pending'], default: 'available' },
    propertyApproval: { type: String, enum: ['approved', 'pending', 'unapproved'], default: 'unapproved' },
    furnitureStatus: { type: String, enum: ['furnished', 'non furnished'], default: 'non furnished' },
    facilityStatus: { type: String, enum: ['service', 'non service'], default: 'non service' },
  },
  { timestamps: true }
);

let Apartment: Model<IApartment>;

try {
  Apartment = mongoose.model<IApartment>('Apartment');
} catch (error) {
  Apartment = mongoose.model<IApartment>('Apartment', apartmentSchema);
}

export default Apartment;
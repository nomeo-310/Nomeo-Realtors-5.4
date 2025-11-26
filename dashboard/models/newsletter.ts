import mongoose from "mongoose";

interface INewsletter extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema: mongoose.Schema<INewsletter> = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true
    },
  }, 
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
  }
);

// Unique partial index to ensure one subscription per user (if userId exists)
// This is the ONLY index needed for userId
newsletterSchema.index(
  { userId: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { userId: { $type: 'objectId' } }
  }
);

// FIXED: Improved model creation with better caching
let Newsletter: mongoose.Model<INewsletter>;

if (mongoose.models.Newsletter) {
  Newsletter = mongoose.models.Newsletter;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Newsletter model');
  }
} else {
  Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Newsletter model');
  }
}

export default Newsletter;
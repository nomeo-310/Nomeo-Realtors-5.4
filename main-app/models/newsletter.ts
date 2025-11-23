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
      ref: 'User',
      index: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      index: true 
    },
  }, 
  { timestamps: true }
);

// Compound indexes for common query patterns
newsletterSchema.index({ email: 1, userId: 1 });
newsletterSchema.index({ userId: 1 }, { sparse: true });
newsletterSchema.index({ createdAt: -1 });
newsletterSchema.index({ updatedAt: -1 });

// Unique partial index to ensure one subscription per user (if userId exists)
newsletterSchema.index(
  { userId: 1 }, 
  { 
    unique: true, 
    sparse: true,
    partialFilterExpression: { userId: { $type: 'objectId' } }
  }
);

// Simplified model creation
const Newsletter: mongoose.Model<INewsletter> = mongoose.models.Newsletter || 
  mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default Newsletter;
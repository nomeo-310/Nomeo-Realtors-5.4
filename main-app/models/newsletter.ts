import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  userId?: mongoose.Types.ObjectId;  
  email: string;                     
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, 
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Please enter a valid email address',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

newsletterSchema.virtual('isGuest').get(function () {
  return !this.userId;
});

newsletterSchema.pre('save', async function (next) {
  if (this.isModified('email')) {
    const existing = await mongoose.models.Newsletter.findOne({
      email: this.email,
      _id: { $ne: this._id },
    });
    if (existing) {
      const err = new Error('This email is already subscribed');
      (err as any).code = 11000; 
      return next(err);
    }
  }
  next();
});

const NewsletterModel =
  (mongoose.models.Newsletter as mongoose.Model<INewsletter> | undefined) ??
  mongoose.model<INewsletter>('Newsletter', newsletterSchema);

export default NewsletterModel;
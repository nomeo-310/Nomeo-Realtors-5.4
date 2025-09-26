import mongoose, { Schema, Types, Document, Model } from 'mongoose';

interface ISubscription extends Document {
  email: string;
  isUser: boolean;
  userId?: Types.ObjectId;
}

const subscriptionSchema: Schema<ISubscription> = new Schema({
  email: { type: String, required: true },
  isUser: { type: Boolean, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {timestamps: true});

let Subscription: Model<ISubscription>;

try {
  Subscription = mongoose.model<ISubscription>('Subscription');
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Subscription = mongoose.model<ISubscription>('Subscription');
  } else {
    Subscription = mongoose.model<ISubscription>('Transaction', subscriptionSchema);
  }
  Subscription = mongoose.model<ISubscription>('Transaction', subscriptionSchema);
}

export default Subscription; 
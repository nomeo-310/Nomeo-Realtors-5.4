import mongoose, { Schema, Types, Document, Model } from 'mongoose';

interface INotification extends Document {
  type: 'notification' | 'inspection' | 'rentouts' | 'verification' | 'pending' | 'payment' | 'add-clients' | 'profile' | 'blog-invitation';
  title: string;
  content: string;
  propertyId?: string;
  issuer?: Types.ObjectId;
  recipient?: Types.ObjectId;
  blogId?: Types.ObjectId;
  agentId?: Types.ObjectId;
  inspectionId?: Types.ObjectId;
  seen: boolean;
  createdAt: Date;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    type: {
      type: String,
      enum: ['notification', 'inspection', 'rentouts', 'verification', 'pending', 'payment', 'add-clients', 'profile', 'blog-invitation'],
      default: 'notification',
    },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    propertyId: { type: String, default: '' },
    issuer: { type: Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog' },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection' },
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

let Notification: Model<INotification>;

try {
  Notification = mongoose.model<INotification>('Notification');
} catch (error) {
  Notification = mongoose.model<INotification>('Notification', notificationSchema);
}

export default Notification;
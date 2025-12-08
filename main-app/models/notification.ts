import mongoose, { Schema, Document } from 'mongoose';

const NOTIFICATION_TYPES = [
  'notification',
  'inspection',
  'rentouts',
  'verification',
  'pending',
  'payment',
  'add-clients',
  'profile',
  'blog-invitation',
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

export interface INotification extends Document {
  type: NotificationType;
  title: string;
  content: string;

  issuer?: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;   
  blogId?: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  inspectionId?: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;

  seen: boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'notification',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },

    issuer: { type: Schema.Types.ObjectId, ref: 'User' },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    blogId: { type: Schema.Types.ObjectId, ref: 'Blog' },
    agentId: { type: Schema.Types.ObjectId, ref: 'User' },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection' },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Apartment' },

    seen: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });   
notificationSchema.index({ recipient: 1, seen: 1 });      
notificationSchema.index({ recipient: 1, isDeleted: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });    
notificationSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60, 
});

notificationSchema.virtual('isUnread').get(function () {
  return !this.seen;
});

const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<INotification> | undefined) ??
  mongoose.model<INotification>('Notification', notificationSchema);

export default NotificationModel;
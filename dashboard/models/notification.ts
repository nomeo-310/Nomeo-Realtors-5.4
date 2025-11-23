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
  updatedAt: Date;
}

const notificationSchema: Schema<INotification> = new Schema(
  {
    type: {
      type: String,
      enum: ['notification', 'inspection', 'rentouts', 'verification', 'pending', 'payment', 'add-clients', 'profile', 'blog-invitation'],
      default: 'notification',
      index: true
    },
    title: { 
      type: String, 
      default: '',
      index: true 
    },
    content: { 
      type: String, 
      default: '',
      index: true 
    },
    propertyId: { 
      type: String, 
      default: '',
      index: true 
    },
    issuer: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true 
    },
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true 
    },
    blogId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Blog',
      index: true 
    },
    agentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true 
    },
    inspectionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Inspection',
      index: true 
    },
    seen: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now,
      index: true 
    },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
notificationSchema.index({ recipient: 1, seen: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, seen: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ seen: 1, createdAt: -1 });
notificationSchema.index({ issuer: 1, recipient: 1 });
notificationSchema.index({ agentId: 1, type: 1 });
notificationSchema.index({ blogId: 1, type: 1 });
notificationSchema.index({ inspectionId: 1, type: 1 });
notificationSchema.index({ propertyId: 1, type: 1 });

// Text search index for notification content
notificationSchema.index({
  title: 'text',
  content: 'text'
});

// TTL index for automatic notification cleanup (optional - for old notifications)
// notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// Sparse indexes for optional fields
notificationSchema.index({ propertyId: 1 }, { sparse: true });
notificationSchema.index({ blogId: 1 }, { sparse: true });
notificationSchema.index({ agentId: 1 }, { sparse: true });
notificationSchema.index({ inspectionId: 1 }, { sparse: true });
notificationSchema.index({ issuer: 1 }, { sparse: true });

// Fixed model creation
const Notification: Model<INotification> = mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
import mongoose, { Schema, Types, Document, Model } from 'mongoose';

interface INotification extends Document {
  type: 'notification' | 'inspection' | 'rentouts' | 'verification' | 'pending' | 'payment' | 'add-clients' | 'profile' | 'blog-invitation';
  isDeleted: boolean;
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
      default: 'notification'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    title: { 
      type: String, 
      default: ''
    },
    content: { 
      type: String, 
      default: ''
    },
    propertyId: { 
      type: String, 
      default: ''
    },
    issuer: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    blogId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Blog'
    },
    agentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    inspectionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Inspection'
    },
    seen: { 
      type: Boolean, 
      default: false
    },
    createdAt: { 
      type: Date, 
      default: Date.now
    },
  },
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
  }
);

// FIXED: Keep only essential single field indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ seen: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isDeleted: 1 });
notificationSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
notificationSchema.index({ recipient: 1, seen: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, isDeleted: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// FIXED: Enable TTL for notification cleanup (good practice)
notificationSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

// FIXED: Improved model creation with better caching
let Notification: Model<INotification>;

if (mongoose.models.Notification) {
  Notification = mongoose.models.Notification;
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Using cached Notification model');
  }
} else {
  Notification = mongoose.model<INotification>('Notification', notificationSchema);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Created new Notification model');
  }
}

export default Notification;
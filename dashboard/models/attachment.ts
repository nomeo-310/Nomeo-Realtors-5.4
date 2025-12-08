import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface attachment {
  public_id: string;
  secure_url: string;
}

export interface IAttachment extends Document {
  agent: Types.ObjectId;
  property: Types.ObjectId;
  images: string[];
  attachments: attachment[];
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema: Schema<IAttachment> = new Schema(
  {
    agent: { 
      type: Schema.Types.ObjectId, 
      ref: 'Agent'
    },
    property: { 
      type: Schema.Types.ObjectId, 
      ref: 'Apartment'
    },
    images: [{ 
      type: String, 
      default: '' 
    }],
    attachments: [{ 
      public_id: { 
        type: String, 
        default: ''
      }, 
      secure_url: { 
        type: String, 
        default: ''
      } 
    }],
  },
  { 
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'development' // Disable auto-indexing in dev
  }
);

// FIXED: Keep only essential single field indexes
attachmentSchema.index({ agent: 1 });
attachmentSchema.index({ property: 1 });

// Compound indexes for common query patterns
attachmentSchema.index({ agent: 1, property: 1 });


// FIXED: Keep only essential multi-key index
attachmentSchema.index({ images: 1 });

// Unique compound index to prevent duplicate attachments for same property
attachmentSchema.index(
  { agent: 1, property: 1 }, 
  { unique: true }
);

let Attachment: Model<IAttachment>;

if (mongoose.models.Attachment) {
  Attachment = mongoose.models.Attachment;
} else {
  Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema);
}

export default Attachment;
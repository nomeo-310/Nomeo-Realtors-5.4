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
      ref: 'Agent',
      index: true 
    },
    property: { 
      type: Schema.Types.ObjectId, 
      ref: 'Apartment',
      index: true 
    },
    images: [{ 
      type: String, 
      default: '' 
    }],
    attachments: [{ 
      public_id: { 
        type: String, 
        default: '',
        index: true 
      }, 
      secure_url: { 
        type: String, 
        default: '',
        index: true 
      } 
    }],
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
attachmentSchema.index({ agent: 1, property: 1 });
attachmentSchema.index({ property: 1, createdAt: -1 });
attachmentSchema.index({ agent: 1, createdAt: -1 });
attachmentSchema.index({ 'attachments.public_id': 1 });
attachmentSchema.index({ 'attachments.secure_url': 1 });

// Multi-key indexes for array fields
attachmentSchema.index({ images: 1 });
attachmentSchema.index({ 'attachments.public_id': 1 }, { sparse: true });
attachmentSchema.index({ 'attachments.secure_url': 1 }, { sparse: true });

// Unique compound index to prevent duplicate attachments for same property
attachmentSchema.index(
  { agent: 1, property: 1 }, 
  { unique: true }
);

// Text search index for image URLs and public_ids (if search is needed)
attachmentSchema.index({
  'images': 'text',
  'attachments.public_id': 'text',
  'attachments.secure_url': 'text'
});

// Sparse indexes for optional relationships
attachmentSchema.index({ agent: 1 }, { sparse: true });
attachmentSchema.index({ property: 1 }, { sparse: true });

// Simplified model creation
const Attachment: Model<IAttachment> = mongoose.models.Attachment || 
  mongoose.model<IAttachment>('Attachment', attachmentSchema);

export default Attachment;
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface attachment {
  public_id: string;
  secure_url: string;
}

interface IAttachment extends Document {
  agent: Types.ObjectId;
  property: Types.ObjectId;
  images: string[];
  attachments: attachment[];
}

const attachmentSchema: Schema<IAttachment> = new Schema(
  {
    agent: { type: Schema.Types.ObjectId, ref: 'Agent'},
    property: { type: Schema.Types.ObjectId, ref: 'Apartment'},
    images: [{ type: String, default: '' }],
    attachments: [{ public_id: { type: String, default: '' }, secure_url: { type: String, default: '' } }],
  },
  { timestamps: true }
);

let Attachment: Model<IAttachment>;

try {
  Attachment = mongoose.model<IAttachment>('Attachment');
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Attachment = mongoose.model<IAttachment>('Attachment');
  } else {
    Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema);
  }
}

export default Attachment;
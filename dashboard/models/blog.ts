import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface attachment {
  public_id: string;
  secure_url: string;
}

interface IBlog extends Document {
  title: string;
  description: string;
  content?: string;  
  author: Types.ObjectId;
  collaboration: boolean;
  collaborators?: Types.ObjectId[];
  banner: attachment;
  total_likes: number;
  total_comments: number;
  total_saves: number;
  total_reads: number;
  likes: Types.ObjectId[];
  reads: Types.ObjectId[];
  comments: Types.ObjectId[];
  saves: Types.ObjectId[];
  is_draft: boolean;
  is_published: boolean;
  is_deleted: boolean;
  read_time: number;
  blog_approval: 'approved' | 'pending' | 'unapproved';
  guest_readers: string[],
  created_at: Date;
  updated_at: Date;
}

const blogSchema: Schema<IBlog> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, default: ''},
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaboration: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    banner: {public_id: { type: String, required: true }, secure_url: { type: String, required: true },},
    total_likes: { type: Number, default: 0 },
    total_comments: { type: Number, default: 0 },
    total_saves: { type: Number, default: 0 },
    total_reads: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    saves: [{ type: Schema.Types.ObjectId, ref: "User" }],
    is_draft: { type: Boolean, default: true },
    is_published: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    read_time: { type: Number, default: 0, required: true },
    blog_approval: { type: String, enum: ['approved', 'pending', 'unapproved'], default: 'unapproved' },
    guest_readers: [{ type: String }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

let Blog: Model<IBlog>;

try {
  Blog = mongoose.model<IBlog>("Blog");
} catch (error) {
  if (error instanceof mongoose.Error.OverwriteModelError) {
    Blog = mongoose.model<IBlog>("Blog");
  } else {
    Blog = mongoose.model<IBlog>("Blog", blogSchema);
  }
}

export default Blog;

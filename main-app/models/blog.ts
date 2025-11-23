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
  guest_readers: string[];
  created_at: Date;
  updated_at: Date;
}

const blogSchema: Schema<IBlog> = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      index: true 
    },
    description: { 
      type: String, 
      required: true,
      index: true 
    },
    content: { 
      type: String, 
      default: '',
      index: true 
    },
    author: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    collaboration: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    collaborators: [{ 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    }],
    banner: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    total_likes: { 
      type: Number, 
      default: 0,
      index: true 
    },
    total_comments: { 
      type: Number, 
      default: 0,
      index: true 
    },
    total_saves: { 
      type: Number, 
      default: 0,
      index: true 
    },
    total_reads: { 
      type: Number, 
      default: 0,
      index: true 
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reads: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    saves: [{ type: Schema.Types.ObjectId, ref: "User" }],
    is_draft: { 
      type: Boolean, 
      default: true,
      index: true 
    },
    is_published: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    is_deleted: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    read_time: { 
      type: Number, 
      default: 0, 
      required: true,
      index: true 
    },
    blog_approval: { 
      type: String, 
      enum: ['approved', 'pending', 'unapproved'], 
      default: 'unapproved',
      index: true 
    },
    guest_readers: [{ type: String }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
blogSchema.index({ author: 1, is_published: 1 });
blogSchema.index({ author: 1, is_draft: 1 });
blogSchema.index({ is_published: 1, blog_approval: 1 });
blogSchema.index({ is_published: 1, is_deleted: 1 });
blogSchema.index({ blog_approval: 1, created_at: -1 });
blogSchema.index({ total_likes: -1, is_published: 1 });
blogSchema.index({ total_reads: -1, is_published: 1 });
blogSchema.index({ total_saves: -1, is_published: 1 });
blogSchema.index({ read_time: 1, is_published: 1 });
blogSchema.index({ collaboration: 1, is_published: 1 });
blogSchema.index({ created_at: -1, is_published: 1 });
blogSchema.index({ updated_at: -1, is_published: 1 });

// Text search index for blog content search
blogSchema.index({
  title: 'text',
  description: 'text',
  content: 'text'
});

// Multi-key index for collaborators array
blogSchema.index({ collaborators: 1 });

// Index for guest readers (if frequently queried)
blogSchema.index({ guest_readers: 1 }, { sparse: true });

// Popular blogs index (combination of engagement metrics)
blogSchema.index({ 
  total_likes: -1, 
  total_reads: -1, 
  total_comments: -1, 
  is_published: 1 
});

// Admin moderation index
blogSchema.index({ 
  blog_approval: 1, 
  is_published: 1, 
  created_at: -1 
});

// Simplified model creation
const Blog: Model<IBlog> = mongoose.models.Blog || 
  mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;
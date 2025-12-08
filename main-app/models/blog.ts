import mongoose, { Schema, Document } from 'mongoose';

const BLOG_APPROVAL = ['approved', 'pending', 'unapproved'] as const;
export type BlogApproval = typeof BLOG_APPROVAL[number];

type CloudinaryImage = {
  public_id: string;
  secure_url: string;
};

export interface IBlog extends Document {
  title: string;
  description: string;
  content?: string;
  author: mongoose.Types.ObjectId;
  collaboration: boolean;
  collaborators?: mongoose.Types.ObjectId[];
  banner: CloudinaryImage;
  likes: mongoose.Types.ObjectId[];
  saves: mongoose.Types.ObjectId[];
  reads: mongoose.Types.ObjectId[]; 
  comments: mongoose.Types.ObjectId[];
  guest_readers: string[];
  is_draft: boolean;
  is_published: boolean;
  is_deleted: boolean;
  blog_approval: BlogApproval;
  read_time: number;
  total_likes: number;
  total_saves: number;
  total_reads: number;
  total_comments: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, default: '' },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaboration: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    banner: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },

    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reads: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],

    guest_readers: [{ type: String }], // IPs

    is_draft: { type: Boolean, default: true, index: true },
    is_published: { type: Boolean, default: false, index: true },
    is_deleted: { type: Boolean, default: false, index: true },

    blog_approval: {
      type: String,
      enum: BLOG_APPROVAL,
      default: 'pending',
      index: true,
    },

    read_time: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blogSchema.virtual('total_likes').get(function () {
  return this.likes.length;
});
blogSchema.virtual('total_saves').get(function () {
  return this.saves.length;
});
blogSchema.virtual('total_comments').get(function () {
  return this.comments.length;
});
blogSchema.virtual('total_reads').get(function () {
  return this.reads.length + this.guest_readers.length;
});

blogSchema.index({ is_published: 1, blog_approval: 1 });
blogSchema.index({ is_published: 1, createdAt: -1 });   
blogSchema.index({ author: 1, is_published: 1 });
blogSchema.index({ blog_approval: 1, createdAt: -1 }); 
blogSchema.index({ is_draft: 1, author: 1 });

// Text search (highest priority fields)
blogSchema.index(
  {
    title: 'text',
    description: 'text',
    content: 'text',
  },
  {
    weights: { title: 10, description: 8, content: 5 },
    name: 'blog_search_text',
  }
);

// Hot/trending sort (use in aggregation)
blogSchema.index({ createdAt: -1 }); // Recent
blogSchema.index({ 'likes.0': 1 });  // Has likes (avoid full array index)


blogSchema.pre('save', function (next) {

  if (this.is_published && this.blog_approval === 'unapproved') {
    this.blog_approval = 'pending';
  }
  next();
});

const BlogModel =
  (mongoose.models.Blog as mongoose.Model<IBlog> | undefined) ??
  mongoose.model<IBlog>('Blog', blogSchema);

export default BlogModel;
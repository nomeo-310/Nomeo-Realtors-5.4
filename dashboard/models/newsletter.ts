import mongoose from "mongoose";

interface INewsletter extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  email: string
}

const newsletterSchema: mongoose.Schema<INewsletter> = new mongoose.Schema(
  {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true, unique: true, lowercase: true },
},{ timestamps: true });

let Newsletter: mongoose.Model<INewsletter>;

try {
  Newsletter = mongoose.model<INewsletter>('Newsletter');
} catch (error) {
  Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema);
}

export default Newsletter;
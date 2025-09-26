import mongoose from 'mongoose'

export const connectToMongoDB = async () => {
  const MONGODB_URI=process.env.MONGODB_URI as string;

  if (mongoose.connections[0].readyState) {
    return;
  };

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('mongodb connection is successful');
  } catch (error) {
    console.log("Error connecting to mongodb");
  }
};
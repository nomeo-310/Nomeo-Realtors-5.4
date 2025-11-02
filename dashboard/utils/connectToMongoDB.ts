import mongoose from 'mongoose'

export const connectToMongoDB = async () => {
  const MONGODB_URL=process.env.MONGODB_URL as string;

  if (mongoose.connections[0].readyState) {
    return;
  };

  try {
    await mongoose.connect(MONGODB_URL);
    console.log('mongodb connection is successful');
  } catch (error) {
    console.log("Error connecting to mongodb");
  }
};
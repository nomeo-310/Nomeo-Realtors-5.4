"use server";

import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Subscription from "@/models/subscription";
import User from "@/models/user";
import { getCurrentUser } from "./user-actions";
import { revalidatePath } from "next/cache";

// Database connection optimization
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await connectToMongoDB();
    isConnected = true;
  }
};

// Common validation functions
interface AuthValidationResult {
  success: boolean;
  message?: string;
  status?: number;
  currentUser?: any;
}

const validateUserAuth = async (): Promise<AuthValidationResult> => {
  const currentUser = await getCurrentUser();
  return { success: true, currentUser };
};

// Subscription Actions
export const subscribeUser = async ({ email, path }: { email: string; path: string }) => {
  await ensureConnection();

  try {
    const authResult = await validateUserAuth();
    const { currentUser } = authResult;

    // Check for existing subscription
    const [alreadySubscribed] = await Promise.all([
      Subscription.findOne({ email }),
      Promise.resolve()
    ]);

    if (alreadySubscribed) {
      return {
        success: false, 
        message: 'You have already subscribed to our newsletter', 
        status: 409
      };
    }

    // Prepare subscription data
    const subscriptionData = currentUser && currentUser.email === email
      ? { email, isUser: true, userId: currentUser._id }
      : { email, isUser: false };

    // Create subscription and update user in parallel
    const [subscription] = await Promise.all([
      Subscription.create(subscriptionData),
      currentUser 
        ? User.findOneAndUpdate(
            { email }, 
            { subscribedToNewsletter: true }
          )
        : Promise.resolve(null)
    ]);

    revalidatePath(path);

    return {
      success: true, 
      message: 'Subscription to newsletter was successful', 
      status: 200
    };
    
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      success: false, 
      message: 'Internal server error, try again later!', 
      status: 500
    };
  }
};

export const unSubscribeUser = async (path: string) => {
  await ensureConnection();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false, 
        message: 'You are not logged in, login to access this feature!', 
        status: 403
      };
    }

    await User.findOneAndUpdate(
      { _id: currentUser._id }, 
      { subscribedToNewsletter: false }
    );

    revalidatePath(path);

    return {
      success: true, 
      message: 'You have been removed from the subscription list', 
      status: 200
    };
    
  } catch (error) {
    console.error('Unsubscription error:', error);
    return {
      success: false, 
      message: 'Internal server error, try again later!', 
      status: 500
    };
  }
};
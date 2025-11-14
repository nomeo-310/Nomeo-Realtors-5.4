"use server";

// =============================================
// IMPORTS
// =============================================

// Database & Models
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Subscription from "@/models/subscription";
import User from "@/models/user";

// Actions & Utilities
import { getCurrentUser } from "./user-actions";
import { revalidatePath } from "next/cache";

// =============================================
// SUBSCRIPTION MANAGEMENT FUNCTIONS
// =============================================

/**
 * Subscribe a user to the newsletter
 * 
 * This function handles:
 * - New subscription creation for both authenticated users and guests
 * - Prevention of duplicate subscriptions
 * - User profile updates for authenticated subscribers
 * 
 * @param email - The email address to subscribe
 * @param path - The path to revalidate after operation
 * @returns API response indicating success or failure
 */
export const subscribeUser = async ({ email, path }: { email: string; path: string }) => {
  // Establish database connection
  await connectToMongoDB();

  // Get current authenticated user (if any)
  const currentUser = await getCurrentUser();

  // =============================================
  // PREPARE SUBSCRIPTION DATA
  // =============================================
  
  let subscriptionData;

  if (currentUser && currentUser.email === email) {
    // User is authenticated and email matches - create user-linked subscription
    subscriptionData = {
      email: email,
      isUser: true,
      userId: currentUser._id
    };
  } else {
    // User is not authenticated or email doesn't match - create guest subscription
    subscriptionData = {
      email: email,
      isUser: false
    };
  }

  // =============================================
  // CHECK FOR EXISTING SUBSCRIPTION
  // =============================================
  
  const alreadySubscribed = await Subscription.findOne({ email: email });

  try {
    // Prevent duplicate subscriptions
    if (alreadySubscribed) {
      return {
        success: false, 
        message: 'You have already subscribed to our newsletter', 
        status: 409
      };
    }

    // =============================================
    // CREATE SUBSCRIPTION RECORD
    // =============================================
    
    const subscription = await Subscription.create(subscriptionData);
    subscription.save();

    // =============================================
    // UPDATE USER PROFILE IF AUTHENTICATED
    // =============================================
    
    if (currentUser) {
      await User.findOneAndUpdate(
        { email: email }, 
        { subscribedToNewsletter: true }
      );
    }

    // =============================================
    // FINALIZE OPERATION
    // =============================================
    
    // Revalidate the page to show updated subscription status
    revalidatePath(path);

    return {
      success: true, 
      message: 'Subscription to newsletter was successful', 
      status: 200
    };
    
  } catch (error) {
    // Handle any errors that occur during subscription process
    console.error('Subscription error:', error);
    
    return {
      success: false, 
      message: 'Internal server error, try again later!', 
      status: 500
    };
  }
};

/**
 * Unsubscribe a user from the newsletter
 * 
 * This function handles:
 * - Removing newsletter subscription for authenticated users
 * - Updating user profile subscription status
 * 
 * @param path - The path to revalidate after operation
 * @returns API response indicating success or failure
 */
export const unSubscribeUser = async (path: string) => {
  // Establish database connection
  await connectToMongoDB();

  // =============================================
  // VALIDATE USER AUTHENTICATION
  // =============================================
  
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false, 
      message: 'You are not logged in, login to access this feature!', 
      status: 403
    };
  }

  try {
    // =============================================
    // UPDATE USER SUBSCRIPTION STATUS
    // =============================================
    
    await User.findOneAndUpdate(
      { _id: currentUser._id }, 
      { subscribedToNewsletter: false }
    );

    // =============================================
    // FINALIZE OPERATION
    // =============================================
    
    // Revalidate the page to show updated subscription status
    revalidatePath(path);

    return {
      success: true, 
      message: 'You have been removed from the subscription list', 
      status: 200
    };
    
  } catch (error) {
    // Handle any errors that occur during unsubscription process
    console.error('Unsubscription error:', error);
    
    return {
      success: false, 
      message: 'Internal server error, try again later!', 
      status: 500
    };
  }
};
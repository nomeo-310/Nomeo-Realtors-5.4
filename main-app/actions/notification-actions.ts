'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getCurrentUser } from "./user-actions";
import Notification from "@/models/notification";
import User from "@/models/user";
import { ObjectId } from "mongodb";

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
  
  if (!currentUser) {
    return { 
      success: false, 
      message: 'You are not authorized to access this feature', 
      status: 403 
    };
  }

  return { success: true, currentUser };
};

// Helper functions
const compareIds = (id1: any, id2: any): boolean => {
  return id1?.toString() === id2?.toString();
};

const toObjectId = (id: string | ObjectId): ObjectId => {
  return id instanceof ObjectId ? id : new ObjectId(id);
};

// Notification Actions
export const getSingleNotification = async (id: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const notification = await Notification.findOne({
      _id: id,
      recipient: authResult.currentUser!._id
    }).lean({ virtuals: true });

    if (!notification) {
      return { success: false, message: 'Not found', status: 404 };
    }

    return { success: true, data: notification, status: 200 };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Server error', status: 500 };
  }
};

export const deleteAllNotifications = async () => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    // Execute both operations in parallel
    await Promise.all([
      Notification.updateMany(
        {recipient: authResult.currentUser!._id, 
          seen: true
        }, { isDeleted: true 
      }),
      User.findByIdAndUpdate(
        authResult.currentUser!._id, 
        { notifications: [] }
      )
    ]);

    return { 
      success: true, 
      message: 'All notifications successfully cleared', 
      status: 200 
    };
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

export const deleteSingleNotification = async (id: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    // Verify the notification exists and belongs to the user
    const notification = await Notification.findOne({ 
      _id: id, 
      recipient: authResult.currentUser!._id 
    });

    if (!notification) {
      return { 
        success: false, 
        message: 'Notification not found or you are not authorized to delete it', 
        status: 404 
      };
    }

    if (!notification.seen) {
      return { 
        success: false, 
        message: 'You can only delete seen notifications', 
        status: 403 
      };
    }

    // Execute both operations in parallel
    await Promise.all([
      Notification.updateOne({ 
        _id: id, 
        recipient: authResult.currentUser!._id 
      }, {isDeleted: true}),
      User.findByIdAndUpdate(
        authResult.currentUser!._id, 
        { $pull: { notifications: toObjectId(id) } }
      )
    ]);

    return { 
      success: true, 
      message: 'Notification successfully deleted', 
      status: 200 
    };
  } catch (error) {
    console.error('Delete single notification error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

// Additional utility functions you might find useful
export const markNotificationAsSeen = async (id: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: id, 
        recipient: authResult.currentUser!._id 
      },
      { seen: true },
      { new: true }
    );

    if (!notification) {
      return { 
        success: false, 
        message: 'Notification not found', 
        status: 404 
      };
    }

    return { 
      success: true, 
      message: 'Notification marked as seen', 
      status: 200 
    };
  } catch (error) {
    console.error('Mark notification as seen error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

export const markAllNotificationsAsSeen = async () => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    await Notification.updateMany(
      { 
        recipient: authResult.currentUser!._id,
        seen: false 
      },
      { seen: true }
    );

    return { 
      success: true, 
      message: 'All notifications marked as seen', 
      status: 200 
    };
  } catch (error) {
    console.error('Mark all notifications as seen error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};
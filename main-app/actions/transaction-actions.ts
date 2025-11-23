"use server";

import User from "@/models/user";
import Apartment from "@/models/apartment";
import Transaction from "@/models/transaction";
import Notification from "@/models/notification";
import Rentout from "@/models/rentout";
import Sellout from "@/models/sellout";
import { getCurrentUser } from "./user-actions";
import { revalidatePath } from "next/cache";

type transactionProps = {
  createdAt: string;
  transactionId: string;
  referenceId: string;
  transactionStatus: string;
  currency: string;
  amount: number;
  propertyId: string;
  agentUserId: string;
  path: string;
  paymentMethod: string;
};

// Database connection optimization
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await import("@/lib/connectToMongoDB").then(({ connectToMongoDB }) => connectToMongoDB());
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
      message: 'You are not logged in. Log in to access this feature', 
      status: 403 
    };
  }

  return { success: true, currentUser };
};

// Helper functions
const createNotification = async (notificationData: any) => {
  const notification = await Notification.create(notificationData);
  await User.findByIdAndUpdate(
    notificationData.recipient,
    { $push: { notifications: notification._id } }
  );
  return notification;
};

// Transaction Actions
export const initiateTransaction = async ({ values }: { values: transactionProps }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const { 
    propertyId, 
    agentUserId, 
    createdAt, 
    currency, 
    referenceId, 
    transactionId, 
    transactionStatus, 
    amount, 
    path, 
    paymentMethod 
  } = values;

  try {
    // Parallel data fetching for better performance
    const [agentUserDetails, property] = await Promise.all([
      User.findOne({ _id: agentUserId, role: 'agent' }),
      Apartment.findOne({ propertyIdTag: propertyId })
    ]);

    if (!agentUserDetails) {
      return { 
        success: false, 
        message: 'Agent does not exist', 
        status: 404 
      };
    }

    if (!property) {
      return { 
        success: false, 
        message: 'Apartment does not exist', 
        status: 404 
      };
    }

    const transactionData = {
      amount,
      user: authResult.currentUser!._id,
      apartment: propertyId,
      agent: agentUserDetails.agentId,
      status: 'pending',
      type: property.propertyTag === 'for-rent' ? 'rent-payment' : 'apartment-purchase',
      approval: 'pending',
      createdAt,
      transactionId,
      referenceId,
      transactionStatus,
      currency,
      paymentMethod
    };

    // Create transaction and notification in parallel
    const [newTransaction, newNotification] = await Promise.all([
      Transaction.create(transactionData),
      createNotification({
        title: 'Transaction Initiated',
        content: `The transaction for the payment of ${currency}${amount.toLocaleString()} for ${property.propertyTypeTag === 'for-rent' ? 'property rent' : 'property purchase'} has been successfully initiated for the property with the ID: ${propertyId}. In case you haven't forwarded your payment receipt, go ahead and do that.`,
        recipient: authResult.currentUser!._id,
        issuer: authResult.currentUser!._id,
        type: 'payment',
        propertyId: propertyId
      })
    ]);

    // Update rentout/sellout based on property type
    const updateQuery = {
      user: authResult.currentUser!._id,
      agent: agentUserDetails.agentId,
      apartment: property._id,
      status: 'initiated'
    };

    const updateData = {
      status: 'pending',
      totalAmount: amount
    };

    if (property.propertyTag === 'for-rent') {
      await Rentout.findOneAndUpdate(updateQuery, updateData);
    } else {
      await Sellout.findOneAndUpdate(updateQuery, updateData);
    }

    revalidatePath(path);
    
    return { 
      success: true, 
      message: 'Transaction successfully created', 
      status: 200 
    };
    
  } catch (error) {
    console.error('Transaction initiation error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

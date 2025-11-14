"use server";

// =============================================
// IMPORTS
// =============================================

// Models
import User from "@/models/user";
import Apartment from "@/models/apartment";
import Transaction from "@/models/transaction";
import Notification from "@/models/notification";
import Rentout from "@/models/rentout";
import Sellout from "@/models/sellout";

// Actions & Utilities
import { getCurrentUser } from "./user-actions";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

/**
 * Transaction properties interface
 * Defines the structure for transaction initiation data
 */
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

// =============================================
// TRANSACTION MANAGEMENT FUNCTIONS
// =============================================

/**
 * Initiate a new transaction for property rent or purchase
 * 
 * This function handles:
 * - Transaction creation for both rent and purchase scenarios
 * - Validation of user, agent, and property existence
 * - Automatic creation of rentout/sellout records
 * - Notification generation for transaction initiation
 * 
 * @param values - Transaction data including property, agent, and payment details
 * @returns API response indicating success or failure
 */
export const initiateTransaction = async ({ values }: { values: transactionProps }) => {
  // Extract values from parameters
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

  // Get current authenticated user
  const current_user = await getCurrentUser();

  // Validate user authentication
  if (!current_user) {
    return { 
      success: false, 
      message: 'You are not logged in. Log in to access this feature', 
      status: 403 
    };
  }

  // Verify agent exists and has correct role
  const agentUserDetails = await User.findOne({ 
    _id: agentUserId, 
    role: 'agent' 
  });

  if (!agentUserDetails) {
    return { 
      success: false, 
      message: 'Agent does not exist', 
      status: 403 
    };
  }

  // Verify property exists
  const property = await Apartment.findOne({ 
    propertyIdTag: propertyId 
  });

  if (!property) {
    return { 
      success: false, 
      message: 'Apartment does not exist', 
      status: 403 
    };
  }

  try {
    // =============================================
    // CREATE TRANSACTION RECORD
    // =============================================
    
    const newTransactionData = {
      amount,
      user: current_user._id,
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
    
    // Save transaction to database
    const newTransaction = await Transaction.create(newTransactionData);
    newTransaction.save();

    // =============================================
    // UPDATE RENTOUT OR SELLOUT RECORD
    // =============================================
    
    if (property.propertyTag === 'for-rent') {
      // Update rentout record for rental properties
      await Rentout.findOneAndUpdate(
        { 
          user: current_user._id, 
          agent: agentUserDetails.agentId, 
          apartment: property._id, 
          status: 'initiated' 
        }, 
        { 
          status: 'pending', 
          totalAmount: amount 
        }
      );
    } else {
      // Update sellout record for property purchases
      await Sellout.findOneAndUpdate(
        { 
          user: current_user._id, 
          agent: agentUserDetails.agentId, 
          apartment: property._id, 
          status: 'initiated' 
        }, 
        { 
          status: 'pending', 
          totalAmount: amount 
        }
      );
    }

    // =============================================
    // CREATE NOTIFICATION
    // =============================================
    
    const notificationData = {
      title: 'Transaction Initiated',
      content: `The transaction for the payment of ${currency}${amount.toLocaleString()} for ${property.propertyTypeTag === 'for-rent' ? 'property rent' : 'property purchase'} has been successfully initiated for the property with the ID: ${propertyId}. In case you haven't forwarded your payment receipt, go ahead and do that.`,
      recipient: current_user._id,
      issuer: current_user._id,
      type: 'payment',
      propertyId: propertyId
    };

    // Save notification to database
    const newNotification = await Notification.create(notificationData);
    newNotification.save();

    // Link notification to user
    await User.updateOne(
      { _id: current_user._id }, 
      { $push: { notifications: newNotification._id } }
    );

    // =============================================
    // FINALIZE OPERATION
    // =============================================
    
    // Revalidate the page to show updated data
    revalidatePath(path);
    
    return { 
      success: true, 
      message: 'Transaction successfully created', 
      status: 200 
    };
    
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Transaction initiation error:', error);
    
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

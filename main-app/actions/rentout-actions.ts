'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getCurrentUser } from "./user-actions";
import { render } from "@react-email/render";
import { InspectionEmailTemplate } from "@/components/email-templates/inspection-email-template";
import { sendEmail } from "@/lib/send-email";
import Notification from "@/models/notification";
import User from "@/models/user";
import { capitalizeName } from "@/lib/utils";
import Apartment from "@/models/apartment";
import { revalidatePath } from "next/cache";
import Inspection from "@/models/inspection";
import mongoose from "mongoose";
import Rentout from "@/models/rentout";

type initialProps = {
  userId: string;
  email: string;
  agentId: string;
  agentUserId: string;
  propertyIdTag: string;
};

type cancelProps = {
  agentId: string;
  propertyIdTag: string;
  path: string;
}

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
      message: 'You are not logged in, login to access this feature', 
      status: 403 
    };
  }

  return { success: true, currentUser };
};

const validateAgentAccess = async (currentUser: any, agentId: string) => {
  if (currentUser.role !== 'agent') {
    return { 
      success: false, 
      message: 'You are not authorized to use this feature', 
      status: 403 
    };
  }

  if (agentId !== currentUser.agentId) {
    return { 
      success: false, 
      message: 'You are not authorized to perform this action', 
      status: 403 
    };
  }

  return { success: true };
};

// Helper functions
const getFullName = (user: any): string => {
  return `${capitalizeName(user.lastName ?? '')} ${capitalizeName(user.surName ?? '')}`.trim();
};

const sendRentOutEmail = async (recipientName: string, recipientEmail: string, title: string, message: string) => {
  try {
    const emailTemplate = await render(
      InspectionEmailTemplate({
        name: recipientName,
        title,
        message,
        isInspection: false
      })
    );

    await sendEmail({
      email: recipientEmail,
      subject: title,
      html: emailTemplate
    });
  } catch (emailError) {
    console.error('Failed to send rent-out email:', emailError);
    // Don't fail the entire operation if email fails
  }
};

const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      status: 400
    };
  }
  return { success: true };
};

// Rentout Actions
export const initiateRentOut = async (data: initialProps) => {
  await ensureConnection();

  // Validate required fields
  const fieldValidation = validateRequiredFields(data, [
    'userId', 'agentId', 'propertyIdTag', 'email', 'agentUserId'
  ]);
  if (!fieldValidation.success) return fieldValidation;

  const { userId, agentId, propertyIdTag, email, agentUserId } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authResult = await validateUserAuth();
    if (!authResult.success) return authResult;

    const agentAccessResult = await validateAgentAccess(authResult.currentUser!, agentId);
    if (!agentAccessResult.success) return agentAccessResult;

    // Parallelize all database queries for maximum performance
    const [potentialClient, agentUserDetails, apartmentDetails, completedInspection, rentOutExists] = await Promise.all([
      User.findById(userId),
      User.findById(agentUserId),
      Apartment.findOne({ propertyIdTag }),
      Inspection.findOne({
        apartment: { $exists: true }, // Will be populated below
        agent: agentId,
        status: 'completed',
        user: userId,
        verdict: 'accepted'
      }),
      Rentout.findOne({
        apartment: { $exists: true }, // Will be populated below
        agent: agentId
      })
    ]);

    // Validate all required data exists
    if (!potentialClient) {
      return { success: false, message: 'Client seeking this property does not exist', status: 404 };
    }

    if (!agentUserDetails) {
      return { success: false, message: 'Agent attached to this property does not exist', status: 404 };
    }

    if (!apartmentDetails) {
      return { success: false, message: 'Property does not exist', status: 404 };
    }

    // Update inspection and rentout queries with actual apartment ID
    const inspectionQuery = {
      apartment: apartmentDetails._id,
      agent: agentId,
      status: 'completed',
      user: userId,
      verdict: 'accepted'
    };

    const rentOutQuery = {
      apartment: apartmentDetails._id,
      agent: agentId
    };

    // Re-check with actual apartment ID
    const [finalCompletedInspection, finalRentOutExists] = await Promise.all([
      Inspection.findOne(inspectionQuery),
      Rentout.findOne(rentOutQuery)
    ]);

    if (!finalCompletedInspection) {
      return { 
        success: false, 
        message: 'This property cannot be rented out to this client without a completed and accepted inspection.', 
        status: 403 
      };
    }

    if (finalRentOutExists) {
      return { 
        success: false, 
        message: 'A rental process has already been initiated for this property. To proceed, please cancel the initial one.', 
        status: 409 
      };
    }

    const userFullName = getFullName(potentialClient);
    const agentFullName = getFullName(authResult.currentUser!);
    
    const messageContent = `Your contact agent: ${agentFullName} has successfully initiated the rent-out process for the property with ID: ${propertyIdTag}. Check your account to continue with process of payment.\n\nThank you for using our service!`;

    const initialRentOutData = {
      user: userId,
      agent: agentId,
      apartment: apartmentDetails._id,
      rented: false,
    };

    const notificationData = {
      title: 'Apartment Rent-Out',
      content: `The rent-out process has been successfully initiated for the property with the ID: ${propertyIdTag}. You can go ahead and make payment.`,
      recipient: userId,
      issuer: agentUserDetails._id,
      type: 'payment',
      propertyId: propertyIdTag
    };

    // Create rentout and notification within transaction
    const [initialRentOut, newNotification] = await Promise.all([
      Rentout.create([initialRentOutData], { session }),
      Notification.create([notificationData], { session })
    ]);

    // Update user and apartment in parallel
    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $push: { notifications: newNotification[0]._id } },
        { session }
      ),
      Apartment.findOneAndUpdate(
        { propertyIdTag },
        { $set: { availabilityStatus: 'pending' } },
        { session }
      )
    ]);

    // Commit transaction first
    await session.commitTransaction();

    // Send email asynchronously after transaction commit
    sendRentOutEmail(
      userFullName,
      email,
      'Apartment Rent-Out Initialization',
      messageContent
    );

    return { 
      success: true, 
      message: 'Rent out successfully initiated. Contact client', 
      status: 200 
    };

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error('Rent-out initiation error:', error);

    return { 
      success: false, 
      message: 'Error occurred while initiating rent-out. Please try again later.', 
      status: 500 
    };
  } finally {
    session.endSession();
  }
};

export const cancelRentOut = async (data: cancelProps) => {
  await ensureConnection();

  // Validate required fields
  const fieldValidation = validateRequiredFields(data, [
    'agentId', 'propertyIdTag', 'path'
  ]);
  if (!fieldValidation.success) return fieldValidation;

  const { agentId, propertyIdTag, path } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authResult = await validateUserAuth();
    if (!authResult.success) return authResult;

    const agentAccessResult = await validateAgentAccess(authResult.currentUser!, agentId);
    if (!agentAccessResult.success) return agentAccessResult;

    // Parallel data fetching
    const [apartmentDetails, rentOut] = await Promise.all([
      Apartment.findOne({ propertyIdTag }),
      Rentout.findOne({ agent: agentId }).populate('user')
    ]);

    if (!apartmentDetails) {
      return { success: false, message: 'Property does not exist', status: 404 };
    }

    if (!rentOut) {
      return { success: false, message: 'Rent out process does not exist', status: 404 };
    }

    // Use populated user data
    const potentialClient = rentOut.user as any;
    if (!potentialClient) {
      return { success: false, message: 'Client seeking this property does not exist', status: 404 };
    }

    const clientFullName = getFullName(potentialClient);
    const agentFullName = getFullName(authResult.currentUser!);
    
    const messageContent = `Your contact agent: ${agentFullName} has cancelled the rent-out process for the property with ID: ${propertyIdTag}. You can reach out to the agent to find out the reason for this change.\n\nThank you for using our service!`;

    const notificationData = {
      title: 'Rent-Out Cancellation',
      content: `The rent-out process initiated for the property with the ID: ${propertyIdTag} has been cancelled. For further details reach out to the contact agent.`,
      recipient: rentOut.user,
      issuer: authResult.currentUser!._id,
      type: 'payment',
      propertyId: propertyIdTag
    };

    // Prepare email template asynchronously while doing other work
    const emailPromise = sendRentOutEmail(
      clientFullName,
      potentialClient.email,
      'Apartment Rent-Out Cancellation',
      messageContent
    );

    // Execute all database operations within transaction
    const [newNotification] = await Promise.all([
      Notification.create([notificationData], { session })
    ]);

    await Promise.all([
      User.findByIdAndUpdate(
        rentOut.user,
        { $push: { notifications: newNotification[0]._id } },
        { session }
      ),
      Rentout.findOneAndDelete(
        { apartment: apartmentDetails._id, agent: agentId },
        { session }
      ),
      Apartment.findOneAndUpdate(
        { propertyIdTag },
        { $set: { availabilityStatus: 'available' } },
        { session }
      )
    ]);

    // Commit transaction first
    await session.commitTransaction();

    // Wait for email to complete (but don't fail operation if it fails)
    await emailPromise.catch(error => 
      console.error('Failed to send rent-out cancellation email:', error)
    );

    // Revalidate path after successful operation
    revalidatePath(path);

    return { 
      success: true, 
      message: 'Rent out successfully cancelled.', 
      status: 200 
    };

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error('Cancel rent-out error:', error);

    return { 
      success: false, 
      message: 'Error occurred while cancelling rent out.', 
      status: 500 
    };
  } finally {
    session.endSession();
  }
};
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
import Sellout from "@/models/sellout";
import mongoose from "mongoose";

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

const sendSellOutEmail = async (recipientName: string, recipientEmail: string, title: string, message: string) => {
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
    console.error('Failed to send sell-out email:', emailError);
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

// Sellout Actions
export const initiateSellOut = async (data: initialProps) => {
  await ensureConnection();

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

    // Fetch only what we need — no wasted queries
    const [potentialClient, agentUserDetails, apartmentDetails] = await Promise.all([
      User.findById(userId),
      User.findById(agentUserId),
      Apartment.findOne({ propertyIdTag })
    ]);

    if (!potentialClient || !agentUserDetails || !apartmentDetails) {
      return { success: false, message: 'User, agent, or property not found', status: 404 };
    }

    // Now do real checks with correct apartment._id
    const [inspection, existingSellout] = await Promise.all([
      Inspection.findOne({
        apartment: apartmentDetails._id,
        agent: agentId,
        status: 'completed',
        user: userId,
        verdict: 'accepted'
      }),
      Sellout.findOne({
        apartment: apartmentDetails._id,
        agent: agentId
      })
    ]);

    if (!inspection) {
      return { success: false, message: 'No accepted inspection found', status: 403 };
    }
    if (existingSellout) {
      return { success: false, message: 'Sell-out already initiated', status: 409 };
    }

    const userFullName = getFullName(potentialClient);
    const agentFullName = getFullName(authResult.currentUser!);

    const messageContent = `Your contact agent ${agentFullName} has initiated the purchase process for property ID: ${propertyIdTag}. Please check your account to proceed with payment.`;

    // FIXED: Use new schema
    const initialSellOutData = {
      user: userId,
      agent: agentId,
      apartment: apartmentDetails._id,
      status: 'pending' as const,
    };

    const notificationData = {
      title: 'Property Purchase Initiated',
      content: `Purchase process started for property ID: ${propertyIdTag}. Proceed to payment.`,
      recipient: userId,
      issuer: agentUserDetails._id,
      type: 'payment' as const,
      propertyId: apartmentDetails._id 
    };

    const [sellout, notification] = await Promise.all([
      Sellout.create([initialSellOutData], { session }),
      Notification.create([notificationData], { session })
    ]);

    await Promise.all([
      User.findByIdAndUpdate(userId, { $push: { notifications: notification[0]._id } }, { session }),
      Apartment.findOneAndUpdate(
        { propertyIdTag },
        { $set: { availabilityStatus: 'pending' } },
        { session }
      )
    ]);

    await session.commitTransaction();

    sendSellOutEmail(userFullName, email, 'Property Purchase Initiated', messageContent);

    return { success: true, message: 'Sell-out initiated successfully', status: 200 };
  } catch (error) {
    await session.abortTransaction();
    console.error('Sell-out initiation error:', error);
    return { success: false, message: 'Failed to initiate sell-out', status: 500 };
  } finally {
    session.endSession();
  }
};

export const cancelSellOut = async (data: cancelProps) => {
  await ensureConnection();

  const fieldValidation = validateRequiredFields(data, ['agentId', 'propertyIdTag', 'path']);
  if (!fieldValidation.success) return fieldValidation;

  const { agentId, propertyIdTag, path } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authResult = await validateUserAuth();
    if (!authResult.success) return authResult;

    const agentAccessResult = await validateAgentAccess(authResult.currentUser!, agentId);
    if (!agentAccessResult.success) return agentAccessResult;

    const [apartmentDetails, sellout] = await Promise.all([
      Apartment.findOne({ propertyIdTag }),
      Sellout.findOne({ agent: agentId, apartment: { $exists: true } }).populate('user')
    ]);

    if (!apartmentDetails || !sellout) {
      return { success: false, message: 'Property or sell-out not found', status: 404 };
    }

    const client = sellout.user as any;
    if (!client) {
      return { success: false, message: 'Client not found', status: 404 };
    }

    const clientFullName = getFullName(client);
    const agentFullName = getFullName(authResult.currentUser!);

    const messageContent = `Your contact agent ${agentFullName} has cancelled the purchase process for property ID: ${propertyIdTag}.`;

    const notificationData = {
      title: 'Purchase Cancelled',
      content: `The purchase process for property ID: ${propertyIdTag} has been cancelled.`,
      recipient: client._id,
      issuer: authResult.currentUser!._id,
      type: 'payment' as const,
      propertyId: apartmentDetails._id
    };

    const [notification] = await Notification.create([notificationData], { session });

    await Promise.all([
      User.findByIdAndUpdate(client._id, { $push: { notifications: notification._id } }, { session }),
      Sellout.deleteOne({ _id: sellout._id }, { session }),
      Apartment.findOneAndUpdate(
        { propertyIdTag },
        { $set: { availabilityStatus: 'available' } },
        { session }
      )
    ]);

    await session.commitTransaction();

    await sendSellOutEmail(clientFullName, client.email, 'Purchase Cancelled', messageContent)
      .catch(err => console.error('Email failed:', err));

    revalidatePath(path);

    return { success: true, message: 'Purchase cancelled successfully', status: 200 };
  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel sell-out error:', error);
    return { success: false, message: 'Failed to cancel sell-out', status: 500 };
  } finally {
    session.endSession();
  }
};
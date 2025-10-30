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
  email:string;
  agentId: string;
  agentUserId: string;
  propertyIdTag: string;
};

type cancelProps = {
  agentId: string;
  propertyIdTag: string;
  path: string;
}


export const initiateSellOut = async (data: initialProps) => {
  const { userId, agentId, propertyIdTag, email, agentUserId } = data;
  
  // Validate required fields
  if (!userId || !agentId || !propertyIdTag || !email || !agentUserId) {
    return { success: false, message: 'Missing required fields', status: 400 };
  }

  await connectToMongoDB();

  const session = await mongoose.startSession(); // Add transaction support
  session.startTransaction();

  try {
    const current_user = await getCurrentUser();
    if (!current_user) {
      return { success: false, message: 'You are not logged in, login to access this feature', status: 403 };
    }

    if (current_user.role === 'user') {
      return { success: false, message: 'You are not authorized to use this feature', status: 403 };
    }

    if (agentId !== current_user.agentId) {
      return { success: false, message: 'You are not authorized to sell out this property', status: 403 };
    }

    // Parallelize database queries for better performance
    const [potentialClient, agentUserDetails, apartmentDetails] = await Promise.all([
      User.findById(userId),
      User.findById(agentUserId),
      Apartment.findOne({ propertyIdTag: propertyIdTag })
    ]);

    if (!potentialClient) {
      return { success: false, message: 'Client seeking this property does not exist', status: 403 };
    }

    if (!agentUserDetails) {
      return { success: false, message: 'Agent attached to this property does not exist', status: 403 };
    }

    if (!apartmentDetails) {
      return { success: false, message: 'Property does not exist', status: 403 };
    }

    // Check for completed inspection
    const completedInspection = await Inspection.findOne({
      apartment: apartmentDetails._id,
      agent: agentId,
      status: 'completed',
      user: userId,
      verdict: 'accepted'
    });

    if (!completedInspection) {
      return { success: false, message: 'This property cannot be sold to this client.', status: 403 };
    }

    // Check for existing sellout
    const sellOutExists = await Sellout.findOne({
      apartment: apartmentDetails._id,
      agent: agentId
    });

    if (sellOutExists) {
      return { success: false, message: 'A sell-out process has already been initiated for this property. To proceed, please cancel the initial one.', status: 403 };
    }

    const userFullName = `${capitalizeName(potentialClient.lastName ?? '')} ${capitalizeName(potentialClient.surName ?? '')}`;
    const message = `Your contact agent: ${capitalizeName(current_user.lastName ?? '')} ${capitalizeName(current_user.surName ?? '')} have successfully initiated the sell-out process for the property with ID: ${propertyIdTag}. Check your account to continue with process of payment.\n\nThank you for using our service!`;

    const initialSellOutData = {
      user: userId,
      agent: agentId,
      apartment: apartmentDetails._id,
      sold: false,
    };

    const notificationData = {
      title: 'Property Purchase',
      content: `The sell-out process has been successfully initiated for the property with the ID: ${propertyIdTag}. You can go ahead and make payment.`,
      recipient: userId,
      issuer: agentUserDetails._id,
      type: 'payment',
      propertyId: propertyIdTag
    };

    // Create sellout and notification within transaction
    const [initialSellOut, newNotification] = await Promise.all([
      Sellout.create([initialSellOutData], { session }),
      Notification.create([notificationData], { session })
    ]);

    // Update user and apartment
    await Promise.all([
      User.findOneAndUpdate(
        { _id: userId },
        { $push: { notifications: newNotification[0]._id } },
        { session }
      ),
      Apartment.findOneAndUpdate(
        { propertyIdTag: propertyIdTag },
        { $set: { availabilityStatus: 'pending' } },
        { session, new: true }
      )
    ]);

    // Send email (outside transaction since it's external)
    const emailTemplate = await render(
      InspectionEmailTemplate({
        name: userFullName,
        title: 'Property Purchase',
        message: message,
        isInspection: false
      })
    );

    const sendOption = {
      email: email,
      subject: 'Property Sell-Out Initialization',
      html: emailTemplate
    };

    await sendEmail(sendOption);

    // Commit transaction
    await session.commitTransaction();

    return { success: true, message: 'Sell-out successfully initiated. Contact client', status: 200 };

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error('Sell-out initiation error:', error);

    return { success: false, message: 'Error occurred while initiating sell-out. Please try again later.', status: 500 };
  } finally {
    session.endSession();
  }
};

export const cancelSellOut = async (data: cancelProps) => {
  const { agentId, propertyIdTag, path } = data;
  
  // Validate required fields
  if (!agentId || !propertyIdTag || !path) {
    return { success: false, message: 'Missing required fields', status: 400 };
  }

  await connectToMongoDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const current_user = await getCurrentUser();
    if (!current_user) {
      return { success: false, message: 'You are not logged in, login to access this feature', status: 403 };
    }

    if (current_user.role === 'user') {
      return { success: false, message: 'You are not authorized to use this feature', status: 403 };
    }

    if (agentId !== current_user.agentId) {
      return { success: false, message: 'You are not authorized to cancel purchase process for this property', status: 403 };
    }

    const apartmentDetails = await Apartment.findOne({ propertyIdTag: propertyIdTag });
    if (!apartmentDetails) {
      return { success: false, message: 'Property does not exist', status: 403 };
    }

    const sellOut = await Sellout.findOne({ 
      agent: agentId, 
      apartment: apartmentDetails._id 
    });
    
    if (!sellOut) {
      return { success: false, message: 'Property purchase process does not exist', status: 403 };
    }

    const potentialClient = await User.findById(sellOut.user);
    if (!potentialClient) {
      return { success: false, message: 'Client seeking this property does not exist', status: 403 };
    }

    const clientFullName = `${capitalizeName(potentialClient.lastName ?? '')} ${capitalizeName(potentialClient.surName ?? '')}`;
    
    // Fixed message content (was mentioning "rent-out" instead of "sell-out")
    const message = `Your contact agent: ${capitalizeName(current_user.lastName ?? '')} ${capitalizeName(current_user.surName ?? '')} has cancelled the sell-out process for the property with ID: ${propertyIdTag}. You can reach out to the agent to find out the reason for this change.\n\nThank you for using our service!`;

    const notificationData = {
      title: 'Property Purchase Cancellation',
      content: `The sell-out process initiated for the property with the ID: ${propertyIdTag} has been cancelled. For further details reach out to the contact agent.`,
      recipient: sellOut.user,
      issuer: current_user._id,
      type: 'payment',
      propertyId: propertyIdTag
    };

    // Prepare email template
    const emailTemplate = await render(
      InspectionEmailTemplate({
        name: clientFullName,
        title: 'Property Purchase Cancellation',
        message: message,
        isInspection: false
      })
    );

    const sendOption = {
      email: potentialClient.email,
      subject: 'Property Purchase Cancellation', // Fixed subject line
      html: emailTemplate
    };

    // Execute all operations within transaction
    const [newNotification] = await Promise.all([
      Notification.create([notificationData], { session })
    ]);

    await Promise.all([
      User.findOneAndUpdate(
        { _id: sellOut.user },
        { $push: { notifications: newNotification[0]._id } },
        { session }
      ),
      Sellout.findOneAndDelete(
        { apartment: apartmentDetails._id, agent: agentId },
        { session }
      ),
      Apartment.findOneAndUpdate(
        { propertyIdTag: propertyIdTag },
        { $set: { availabilityStatus: 'available' } },
        { session, new: true }
      )
    ]);

    // Commit transaction first
    await session.commitTransaction();

    // Send email after transaction commit (external service)
    try {
      await sendEmail(sendOption);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the entire operation if email fails
    }

    // Revalidate path after successful operation
    revalidatePath(path);

    return { success: true, message: 'Property purchase successfully cancelled.', status: 200 };

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error('Cancel sell-out error:', error);

    return { success: false, message: 'Error occurred while cancelling sell-out.', status: 500 };
  } finally {
    session.endSession();
  }
};
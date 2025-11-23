'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getCurrentUser } from "./user-actions";
import Agent from "@/models/agent";
import User from "@/models/user";
import Apartment from "@/models/apartment";
import Inspection from "@/models/inspection";
import { render } from "@react-email/render";
import { InspectionEmailTemplate } from "@/components/email-templates/inspection-email-template";
import { sendEmail } from "@/lib/send-email";
import Notification from "@/models/notification";
import { revalidatePath } from "next/cache";

type scheduleInspectionType = {
  time: string;
  additionalPhoneNumber?: string;
  date: string;
  agentId: string;
  apartment: string;
  path: string;
};

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
  current_user?: any;
}

const validateUserAuth = async (): Promise<AuthValidationResult> => {
  const current_user = await getCurrentUser();
  
  if (!current_user) {
    return { success: false, message: 'You are not logged in, login to access this feature', status: 403 };
  }

  return { success: true, current_user };
};

// Helper functions
const getFullName = (user: any): string => {
  return `${user.surName || ''} ${user.lastName || ''}`.trim();
};

const sendInspectionEmail = async (recipientName: string, recipientEmail: string, title: string, message: string) => {
  const emailTemplate = await render(
    InspectionEmailTemplate({
      name: recipientName,
      title,
      message,
      isInspection: true,
    })
  );

  await sendEmail({
    email: recipientEmail,
    subject: title,
    html: emailTemplate
  });
};

const createNotification = async (notificationData: any) => {
  const notification = await Notification.create(notificationData);
  await User.findByIdAndUpdate(
    notificationData.recipient,
    { $push: { notifications: notification._id } },
    { new: true }
  );
  return notification;
};

const compareIds = (id1: any, id2: any): boolean => {
  return id1?.toString() === id2?.toString();
};

// Inspection Actions
export const scheduleInspection = async (data: scheduleInspectionType) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const { time, additionalPhoneNumber, date, agentId, apartment, path } = data;

  try {
    // Parallel data fetching
    const [agent, currentApartment] = await Promise.all([
      Agent.findById(agentId),
      Apartment.findOne({ propertyIdTag: apartment })
    ]);

    if (!agent) {
      return { success: false, message: 'Agent attached to this property does not exist', status: 404 };
    }

    const agentUserDetails = await User.findById(agent.userId);
    if (!agentUserDetails) {
      return { success: false, message: 'Agent attached to this property does not exist', status: 404 };
    }

    if (!currentApartment) {
      return { success: false, message: 'This property does not exist', status: 404 };
    }

    // Check if user is trying to schedule inspection for their own managed property
    if (compareIds(currentApartment.agent, authResult.current_user!.agentId)) {
      return { 
        success: false, 
        message: 'You cannot schedule inspection for the property you are managing', 
        status: 409 
      };
    }

    // Check for existing inspections in parallel
    const [existingInspection, existingInspectionForAgent, existingInspectionForSameDay] = await Promise.all([
      Inspection.findOne({ 
        user: authResult.current_user!._id, 
        apartment: currentApartment._id, 
        date 
      }),
      Inspection.findOne({ 
        agent: agent._id, 
        date, 
        time 
      }),
      Inspection.findOne({ 
        user: authResult.current_user!._id, 
        agent: agent._id, 
        date, 
        time 
      })
    ]);

    if (existingInspection) {
      return { 
        success: false, 
        message: 'You have already scheduled an inspection for this property', 
        status: 409 
      };
    }

    if (existingInspectionForAgent) {
      return { 
        success: false, 
        message: 'The agent is already scheduled for an inspection for this date and time.', 
        status: 409 
      };
    }

    if (existingInspectionForSameDay) {
      return { 
        success: false, 
        message: 'You have already scheduled an inspection with the agent for same day and time.', 
        status: 409 
      };
    }

    const userFullName = getFullName(authResult.current_user!);
    const agentFullName = getFullName(agentUserDetails);

    const inspectionData = {
      date,
      time,
      user: authResult.current_user!._id,
      apartment: currentApartment._id,
      agent: agentId,
      additionalNumber: additionalPhoneNumber,
    };

    // Create inspection and related data in parallel
    const newInspection = await Inspection.create(inspectionData);

    const messageContent = `${userFullName} scheduled an inspection of one of the apartments you are managing. For more details checkout your notification on our website.`;

    const [userNotification, agentNotification] = await Promise.all([
      createNotification({
        type: 'inspection',
        title: 'Inspection Reminder',
        content: `Here is a reminder that you scheduled an inspection with ${agentFullName} on ${date} for ${time}. Feel free to cancel this if you will not be able to meet up`,
        propertyId: apartment,
        issuer: authResult.current_user!._id,
        recipient: authResult.current_user!._id,
        inspectionId: newInspection._id,
        agentId
      }),
      createNotification({
        type: 'inspection',
        title: 'Inspection Reminder',
        content: `Here is a reminder that you are scheduled for an inspection with ${userFullName} on ${date} for ${time}. Below are the details of the ${userFullName} and the apartment. Feel free to call and have him/her cancel this schedule if you will not be able to meet up.`,
        propertyId: apartment,
        issuer: authResult.current_user!._id,
        recipient: agentUserDetails._id,
      })
    ]);

    // Update user and agent data in parallel
    await Promise.all([
      Agent.findByIdAndUpdate(agentId, { $push: { inspections: newInspection._id } }),
      User.findByIdAndUpdate(authResult.current_user!._id, { $push: { notifications: userNotification._id } })
    ]);

    // Send email asynchronously (don't await for better performance)
    sendInspectionEmail(
      agentFullName,
      agentUserDetails.email,
      'Apartment Inspection Schedule',
      messageContent
    ).catch(console.error); // Log email errors but don't fail the request

    revalidatePath(path);
    return { success: true, message: 'Apartment inspection successfully scheduled', status: 201 };
  } catch (error) {
    console.error('Schedule inspection error:', error);
    return { success: false, message: 'Error occurred while creating schedule', status: 500 };
  }
};

export const cancelInspection = async ({ id, path }: { id: string, path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const inspection = await Inspection.findOne({ _id: id, user: authResult.current_user!._id });
    
    if (!inspection) {
      return { success: false, message: 'Inspection does not exist!', status: 404 };
    }

    if (!compareIds(inspection.user, authResult.current_user!._id)) {
      return { success: false, message: 'You are not authorized to access this feature', status: 403 };
    }

    const agent = await Agent.findById(inspection.agent);
    if (!agent) {
      return { success: false, message: 'Agent does not exist!', status: 404 };
    }

    const agentUserDetails = await User.findById(agent.userId);
    if (!agentUserDetails) {
      return { success: false, message: 'Agent does not exist', status: 404 };
    }

    const userFullName = getFullName(authResult.current_user!);
    const agentFullName = getFullName(agentUserDetails);

    const messageContent = `${userFullName} cancelled the earlier scheduled inspection of one of the apartments you are managing. Sorry for the inconveniences this might cause you. For more details reach out to the ${userFullName} regarding the new schedule.`;

    // Execute all operations in parallel
    await Promise.all([
      Agent.findByIdAndUpdate(inspection.agent, { $pull: { inspections: inspection._id } }),
      Inspection.deleteOne({ _id: inspection._id }),
      createNotification({
        type: 'inspection',
        title: 'Inspection Cancelled',
        content: `You cancelled your scheduled inspection with ${agentFullName} on ${inspection.date} for ${inspection.time}. Feel free to call ${agentFullName} to explain reason`,
        issuer: authResult.current_user!._id,
        recipient: authResult.current_user!._id,
        agentId: inspection.agent
      })
    ]);

    // Send email asynchronously
    sendInspectionEmail(
      agentFullName,
      agentUserDetails.email,
      'Inspection Cancellation',
      messageContent
    ).catch(console.error);

    revalidatePath(path);
    return { success: true, message: 'Inspection successfully cancelled', status: 200 };
  } catch (error) {
    console.error('Cancel inspection error:', error);
    return { success: false, message: 'Error occurred while cancelling inspection', status: 500 };
  }
};

export const toggleInspectionStatus = async ({ id, status, path }: { id: string, status: string, path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const inspection = await Inspection.findById(id);
    
    if (!inspection) {
      return { success: false, message: 'Inspection does not exist!', status: 404 };
    }

    if (!compareIds(inspection.agent, authResult.current_user!.agentId)) {
      return { success: false, message: 'You are not authorized to access this feature', status: 403 };
    }

    if (inspection.status === status) {
      return { success: false, message: 'Inspection status is already set to this', status: 409 };
    }

    await Inspection.findByIdAndUpdate(id, { status });

    revalidatePath(path);
    return { success: true, message: 'Inspection status successfully updated', status: 200 };
  } catch (error) {
    console.error('Toggle inspection status error:', error);
    return { success: false, message: 'Error occurred while toggling inspection status', status: 500 };
  }
};

export const toggleInspectionVerdict = async ({ id, verdict, path }: { id: string, verdict: string, path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  try {
    const inspection = await Inspection.findById(id);
    
    if (!inspection) {
      return { success: false, message: 'Inspection does not exist!', status: 404 };
    }

    if (!compareIds(inspection.agent, authResult.current_user!.agentId)) {
      return { success: false, message: 'You are not authorized to access this feature', status: 403 };
    }

    if (inspection.verdict === verdict) {
      return { success: false, message: 'Inspection verdict is already set to this', status: 409 };
    }

    await Inspection.findByIdAndUpdate(id, { verdict });

    revalidatePath(path);
    return { success: true, message: 'Inspection verdict successfully updated', status: 200 };
  } catch (error) {
    console.error('Toggle inspection verdict error:', error);
    return { success: false, message: 'Error occurred while toggling inspection verdict', status: 500 };
  }
};
'use server'

import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { getCurrentUser } from "./auth-actions";
import { createServerPermissionService } from "@/utils/permission-service";
import Agent from "@/models/agent";
import Notification from "@/models/notification";
import { revalidatePath } from "next/cache";
import User from "@/models/user";
import Apartment from "@/models/apartment";
import Rentout from "@/models/rentout";

interface agentDetails {
  agentId: string;
  path: string;
};

interface apartmentDetails {
  apartmentId: string;
  path: string;
}

interface rejectionDetails extends agentDetails {
  reason: string;
};

interface propertyRejectionDetails extends apartmentDetails {
  reason: string;
}

export const verifyAgent = async (values: agentDetails) => {
  const { agentId, path } = values;
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canApproveVerifications()) {
    return { success: false,  message: 'You are not authorized to verify agents',  status: 403 };
  }

  const currentAgent = await Agent.findOne({ _id: agentId });

  if (!currentAgent) {
    return { success: false, message: 'Agent does not exist', status: 404 };
  }

  try {
    await Agent.findOneAndUpdate({ _id: agentId }, {agentVerified: true, verificationStatus: 'verified'});

    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your agency is verified',
      content: 'Your agency details have been verified. Now you can go ahead and create apartment for rent or sale and start getting clients through this app.',
      recipient: currentAgent.userId,
    });
    await newNotification.save();

    await User.findOneAndUpdate({ _id: currentAgent.userId }, { $push: { notifications: newNotification._id }});

    revalidatePath(path);
    return { success: true, message: 'Agent details verified', status: 200 };
  } catch (error) {
    console.error('Error verifying agent:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const rejectAgent = async (values: rejectionDetails) => {
  const { agentId, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canManageVerifications) {
    return { success: false, message: 'You are not authorized to reject agents',  status: 403 };
  }

  const currentAgent = await Agent.findById(agentId);

  if (!currentAgent) {
    return { success: false, message: 'Agent does not exist', status: 404 };
  }

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your agency verification failed',
      content: `Your agency details verification failed. This is due to the reasons: ${reason}. Fix these issues as soon as possible so that you can start adding properties that clients can see.`,
      recipient: currentAgent.userId,
    });

    await Agent.findOneAndUpdate({ _id: agentId }, { verificationStatus: 'rejected'});
    await User.findOneAndUpdate({ _id: currentAgent.userId }, { $push: { notifications: newNotification._id }});

    revalidatePath(path);
    return { success: true, message: 'Rejection notification sent to agent.', status: 200 };
  } catch (error) {
    console.error('Error rejecting agent:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const verifyApartment = async (values:apartmentDetails) => {
  const { apartmentId, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  }

  const permissions = createServerPermissionService(current_user.role);
  
  if (!permissions.canManageVerifications) {
    return { success: false,  message: 'You are not authorized to verify apartments',  status: 403 };
  }

  const currentApartment = await Apartment.findById(apartmentId);

  if (!currentApartment) {
    return { success: false, message: 'Apartment does not exist!!', status: 404 }
  };

  if (currentApartment.propertyApproval === 'approved') {
    return { success: false, message: 'Apartment has already been approved', status: 404 }
  };

  const agentDetails = await Agent.findById(currentApartment.agent);

  if (!agentDetails) {
    return { success: false, message: 'Property agent does not exist!!', status: 404 }
  };

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your Property has been Verified',
      content: `Your property with the ID: ${currentApartment.propertyIdTag}. situated at ${currentApartment.address}, ${currentApartment.city}, ${currentApartment.state} has been verified. Users can now schedule inspection and possibly rent it.`,
      recipient: agentDetails.userId,
      propertyId: currentApartment._id
    });
    await newNotification.save();

    await Apartment.findOneAndUpdate({ _id: apartmentId }, { propertyApproval: 'approved'});
    await User.findByIdAndUpdate({_id: agentDetails.userId}, { $push: { notifications: newNotification._id }});


    revalidatePath(path);
    return { success: true, message: 'Apartment approved', status: 200 }
  } catch (error) {
    console.error('Error verifying property:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const rejectApartment = async (values:propertyRejectionDetails) => {
  const { apartmentId, path, reason } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  };

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManageVerifications) {
    return { success: false,  message: 'You are not authorized to reject apartments',  status: 403 };
  };

  const currentApartment = await Apartment.findById(apartmentId);

  if (!currentApartment) {
    return { success: false, message: 'Apartment does not exist!!', status: 404 }
  };

  if (currentApartment.propertyApproval === 'approved') {
    return { success: false, message: 'Apartment has already been approved', status: 404 }
  };

  const agentDetails = await Agent.findById(currentApartment.agent);

  if (!agentDetails) {
    return { success: false, message: 'Property agent does not exist!!', status: 404 }
  };

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your property verification failed',
      content: `Your property details verification failed. This is due to the reasons: ${reason}. Fix these issues as soon as possible so that users can access this property.`,
      recipient: agentDetails.userId,
    });

    await Apartment.findOneAndUpdate({ _id: apartmentId }, { propertyApproval: 'rejected'});
    await User.findOneAndUpdate({ _id: agentDetails.userId }, { $push: { notifications: newNotification._id }});

    revalidatePath(path);
    return { success: true, message: 'Rejection notification sent to agent.', status: 200 };
  } catch (error) {
    return { success: false, message: 'Internal server error', status: 500 };
  }
};
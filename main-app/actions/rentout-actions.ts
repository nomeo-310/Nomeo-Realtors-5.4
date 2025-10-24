'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getCurrentUser } from "./user-actions";
import Rented from "@/models/rented";
import { render } from "@react-email/render";
import { InspectionEmailTemplate } from "@/components/email-templates/inspection-email-template";
import { sendEmail } from "@/lib/send-email";
import Notification from "@/models/notification";
import User from "@/models/user";
import { capitalizeName } from "@/lib/utils";
import Apartment from "@/models/apartment";
import { revalidatePath } from "next/cache";

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


export const initiateRentOut = async (data:initialProps) => {
  const { userId, agentId, propertyIdTag, email, agentUserId } = data
  await connectToMongoDB();

  const current_user = await getCurrentUser();
  const agentUserDetails = await User.findById({_id: agentUserId});
  const potentialClient = await User.findById({_id: userId});

  if (!current_user) {
    return {success: false, message: 'You are not logged in, login to access this feature', status: 403}
  };

  if (current_user.role === 'user') {
    return {success: false, message: 'You are not authrized to use this feature', status: 403}
  };

  if (agentId !== current_user.agentId) {
    return {success: false, message: 'You are not authrized to rent out this property', status: 403}
  };

  if (!potentialClient) {
    return {success: false, message: 'Client seeking this property does not exist', status: 403}
  };

  if (!agentUserDetails) {
    return {success: false, message: 'Agent attached to this property does not exist', status: 403}
  };

  const rentOutExists = await Rented.findOne({apartment: propertyIdTag, agent: agentId});

  if (rentOutExists) {
    return {success: false, message: 'The rental process has already been initiated for this property. To proceed, please cancel the initial one.', status: 403}
  };

  const userFullName = `${capitalizeName(potentialClient.lastName ?? '')} ${capitalizeName(potentialClient.surName ?? '')}`;
  const message = `Your contact agent: ${capitalizeName(current_user.lastName ?? '')} ${capitalizeName(current_user.surName ?? '')} have successfully initiated the rent-out process for the property with ID: ${propertyIdTag}. Check your account to continue with process of payment.\n\nThank you for using our service!`;

  const initialRentOutData = {
    user: userId,
    agent: agentId,
    apartment: propertyIdTag,
    rented: false,
  };

  const notificationData = {
    title: 'Apartment Rent-Out',
    content: `The rent-out process has been successfully intiated for the property with the ID: ${propertyIdTag}. You can go ahead and make payment.`,
    recipient: userId,
    issuer: agentUserDetails._id,
    type: 'payment',
    propertyId: propertyIdTag
  };

  const emailTemplate = await render(
    InspectionEmailTemplate({
      name: userFullName,
      title: 'Apartment Rent-Out',
      message: message
    })
  );

  const sendOption = {
    email: email,
    subject: 'Apartment Rent-Out Initialization',
    html: emailTemplate
  };

  try {
    const initialRentOut = await Rented.create(initialRentOutData);
    initialRentOut.save();
  
    await sendEmail(sendOption);

    const newNotification = await Notification.create(notificationData)
    newNotification.save();
    
    await User.findOneAndUpdate({_id: userId}, {$push: {notifications: newNotification._id}});
    await Apartment.findOneAndUpdate({propertyIdTag: propertyIdTag}, {$set: {availabilityStatus: 'pending'}}, {new: true});

    return {success: true, message: 'Rent out successfully initiated. Contact client', status: 200}
  } catch (error) {
    console.error(error);

    return {success: false, message: 'Error occurred while initiating rent-out try again later.', status: 500}
  }
};

export const cancelRentOut = async (data:cancelProps) => {
  const { agentId, propertyIdTag, path } = data
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return {success: false, message: 'You are not logged in, login to access this feature', status: 403}
  };

  if (current_user.role === 'user') {
    return {success: false, message: 'You are not authorized to use this feature', status: 403}
  };

  if (agentId !== current_user.agentId) {
    return {success: false, message: 'You are not authorized to cancel rent-out for this property', status: 403}
  };

  const rentOut = await Rented.findOne({agent: agentId, apartment: propertyIdTag});

  if (!rentOut) {
    return {success: false, message: 'Rent out does not exist', status: 403}
  };

  const potentialClient = await User.findById({_id: rentOut.user});

  if (!potentialClient) {
    return {success: false, message: 'Client seeking this property does not exist', status: 403}
  };
  const clientFullName = `${capitalizeName(potentialClient.lastName ?? '')} ${capitalizeName(potentialClient.surName ?? '')}`;
  const message = `Your contact agent: ${capitalizeName(current_user.lastName ?? '')} ${capitalizeName(current_user.surName ?? '')} has cancelled the rent-out process for the property with ID: ${propertyIdTag}.You can reachout to the agent to find out the reason for this change. \n\nThank you for using our service!`;

  const notificationData = {
    title: 'Rent-Out Cancellation',
    content: `The rent-out process intiated for the property with the ID: ${propertyIdTag} has been cancelled. For further details reachout to the contact agent.`,
    recipient: rentOut.user,
    issuer: current_user._id,
    type: 'payment',
    propertyId: propertyIdTag
  };

  const emailTemplate = await render(
    InspectionEmailTemplate({
      name: clientFullName,
      title: 'Rent-Out Cancellation',
      message: message
    })
  );

  const sendOption = {
    email: potentialClient.email,
    subject: 'Apartment Rent-Out Initialization',
    html: emailTemplate
  };

  try {
    await sendEmail(sendOption);
    const newNotification = await Notification.create(notificationData);
    newNotification.save();

    await User.findOneAndUpdate({_id: rentOut.user}, {$push: {notifications: newNotification._id}});
    await Rented.findOneAndDelete({apartment: propertyIdTag, agent: agentId});
    await Apartment.findOneAndUpdate({propertyIdTag: propertyIdTag}, {$set: {availabilityStatus: 'available'}}, {new: true});

    revalidatePath(path)
    return {success: true, message: 'Rent out successfully cancelled.', status: 200}
  } catch (error) {

    return {success: false, message: 'Error occurred while cancelling rent out.', status: 500}
  }
}
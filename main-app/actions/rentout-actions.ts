'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getCurrentUser } from "./user-actions";
import Rented from "@/models/rented";
import { render } from "@react-email/render";
import { InspectionEmailTemplate } from "@/components/email-templates/inspection-email-template";
import { sendEmail } from "@/lib/send-email";
import Notification from "@/models/notification";
import User from "@/models/user";

type initialProps = {
  userId: string;
  email:string;
  agentId: string;
  agentUserId: string;
  propertyIdTag: string;
};

export const initiateRentOut = async (data:initialProps) => {
  const { userId, agentId, propertyIdTag, email, agentUserId } = data
  await connectToMongoDB();

  const current_user = await getCurrentUser();
  const agentUserDetails = await User.findById({_id: agentUserId});

  if (!current_user) {
    return {success: false, message: 'You are not logged in, login to access this feature', status: 403}
  };

  if (current_user.role === 'user') {
    return {success: false, message: 'You are not authrized to use this feature', status: 403}
  };

  if (agentId !== current_user.agentId) {
    return {success: false, message: 'You are not authrized to rent out this property', status: 403}
  };

  if (!agentUserDetails) {
    return {success: false, message: 'Agent attached to this property does not exist', status: 403}
  };

  const rentOutExists = await Rented.findOne({apartment: propertyIdTag, agent: agentId});

  if (rentOutExists) {
    return {success: false, message: 'The rental process has already been initiated for this property. To proceed, please cancel the initial one.', status: 403}
  };

  const userFullName = `${current_user.lastName} ${current_user.firstName}`;
  const message = `Your contact agent have successfully initiated the rent-out process for the property with ID: ${propertyIdTag}. Check your account to continue with process of payment.\n\nThank you for using our service!`;

  const initialRentOutData = {
    user: userId,
    agent: agentId,
    apartment: propertyIdTag,
    rented: false,
  };

  const notificationData = {
    title: 'Apartment Rent-Out',
    content: `Your contact agent have successfully initiated the rent-out process for the property with ID: ${propertyIdTag}. Check your account to continue with process of payment.`,
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
    
    await User.findOneAndUpdate({_id: userId}, {$push: {notifications: newNotification._id}})

    return {success: true, message: 'Rent out successfully initiated. Contact client', status: 200}
  } catch (error) {
    console.error(error);

    return {success: false, message: 'Error occurred while initiating rent-out try again later.', status: 500}
  }
};
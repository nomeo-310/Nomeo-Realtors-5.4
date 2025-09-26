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

type scheduleInspetionType = {
  time: string;
  additionalPhoneNumber?: string;
  date: string;
  agentId: string;
  apartment: string;
  path: string;
};

export const scheduleInspection = async (data:scheduleInspetionType) => {
  const { time, additionalPhoneNumber, date, agentId, apartment } = data;
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in, login to access this feature', status: 403 }
  };

  const agent = await Agent.findOne({_id: agentId});
  const agentUserDetails = await User.findById({_id: agent?.userId});
  const currentApartment = await Apartment.findOne({propertyIdTag: apartment});

  if (!agent) {
    return { success: false, message: 'Agent attached to this property does not exist', status: 403 }
  };

  if (!agentUserDetails) {
    return { success: false, message: 'Agent attached to this property does not exist', status: 403 }
  };

  if (!currentApartment) {
    return { success: false, message: 'This property does not exist', status: 404 }
  };

  if (JSON.stringify(currentApartment.agent) === JSON.stringify(agent._id)) {
    return { success: false, message: 'You cannot schedule inspection for the property you are managing', status: 409 }
  }

  const existingInspection = await Inspection.findOne({user: current_user._id, apartment: currentApartment._id, date: date});

  if (existingInspection) {
    return { success: false, message: 'You have already scheduled an inspection for this date and time', status: 409 }
  };

  const userFullName = `${current_user.lastName} ${current_user.firstName}`;
  const agentFullName = `${agentUserDetails?.lastName} ${agentUserDetails?.firstName}`;

  const message = `${userFullName} scheduled for an inspection of one of the apartments you are managing. For more details checkout your notification on our website.`;

  const inspectionData = {
    date: date,
    time: time,
    user: current_user._id,
    apartment: apartment,
    agent: agentId,
    additionalNumber: additionalPhoneNumber,
  };

  try {
    const newInspection = await Inspection.create(inspectionData);
    newInspection.save();

    const userNotification = await Notification.create({
      type: 'inspection',
      title: 'Notification Reminder',
      content: `Here is a reminder that you scheduled an inspection with ${agentFullName} on ${date} for ${time}. Feel free to cancel this if you will not be able to meet up`,
      propertyId: apartment,
      issuer: current_user._id,
      recipient: current_user._id,
    });
    
    const agentNotification = await Notification.create({
      type: 'inspection',
      title: 'Notification Reminder',
      content: `Here is a reminder that you are scheduled for an inspection with ${userFullName} on ${date} for ${time}. Below are the details of the user and the apartment. Feel free to cancel this if you will not be able to meet up.`,
      propertyId: apartment,
      issuer: current_user._id,
      recipient: agentUserDetails ? agentUserDetails._id : null,
    });
    
    userNotification.save();
    agentNotification.save();

    await Agent.findOneAndUpdate({_id: agentId}, {$push: {inspections: newInspection._id}});
    await User.findOneAndUpdate({_id: agentUserDetails._id}, {$push: {notifications: agentNotification._id}});
    await User.findOneAndUpdate({_id: current_user._id}, {$push: {notifications: userNotification._id}});

    const emailTemplate = await render(
      InspectionEmailTemplate({
        name: agentFullName,
        title: 'Apartment Inspection Schedule',
        message: message
      })
    );

    const sendOption = {
      email: agentUserDetails.email,
      subject: 'Apartment Inspection Schedule',
      html: emailTemplate
    };

    await sendEmail(sendOption);

    return {success: true, message: 'Apartment inspection successfully scheduled', status: 201}
  } catch (error) {

    console.error(error);
    return {success: false, message: 'Error occurred while creating schedule', status: 500}
  }
};

export const cancelInspection = async (id:string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in, login to access this feature', status: 403 }
  };

  const inspection = await Inspection.findOne({_id: id, user: current_user._id});
  
  if (!inspection) {
    return { success: false, message: 'Inpsection does not exist!', status: 404 }
  };

  if (JSON.stringify(inspection.user) !== current_user._id) {
    return { success: false, message: 'You are not  authorized to acess this feature', status: 403 }
  };
  
  const agent = await Agent.findOne({_id: inspection.agent})

  if (!agent) {
    return { success: false, message: 'Agent does not exist!', status: 403 }
  };

  const agentUserDetails = await User.findById({_id: agent?.userId});

  if (!agentUserDetails) {
    return { success: false, message: 'Agent does not exist', status: 409 }
  };

  const userFullName = `${current_user.lastName} ${current_user.firstName}`;
  const agentFullName = `${agentUserDetails.lastName} ${agentUserDetails.firstName}`;

  const message = `${userFullName} cancelled the scheduled inspection of one of the apartments you are managing. For more details reach out to the user regarding the new schedule.`;

  try {
    await Agent.findOneAndUpdate({_id: inspection.agent}, {$pull: {inspections: inspection._id}})

    await Inspection.deleteOne({_id: inspection._id});

    const emailTemplate = await render(
      InspectionEmailTemplate({
        name: agentFullName,
        title: 'Inspection Cancellation',
        message: message
      })
    );

    const sendOption = {
      email: agentUserDetails.email,
      subject: 'Inspection Cancellation',
      html: emailTemplate
    };

    await sendEmail(sendOption);

    return {success: true, message: 'Inspection successfully cancelled', status: 200}
  } catch (error) {

    console.error(error);
    return {success: false, message: 'Error occurred while creating schedule', status: 500}
  }
};


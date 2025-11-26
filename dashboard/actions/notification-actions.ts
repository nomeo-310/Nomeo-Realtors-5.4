'use server'

import Notification from "@/models/notification";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "./auth-actions";


export const getSingleNotification = async (id:string) => {
  await connectToMongoDB();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {success: false, message: 'You are not authorized to access this', status: 403}
  };

  try {
    const single_notification = await Notification.findOne({_id: id})

    const notification = JSON.parse(JSON.stringify(single_notification))
    return notification;
  } catch (error) {
    console.error(error);
    return {success: false, message: 'Internal server error', status: 500}
  }
};

export const deleteAllNotifications = async () => {
  await connectToMongoDB();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {success: false, message: 'You are not authorized to access this feature', status: 403}
  };

  try {
    await Notification.updateMany({recipient: currentUser._id, seen: true}, { isDeleted: true })

    await User.findOneAndUpdate({_id: currentUser._id}, {notifications: []})
    return {success: true, message: 'All notifications successfully cleared', status: 200}
  } catch (error) {
    console.error(error);
    return {success: false, message: 'Internal server error', status: 500}    
  }
};

export const deleteSingleNotification = async (id:string) => {
  await connectToMongoDB();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {success: false, message: 'You are not authorized to access this feature', status: 403}
  };

  try {
    await Notification.updateOne({_id: id, recipient: currentUser._id, seen: true}, {isDeleted: true})

    await User.findOneAndUpdate({_id: currentUser._id}, {$pull: {notifications: new ObjectId(id)}})
    return {success: true, message: 'Notifications successfully deleted', status: 200}
  } catch (error) {
    console.error(error);
    return {success: false, message: 'Internal server error', status: 500}    
  }
};
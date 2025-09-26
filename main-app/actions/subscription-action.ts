'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB";
import { getCurrentUser } from "./user-actions";
import Subscription from "@/models/subscription";
import User from "@/models/user";
import { revalidatePath } from "next/cache";


export const subscribeUser = async ({email, path}:{email:string, path:string}) => {
  await connectToMongoDB();

  const currentUser = await getCurrentUser();

  let subscriptionData;

  if (currentUser && currentUser.email === email) {
    subscriptionData = {
      email: email,
      isUser: true,
      userId: currentUser._id
    }
  } else {
    subscriptionData = {
      email: email,
      isUser: false
    }
  };

  const alreaySubscribed = await Subscription.findOne({email: email});

  try {
    if (alreaySubscribed) {
      return {success: false, message: 'You have already subscribe to our newsletter', status: 409}
    };

    const subscription = await Subscription.create(subscriptionData);
    subscription.save();

    if (currentUser) {
      await User.findOneAndUpdate({email: email}, {subscribedToNewsletter: true})
    }

    revalidatePath(path);

    return {success: true, message: 'Subscription to newsletter was successful', status: 200}
    
  } catch (error) {
    return {success: false, message: 'Internal server error, try again later!', status: 500}
  }
};


export const unSubscribeUser = async (path:string) => {
  await connectToMongoDB();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {success: false, message: 'You are not logged in, login to access this feature!', status: 403}
  }

  
  try {
    await User.findOneAndUpdate({_id: currentUser._id}, {subscribedToNewsletter: false});
    revalidatePath(path);

    return {success: true, message: 'You have been removed from the subscription list', status: 200}
  } catch (error) {
    return {success: false, message: 'Internal server error, try again later!', status: 500}
  }
};
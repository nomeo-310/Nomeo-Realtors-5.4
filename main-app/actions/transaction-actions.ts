'use server'

import User from "@/models/user";
import { getCurrentUser } from "./user-actions"
import Apartment from "@/models/apartment";
import Transaction from "@/models/transaction";
import { revalidatePath } from "next/cache";
import Notification from "@/models/notification";


type transactionProps = {
  createdAt: string;
  transactionId: string;
  referenceId: string;
  transactionStatus: string;
  currency: string;
  amount: number;
  propertyId: string;
  agentUserId: string;
  path:string;
  paymentMethod: string;
};

export const initiateTransaction = async ({values}:{values: transactionProps}) => {
  const current_user = await getCurrentUser();

  const { propertyId, agentUserId, createdAt, currency, referenceId, transactionId, transactionStatus, amount, path, paymentMethod } = values;

  if (!current_user) {
    return { success: false, message: 'You are not logged in. Log in to acess this feature', status: 403}
  };

  const agentUserDetails = await User.findOne({_id: agentUserId, role: 'agent'})

  if (!agentUserDetails) {
    return {success: false, message: 'Agent does not exist', status: 403}
  }

  const property = await Apartment.findOne({propertyIdTag: propertyId});

  if (!property) {
    return {success: false, message: 'Apartment does not exist', status: 403}
  };

  try {
    const newTransactionData = {
      amount,
      user: current_user._id, 
      apartment: propertyId,
      agent: agentUserDetails.agentId,
      status: 'pending',
      type: property.propertyTag === 'for-rent' ? 'rent-payment' : 'apartment-purchase',
      approval: 'pending',
      createdAt,
      transactionId,
      referenceId,
      transactionStatus,
      currency,
      paymentMethod
    };
    
    const newTransaction = await Transaction.create(newTransactionData);
    newTransaction.save();

    const notificationData = {
      title: 'Transaction Initiated',
      content: `The transaction for the payment of ${currency}${amount.toLocaleString()} for ${property.propertyTypeTag === 'for-rent' ? 'property rent' : 'property purchase'} has been successfully intiated for the property with the ID: ${propertyId}. In case you haven't forwarded your payment receiept, go ahead and do that.`,
      recipient: current_user._id,
      issuer: current_user._id,
      type: 'payment',
      propertyId: propertyId
    };

    const newNotification = await Notification.create(notificationData);
    newNotification.save();

    await User.updateOne({_id: current_user._id}, {$push: {notifications: newNotification._id}});

    revalidatePath(path);
    return {success: true, message: 'Transaction successfully created', status: 200 }
  } catch (error) {
    return {success: false, message: 'Internal server error', status: 500}
  }

};

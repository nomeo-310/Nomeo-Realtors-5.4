'use server'

import User from "@/models/user";
import { getCurrentUser } from "./user-actions"
import Apartment from "@/models/apartment";
import Transaction from "@/models/transactions";
import { revalidatePath } from "next/cache";


type transactionProps = {
  createdAt: string;
  transactionId: string;
  referenceId: string;
  transactionStatus: string;
  currency: string;
  amount: number;
  type: string;
  propertyId: string;
  agentUserId: string;
  path:string;
};

export const initiateTransaction = async ({values}:{values: transactionProps}) => {
  const current_user = await getCurrentUser();

  const { propertyId, agentUserId, createdAt, currency, referenceId, transactionId, transactionStatus, type, amount, path } = values;

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
      apartment: propertyId,
      agent: agentUserDetails.agentId,
      status: 'pending',
      type,
      approval: 'pending',
      createdAt,
      transactionId,
      referenceId,
      transactionStatus,
      currency,
    };
    
    const newTransaction = await Transaction.create(newTransactionData);
    newTransaction.save();

    revalidatePath(path);
    return {success: true, message: 'Transaction successfully created', status: 200 }
  } catch (error) {
    return {success: false, message: 'Internal server error', status: 500}
  }

};

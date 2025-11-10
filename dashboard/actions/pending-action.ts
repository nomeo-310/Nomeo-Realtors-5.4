'use server'

import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { getCurrentUser } from "./auth-actions";
import { createServerPermissionService } from "@/utils/permission-service";
import Rentout from "@/models/rentout";
import Apartment from "@/models/apartment";
import User from "@/models/user";
import Notification from "@/models/notification";
import { revalidatePath } from "next/cache";
import Transaction from "@/models/transaction";
import Sellout from "@/models/sellout";

interface rentOutVerificationProps {
  startDate: Date;
  endDate: Date;
  rentoutId: string;
  path: string;
};

interface rejectionProps {
  rentoutId: string;
  path: string;
};

interface selloutProps {
  sellOutId: string;
  path: string;
}

export const verifyRentout = async (values:rentOutVerificationProps) => {
  const { startDate, endDate, rentoutId, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  };

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManagePendings) {
    return { success: false,  message: 'You are not authorized to manage transactons',  status: 403 };
  };

  const currentRentout = await Rentout.findById(rentoutId);

  if (!currentRentout) {
    return { success: false, message: 'Rentout does not exist!!', status: 404 }
  };

  const currentApartment = await Apartment.findOne({_id: currentRentout.apartment, propertyTag: 'for-rent'});

  if (!currentApartment) {
    return { success: false, message: 'Apartment does not exist!!', status: 404 }
  };

  const userDetails = await User.findById(currentRentout.user);

  if (!userDetails) {
    return { success: false, message: 'User does not exist!!', status: 404 }
  };

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your rent payment has been verified',
      content: `Your rent payment for the property with the ID: ${currentApartment.propertyIdTag}. situated at ${currentApartment.address}, ${currentApartment.state} has been verified. Your rent has started reading.`,
      recipient: userDetails._id,
      propertyId: currentApartment._id
    });
    await newNotification.save();

    await Rentout.findOneAndUpdate({ _id: rentoutId }, { status: 'completed', startDate, endDate, rented: true });
    await User.findByIdAndUpdate({_id: userDetails._id}, { $push: { notifications: newNotification._id }});

    const transaction = await Transaction.findOne({user: currentRentout.user, apartment: currentApartment.propertyIdTag, agent: currentRentout.agent, status: 'pending'});

    if (!transaction) {
      return { success: false, message: 'Transaction does not exist!!', status: 404 }
    };

    await Transaction.findOneAndUpdate({user: currentRentout.user, apartment: currentApartment.propertyIdTag, agent: currentRentout.agent, status: 'pending', transactionStatus: "pending"}, { status: 'completed', approval: 'approved', transactionStatus: "paid" });
    await Apartment.findOneAndUpdate({_id: currentApartment._id, agent: currentApartment.agent}, {availabilityStatus: 'rented'});

    revalidatePath(path);
    return { success: true, message: 'Rentout approved', status: 200 }
  } catch (error) {
    console.error('Error verifying property:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const rejectRentout = async (values: rejectionProps) => {
  const { rentoutId, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  };

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManagePendings) {
    return { success: false,  message: 'You are not authorized to manage transactons',  status: 403 };
  };

  const currentRentout = await Rentout.findById(rentoutId);

  if (!currentRentout) {
    return { success: false, message: 'Rentout does not exist!!', status: 404 }
  };

  const currentApartment = await Apartment.findById(currentRentout.apartment);

  if (!currentApartment) {
    return { success: false, message: 'Apartment does not exist!!', status: 404 }
  };

  const userDetails = await User.findById(currentRentout.user);

  if (!userDetails) {
    return { success: false, message: 'User does not exist!!', status: 404 }
  };

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your rent payment has been rejected',
      content: `Your rent payment for the property with the ID: ${currentApartment.propertyIdTag}. situated at ${currentApartment.address}, ${currentApartment.state} has been rejected. It has been 48 hours and your payment has not been verified.`,
      recipient: userDetails._id,
      propertyId: currentApartment._id
    });
    await newNotification.save();

    await Rentout.findOneAndUpdate({ _id: rentoutId }, { status: 'cancelled', rented: false });
    await User.findByIdAndUpdate({_id: userDetails._id}, { $push: { notifications: newNotification._id }});

    const transaction = await Transaction.findOne({user: currentRentout.user, apartment: currentApartment.propertyIdTag, agent: currentRentout.agent, status: 'pending'});

    if (!transaction) {
      return { success: false, message: 'Transaction does not exist!!', status: 404 }
    };

    await Transaction.findOneAndUpdate({user: currentRentout.user, apartment: currentApartment.propertyIdTag, agent: currentRentout.agent, status: 'pending'}, { status: 'cancelled', approval: 'unapproved' });
    await Apartment.findOneAndUpdate({_id: currentApartment._id, agent: currentApartment.agent}, {availabilityStatus: 'available'});

    revalidatePath(path);
    return { success: true, message: 'Rentout approved', status: 200 }
  } catch (error) {
    console.error('Error verifying property:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const verifySellout = async (values:selloutProps) => {
    const { sellOutId, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  };

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManagePendings) {
    return { success: false,  message: 'You are not authorized to manage transactons',  status: 403 };
  };

  const currentSellout = await Sellout.findById(sellOutId);

  if (!currentSellout) {
    return { success: false, message: 'Sellout does not exist!!', status: 404 }
  };

  const currentApartment = await Apartment.findOne({_id: currentSellout.apartment, propertyTag: 'for-sale'});

  if (!currentApartment) {
    return { success: false, message: 'Apartment does not exist!!', status: 404 }
  };

  const userDetails = await User.findById(currentSellout.user);

  if (!userDetails) {
    return { success: false, message: 'User does not exist!!', status: 404 }
  };

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your rent payment has been verified',
      content: `Your payment for the property with the ID: ${currentApartment.propertyIdTag}. situated at ${currentApartment.address}, ${currentApartment.state} has been verified. Your are now a proud property owner, other legal forms will sent to your email.`,
      recipient: userDetails._id,
      propertyId: currentApartment._id
    });
    await newNotification.save();

    await Sellout.findOneAndUpdate({ _id: sellOutId }, { status: 'completed', sold: true });
    await User.findByIdAndUpdate({_id: userDetails._id}, { $push: { notifications: newNotification._id }});

    const transaction = await Transaction.findOne({user: currentSellout.user, apartment: currentApartment.propertyIdTag, agent: currentSellout.agent, status: 'pending'});

    if (!transaction) {
      return { success: false, message: 'Transaction does not exist!!', status: 404 }
    };

    await Transaction.findOneAndUpdate({user: currentSellout.user, apartment: currentApartment.propertyIdTag, agent: currentSellout.agent, status: 'pending', transactionStatus: "pending"}, { status: 'completed', approval: 'approved', transactionStatus: "paid" });
    await Apartment.findOneAndUpdate({_id: currentApartment._id, agent: currentApartment.agent}, {availabilityStatus: 'sold'});

    revalidatePath(path);
    return { success: true, message: 'Sellout approved', status: 200 }
  } catch (error) {
    console.error('Error verifying property:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};

export const rejectSellout= async (values:rejectionProps) => {
    const { rentoutId:selloutId, path } = values;

  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return { success: false, message: 'You are not logged in', status: 403 };
  };

  const permissions = createServerPermissionService(current_user.role);

  if (!permissions.canManagePendings) {
    return { success: false,  message: 'You are not authorized to manage transactons',  status: 403 };
  };

  const currentSellout = await Sellout.findById(selloutId);

  if (!currentSellout) {
    return { success: false, message: 'Rentout does not exist!!', status: 404 }
  };

  const currentApartment = await Apartment.findById(currentSellout.apartment);

  if (!currentApartment) {
    return { success: false, message: 'Apartment does not exist!!', status: 404 }
  };

  const userDetails = await User.findById(currentSellout.user);

  if (!userDetails) {
    return { success: false, message: 'User does not exist!!', status: 404 }
  };

  try {
    const newNotification = await Notification.create({
      type: 'verification',
      title: 'Your payment has been rejected',
      content: `Your payment for the property with the ID: ${currentApartment.propertyIdTag}. situated at ${currentApartment.address}, ${currentApartment.state} has been rejected. It has been 48 hours and your payment has not been verified.`,
      recipient: userDetails._id,
      propertyId: currentApartment._id
    });
    await newNotification.save();

    await Sellout.findOneAndUpdate({ _id: selloutId }, { status: 'cancelled', sold: false });
    await User.findByIdAndUpdate({_id: userDetails._id}, { $push: { notifications: newNotification._id }});

    const transaction = await Transaction.findOne({user: currentSellout.user, apartment: currentApartment.propertyIdTag, agent: currentSellout.agent, status: 'pending'});

    if (!transaction) {
      return { success: false, message: 'Transaction does not exist!!', status: 404 }
    };

    await Transaction.findOneAndUpdate({user: currentSellout.user, apartment: currentApartment.propertyIdTag, agent: currentSellout.agent, status: 'pending'}, { status: 'cancelled', approval: 'unapproved' });
    await Apartment.findOneAndUpdate({_id: currentApartment._id, agent: currentApartment.agent}, {availabilityStatus: 'available'});

    revalidatePath(path);
    return { success: true, message: 'Sellout rejected', status: 200 }
  } catch (error) {
    console.error('Error verifying property:', error);
    return { success: false, message: 'Internal server error', status: 500 };
  }
};
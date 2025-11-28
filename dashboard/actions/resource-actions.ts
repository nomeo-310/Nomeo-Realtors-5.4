"use server"

import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Attachment from "@/models/attachment";
import Suspension from "@/models/suspension";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";

export const getSingleProperty = async (id: string): Promise<any | null> => {
  await connectToMongoDB();

  try {
    const property = await Apartment.findOne({ propertyIdTag: id })
      .populate({
        path: 'agent',
        model: Agent,
        select: 'agencyName inspectionFeePerHour userId officeAddress officeNumber _id',
        populate: {
          path: 'userId',
          model: User,
          select: '_id surName lastName city state profilePicture'
        }
      })
      .populate({
        path: 'apartmentImages',
        model: Attachment,
        select: '_id images'
      })
      .lean()
      .exec();

    return JSON.parse(JSON.stringify(property)) || null;

  } catch (error) {
    console.error('Error fetching property:', error);
    throw new Error('Failed to fetch property details');
  }
};

export const getSingleSuspendedUser = async (id: string) => {
  await connectToMongoDB();

  try {
    const suspension = await Suspension.findOne({ 
      user: id, 
      isActive: true 
    })
    .select('user isActive suspendedUntil history')
    .populate({
      path: 'user',
      model: User,
      select: 'surName lastName city state profilePicture email phoneNumber additionalPhoneNumber address bio role'
    })
    .lean() 
    .exec();

    if (!suspension) {
      return null;
    }

    return JSON.parse(JSON.stringify(suspension)) || null;

  } catch (error) {
    console.error('Error fetching suspended user:', error);
    throw new Error('Failed to fetch suspended user details');
  }
}
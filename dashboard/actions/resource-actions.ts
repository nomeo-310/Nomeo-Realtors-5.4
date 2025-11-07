"use server"

import { PropertyProps } from "@/lib/types";
import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Attachment from "@/models/attachment";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";

export const getSingleProperty = async (id:string) => {
  await connectToMongoDB();

  try {
    const property = await Apartment.findOne({propertyIdTag: id})
    .populate({
      path: 'agent',
      model: Agent,
      select: ('agencyName inspectionFeePerHour userId officeAddress officeNumber _id'),
      populate: {
        path: 'userId',
        model: User,
        select: ('_id surName lastName city state profilePicture')
      }
    })
    .populate({
      path: 'apartmentImages',
      model: Attachment,
      select: ('_id images')
    })
  
    const singleProperty = JSON.parse(JSON.stringify(property));
  
    return singleProperty as PropertyProps
  } catch (error) {
    console.error(error)
    return;
  }

};
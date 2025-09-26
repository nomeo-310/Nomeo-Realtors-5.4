import Agent from "@/models/agent";
import User from "@/models/user";
import Apartment from "@/models/apartment";
import Attachment from "@/models/attachment";
import { getCurrentUser } from "@/actions/user-actions";

export const POST = async (request:Request) => {

  const { page } = await request.json();
  const value = page || undefined;
  const pageNumber = parseInt(value as string);
  const pageSize = 6;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  };

  if (!current_user.userIsAnAgent) {
    return Response.json({error: 'You are not authorized to access this feature'}, {status: 403})
  };

  try {
    const properties = await Apartment.find({agent: current_user.agentId})
    .select('-bookmarks -reviews -likes')
    .populate({
      path: 'apartmentImages',
      model: Attachment,
      select: 'images'
    })
    .populate({
      path: 'agent',
      model: Agent,
      select: 'licenseNumber coverPicture officeNumber officeAddress agencyName agentRatings agentVerified verificationStatus inspectionFeePerHour apartments clients createdAt userId',
      populate: {
        path: 'userId',
        model: User,
        select: 'username email firstName lastName profilePicture bio address city state phoneNumber additionalPhoneNumber role'
      }
    }).skip((pageNumber - 1) * pageSize)
    .limit(pageSize + 1)
    .sort({created_at: -1})
    .exec();

    const nextPage = properties.length > pageSize ? pageNumber + 1 : undefined;

    const data = {
      properties: properties.slice(0, pageSize),
      nextPage: nextPage
    };
     
    return Response.json(data);
  } catch (error) {
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  }
}
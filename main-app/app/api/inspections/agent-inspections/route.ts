import { getCurrentUser } from "@/actions/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Inspection from "@/models/inspection";
import User from "@/models/user";

export const POST = async (request:Request) => {
  await connectToMongoDB();
  
  const { page } = await request.json();
  const value = page || undefined;
  const pageNumber = parseInt(value as string);
  const pageSize = 6;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({success: false, message: 'Unathourized'}, {status: 403})
  };

  if (current_user.role !== 'agent') {
    return Response.json({success: false, message: 'Unathourized'}, {status: 403})
  }

  try {
    const inspections = await Inspection.find({agent: current_user.agentId})
    .populate({
      path: 'user',
      model: User,
      select: 'surName lastName profilePicture phoneNumber email'
    })
    .populate({
      path: 'agent', 
      model: Agent,
      select: 'officeAddress agencyName officeNumber userId',
      populate: {
      path: 'userId',
      model: User,
      select: 'surName lastName profilePicture phoneNumber email'}
    })
    .populate({
      path: 'apartment',
      model: Apartment,
      select: 'propertyIdTag address city state annualRent propertyTag propertyPrice bedrooms bathrooms toilets'
    })
    .sort({ date: 1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize + 1)
    .exec();

    const nextPage = inspections.length > pageSize ? pageNumber + 1 : undefined;

    const data = {
      inspections: inspections.slice(0, pageSize),
      nextPage: nextPage
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({success: false, message: 'Internal server error'}, {status: 500});
  }
}
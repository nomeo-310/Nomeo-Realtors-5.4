import { getCurrentUser } from "@/actions/user-actions";
import Agent from "@/models/agent";
import User from "@/models/user";

export const GET = async () => {
  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  };

  try {
    const profile = await User.findById(current_user._id)
    .select('_id username surName lastName role email profilePicture bio phoneNumber city state userVerified additionalPhoneNumber')
    .populate({
      path: 'agentId',
      model: Agent,
      select: 'licenseNumber coverPicture officeNumber officeAddress agencyName agentRatings agentVerified verificationStatus inspectionFeePerHour apartments clients createdAt'
    }).exec();
    
    
    return Response.json(profile);
  } catch (error) {
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  }
}
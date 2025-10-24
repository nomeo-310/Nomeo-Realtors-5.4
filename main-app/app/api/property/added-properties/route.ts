import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Attachment from "@/models/attachment";
import { getCurrentUser } from "@/actions/user-actions";

export const GET = async (req:Request) => {

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 6;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  };

  if (!current_user.userIsAnAgent) {
    return Response.json({error: 'You are not authorized to access this feature'}, {status: 403})
  };

  try {
    const skip = (page - 1) * limit;

    const properties = await Apartment.find({agent: current_user.agentId})
    .select('_id propertyTag propertyIdTag city state bedrooms bathrooms squareFootage annualRent propertyPrice facilityStatus hideProperty availabilityStatus')
    .populate({
      path: 'apartmentImages',
      model: Attachment,
      select: 'images'
    })
    .populate({
      path: 'agent',
      model: Agent,
      select: '_id userId',
    }).skip(skip)
    .limit(limit)
    .sort({created_at: -1})
    .exec();

    const totalProperties = await Apartment.countDocuments({agent: current_user.agentId});

    const data = {
      properties,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProperties / limit),
        totalProperties,
        hasNextPage: page < Math.ceil(totalProperties / limit),
        hasPrevPage: page > 1,
      },
    };
     
    return Response.json(data);
  } catch (error) {
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  }
}
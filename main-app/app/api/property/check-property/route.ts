import { getCurrentUser } from "@/actions/user-actions";
import Apartment from "@/models/apartment";
import Rented from "@/models/rented";
import User from "@/models/user";

export const POST = async (request:Request) => {
  const { propertyId, agentUserId } = await request.json();

  const current_user = await getCurrentUser();
  const agentUserDetails = await User.findById({_id: agentUserId});


  if (!current_user) {
    return Response.json({error: 'You are not logged in'}, {status: 400});
  }

  if (!propertyId) {
    return Response.json({error: 'Property ID is required!! Enter it'}, {status: 400});
  };

  if (!agentUserDetails) {
    return Response.json({error: 'Agent attached to this property does not exist'}, {status: 400});
  };

  const property = await Rented.findOne({user: current_user._id, apartment: propertyId, agent: agentUserDetails.agentId, rented: false, status: 'initiated'});

  if (!property) {
    return Response.json({error: 'Property not found'}, {status: 400});
  };

  try {
    const currentProperty = await Apartment.findOne({propertyIdTag: propertyId, agent: agentUserDetails.agentId})
    .select('address title annualRent mainFees bedrooms bathrooms toilets squareFootage state city')
    .exec();

    return Response.json(currentProperty);
  } catch (error) {
    return Response.json({error: 'Internal server error'}, {status: 500});
  }

}
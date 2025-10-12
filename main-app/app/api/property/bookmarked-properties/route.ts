import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Attachment from "@/models/attachment";
import { getCurrentUser } from "@/actions/user-actions";
import User from "@/models/user";

export const GET = async (req:Request) => {

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 6;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  };

  try {
    const skip = (page - 1) * limit;

    const properties = await Apartment.find({_id: {$in: current_user.bookmarkedApartments}})
    .select('_id propertyTag propertyIdTag propertyTypeTag city state bedrooms bathrooms toilets squareFootage annualRent propertyPrice facilityStatus')
    .populate({
      path: 'apartmentImages',
      model: Attachment,
      select: 'images'
    })
    .populate({
      path: 'agent',
      model: Agent,
      select: '_id userId licenseNumber',
      populate: {
        path: 'userId',
        model: User,
        select: 'email profilePicture placeholderColor surName lastName'
      }
    })
    .skip(skip)
    .limit(limit)
    .sort({created_at: -1})
    .exec();

    const totalProperties = await Apartment.countDocuments({_id: {$in: current_user.bookmarkedApartments}});

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
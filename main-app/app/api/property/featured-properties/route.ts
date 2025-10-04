import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Apartment from "@/models/apartment";

let cachedFeatured: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 30;

export const GET = async (req: Request) => {
  await connectToMongoDB();

  try {
    const now = Date.now();

    if (!cachedFeatured.length || now - lastFetchTime > CACHE_DURATION) {
      cachedFeatured = await Apartment.aggregate([
        { $match: { propertyApproval: "pending" } },
        { $sample: { size: 4 } },
        {
          $lookup: {
            from: "agents",
            localField: "agent",
            foreignField: "_id",
            as: "agent",
          },
        },
        { $unwind: { path: "$agent", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "agent.userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            propertyTag: 1,
            propertyTypeTag: 1,
            propertyIdTag: 1,
            city: 1,
            state: 1,
            propertyPrice: 1,
            annualRent: 1,
            squareFootage: 1,
            furnitureStatus: 1,
            facilityStatus: 1,
            bedrooms: 1,
            bathrooms: 1,
            createdAt: 1,
            toilets: 1,
            apartmentImages: 1,
            agent: {
              _id: "$agent._id",
              licenseNumber: "$agent.licenseNumber",
              userId: { 
                surName: "$userDetails.surName",
                lastName: "$userDetails.lastName",
                email: "$userDetails.email",
                profilePicture: "$userDetails.profilePicture",
                placeholderColor: "$userDetails.placeholderColor",
              },
            },
          },
        },
        {
          $lookup: {
            from: "attachments",
            localField: "apartmentImages",
            foreignField: "_id",
            as: "apartmentImages",
            pipeline: [{ $project: { images: 1, _id: 1 } }],
          },
        },
        { $unwind: { path: "$apartmentImages", preserveNullAndEmptyArrays: true } },      
      ]);
      lastFetchTime = now;
    }

    return Response.json(cachedFeatured);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error, try again later" },{ status: 500 });
  }
};
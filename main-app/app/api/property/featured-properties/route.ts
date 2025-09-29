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
            location: 1,
            bedrooms: 1,
            bathrooms: 1,
            createdAt: 1,
            apartmentImages: 1,
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
      ]);
      lastFetchTime = now;
    }

    return Response.json(cachedFeatured);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error, try again later" },{ status: 500 });
  }
};
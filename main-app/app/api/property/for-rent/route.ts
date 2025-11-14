import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Attachment from "@/models/attachment";
import User from "@/models/user";
import { FilterQuery } from "mongoose";

type searchQueryProps = {
  minimumRent: number;
  maximumRent: number;
  numberOfRooms: number;
  numberOfToilets: number;
  state: string;
  city: string;
  propertyTag: string;
  propertyApproval: string;
};


type paramQuery = {
  annualRent?: { $gte: number; $lte?: number };
  state?: string;
  city?: string;
  bedrooms?: number;
  toilets?: number;
  propertyTag: string;
  propertyApproval: string;
};

export const GET = async (req: Request) => {
  await connectToMongoDB();
  
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const minimumRent = parseInt(searchParams.get("minimumRent") || "0");
  const maximumRent = parseInt(searchParams.get("maximumRent") || "0");
  
  const numberOfRooms = parseInt(searchParams.get("numberOfRooms") || "0"); 
  const numberOfToilets = parseInt(searchParams.get("numberOfToilets") || "0");
  
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";

  const limit = 6;

  const buildQuery = (filters: searchQueryProps): FilterQuery<paramQuery> => {
    const query: FilterQuery<paramQuery> = { };
    
    if (filters.minimumRent > 0 || filters.maximumRent > 0) {
      query.annualRent = {};
      
      if (filters.minimumRent > 0) {
        query.annualRent.$gte = filters.minimumRent;
      }

      if (filters.maximumRent > 0) {
        query.annualRent.$lte = filters.maximumRent;
      }
    }

    if (filters.state) {
      query.state = filters.state;
    }
    if (filters.city) {
      query.city = filters.city;
    }

    if (filters.numberOfRooms > 0) {
      query.bedrooms = filters.numberOfRooms;
    }
    if (filters.numberOfToilets > 0) {
      query.toilets = filters.numberOfToilets;
    }
    
    query.propertyTag = 'for-rent';
    query.propertyApproval = 'approved';
    
    return query;
  };
  
  const query = buildQuery({
    minimumRent,
    maximumRent,
    numberOfRooms,
    numberOfToilets,
    state,
    city,
    propertyTag: 'for-rent',
    propertyApproval: 'pending'
  });

  try {
    const skip = (page - 1) * limit;

    const properties = await Apartment.find(query)
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

    const totalProperties = await Apartment.countDocuments(query);

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
      
    return Response.json(data, {status: 200});
  } catch (error) {
    console.error("Apartment fetch error:", error);
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  }
}

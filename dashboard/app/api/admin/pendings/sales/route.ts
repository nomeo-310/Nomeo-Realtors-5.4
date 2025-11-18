import { getCurrentUser } from "@/actions/auth-actions";
import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import Rentout from "@/models/rentout";
import Sellout from "@/models/sellout";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { guardVerificationAccess } from "@/utils/server-permissions";

export const GET = async (req: Request) => {
  await connectToMongoDB();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 8;
  const skip = (page - 1) * limit;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  };

  try {
    // Use permission guard instead of hardcoded role check
    await guardVerificationAccess(current_user.role);

    const apartments = await Sellout.find({ status: "pending" })
      .populate({
        path: 'user',
        model: User,
        select: 'lastName surName email profilePicture placeholderColor'
      })
      .populate({
        path: 'agent',
        model: Agent,
        select: 'agencyName',
        populate: ({
          path: 'userId',
          model: User,
          select: 'lastName surName email profilePicture placeholderColor'
        })
      })
      .populate({
        path: 'apartment',
        model: Apartment,
        select: 'propertyTag propertyIdTag propertyPrice city state'
      })
      .sort({ createdAt: -1 }) 
      .skip(skip) 
      .limit(limit);

    const totalSellOuts = await Sellout.countDocuments({ status: "pending" });
    const totalPages = Math.ceil(totalSellOuts / limit);

    const data = {
      pagination: {
        currentPage: page,
        totalPages: totalPages, 
        totalApartments: totalSellOuts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        perPage: limit
      },
      sellouts: apartments,
    };

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching unverified agents:", error);
    
    // Handle permission errors specifically
    if (error instanceof Error && error.message.includes('not authorized')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    
    return Response.json(
      { error: "Internal server error, try again later" },
      { status: 500 }
    );
  }
};
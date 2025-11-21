import { getCurrentUser } from "@/actions/auth-actions";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { guardUserAccess } from "@/utils/server-permissions";

// Constants
const RESULTS_PER_PAGE = 10;

// Validation function for sort order
const isValidSortOrder = (order: string): order is 'asc' | 'desc' => {
  return order === 'asc' || order === 'desc';
};

// Convert 'asc'/'desc' to MongoDB sort values
const getSortValue = (sortOrder: string): 1 | -1 => {
  return sortOrder === 'asc' ? 1 : -1;
};

export const POST = async (request: Request) => {
  try {
    const { queryText, sortOrder = 'desc', city, state, page = '1' } = await request.json();

    // Validate sort order early
    if (!isValidSortOrder(sortOrder)) {
      return Response.json(
        { error: "Invalid sort order. Use 'asc' or 'desc'" },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const current_user = await getCurrentUser();
    if (!current_user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await guardUserAccess(current_user.role);

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const skip = (pageNumber - 1) * RESULTS_PER_PAGE;

    // Build search filter
    const searchFilter = {
      role: 'user',
      userAccountDeleted: false, 
      userAccountSuspended: true,
      _id: { $ne: current_user.userId },
      ...(queryText && {
        $or: [
          { surName: new RegExp(queryText, 'i') },
          { lastName: new RegExp(queryText, 'i') },
          { username: new RegExp(queryText, 'i') },
          { email: new RegExp(queryText, 'i') }
        ]
      }),
      ...(state && { state }),
      ...(city && { city })
    };

    // Execute queries in parallel for better performance
    const [users, totalUsers] = await Promise.all([
      User.find(searchFilter)
        .select('lastName surName profilePicture phoneNumber address city state userVerified email username placeholderColor phoneNumber createdAt role userAccountSuspended')
        .limit(RESULTS_PER_PAGE)
        .skip(skip)
        .sort({ createdAt: getSortValue(sortOrder) })
        .exec(),
      
      User.countDocuments(searchFilter)
    ]);

    const totalPages = Math.ceil(totalUsers / RESULTS_PER_PAGE);

    const data = {
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalUsers,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
        perPage: RESULTS_PER_PAGE
      },
    };

    return Response.json(data, { status: 200 });

  } catch (error) {
    console.error('Error in users API:', error);
    
    if (error instanceof Error && error.message.includes('not authorized')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    
    return Response.json(
      { error: "Internal server error, try again later" },
      { status: 500 }
    );
  }
};
import { getCurrentUser } from "@/actions/auth-actions";
import Rentout from "@/models/rentout";
import Sellout from "@/models/sellout";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { guardPendingAccess } from "@/utils/server-permissions";

export const GET = async () => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await guardPendingAccess(current_user.role);
    const totalPendingRentals = await Rentout.countDocuments({status: 'pending'});
    const totalPendingSales = await Sellout.countDocuments({status: 'pending'})

    const allPendingCounts = {
      pendingRentals: totalPendingRentals,
      pendingSales: totalPendingSales,
      totalPending: totalPendingRentals + totalPendingSales
    };

    return Response.json(allPendingCounts);
  } catch (error) {
    console.error(error);
    
    if (error instanceof Error && error.message.includes('not authorized')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    
    return Response.json(
      { error: "Internal server error, try again later" },
      { status: 500 }
    );
  }
};
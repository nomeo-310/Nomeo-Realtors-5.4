import { getCurrentUser } from "@/actions/auth-actions";
import Agent from "@/models/agent";
import Apartment from "@/models/apartment";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { guardVerificationAccess } from "@/utils/server-permissions";

export const GET = async () => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await guardVerificationAccess(current_user.role);

    const totalUnverifiedAgents = await Agent.countDocuments({verificationStatus: 'pending'});
    const totalPendingProperties = await Apartment.countDocuments({ propertyApproval: 'pending'});

    const allVerificationCounts = {
      unverifiedAgents: totalUnverifiedAgents,
      unverifiedProperties: totalPendingProperties,
      totalUnverified: totalUnverifiedAgents + totalPendingProperties
    };

    return Response.json(allVerificationCounts);
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
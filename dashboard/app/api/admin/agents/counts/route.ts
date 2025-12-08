import { getCurrentUser } from "@/actions/auth-actions";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { guardUserAccess } from "@/utils/server-permissions";

export const GET = async () => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  };

  try {
    await guardUserAccess(current_user.role);

    const totalActiveUsers = await User.countDocuments({role: 'agent', userVerified: true, userAccountDeleted: false, userAccountSuspended: false});
    const totalDeletedUsers = await User.countDocuments({role: 'agent', userAccountDeleted: true});
    const totalSuspendedUsers = await User.countDocuments({role: 'agent', userAccountSuspended: true});
    const totalUnverifiedUsers = await User.countDocuments({role: 'agent', userVerified: false});

    const allUserCounts = {
      activeAgents: totalActiveUsers,
      deletedAgents: totalDeletedUsers,
      suspendedAgents: totalSuspendedUsers,
      unverifiedAgents: totalUnverifiedUsers
    }

    return Response.json(allUserCounts)
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
}
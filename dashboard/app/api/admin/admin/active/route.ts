import { getCurrentUser } from "@/actions/auth-actions";
import Admin from "@/models/admin";
import User from "@/models/user";
import { connectToMongoDB } from "@/utils/connectToMongoDB";
import { guardAdminAccess } from "@/utils/server-permissions";

export const GET = async () => {
  try {
    await connectToMongoDB();
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    await guardAdminAccess(currentUser.role);

    const admins = await Admin.find({_id: {$ne: currentUser._id},  isActive: true, isActivated: true, isSuspended: false })
    .select('userId role adminAccess adminOnboarded createdAt adminId isActive adminPermissions deactivated')
    .populate({
      path: 'userId',
      model: User,
      select: 'email surName lastName phoneNumber profileImage'
    })
    .lean()
    .exec();

    return Response.json(admins);

  } catch (error) {
    console.error('Error fetching admins:', error);
    
    if ((error as any).message?.includes('Access denied') || (error as any).status === 403) {
      return Response.json({ 
        error: "Forbidden", 
        message: "Insufficient permissions" 
      }, { status: 403 });
    }
    
    return Response.json({ 
      error: "Internal Server Error", 
      message: "Failed to fetch admin data" 
    }, { status: 500 });
  }
};
import { getCurrentUser } from "@/actions/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Notification from "@/models/notification";

export const PUT = async () => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  }

  try {
    await Notification.updateMany({recipient: current_user._id, seen: false, isDeleted: false}, {seen: true})

    return Response.json({success: 'All notifications read'}, {status: 200})
  } catch (error) {
    console.error(error)
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  };
}
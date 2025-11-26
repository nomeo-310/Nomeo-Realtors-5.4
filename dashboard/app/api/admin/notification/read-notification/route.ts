import { getCurrentUser } from "@/actions/auth-actions";
import Notification from "@/models/notification";
import { connectToMongoDB } from "@/utils/connectToMongoDB";

export const PUT = async () => {
  await connectToMongoDB();
  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  }

  try {
    await Notification.updateMany({recipient: current_user.userId._id, seen: false}, {seen: true})

    return Response.json({success: 'All notifications read'}, {status: 200})
  } catch (error) {
    console.error(error)
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  };
}
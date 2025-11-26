import { getCurrentUser } from "@/actions/auth-actions";
import Notification from "@/models/notification";
import { connectToMongoDB } from "@/utils/connectToMongoDB";

export const GET = async () => {
  await connectToMongoDB();
  
  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  }

  try {
    const notifications = await Notification.countDocuments({recipient: current_user.userId._id, seen: false})
    const data = {count: notifications};

    return Response.json(data);
  } catch (error) {
    console.error(error)
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  };
}
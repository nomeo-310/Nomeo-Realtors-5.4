import { getCurrentUser } from "@/actions/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Notification from "@/models/notification";

export const GET = async () => {
  await connectToMongoDB();
  
  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  }

  try {
    const notifications = await Notification.countDocuments({recipient: current_user._id, seen: false})
    const data = {count: notifications};

    return Response.json(data);
  } catch (error) {
    console.error(error)
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  };
}
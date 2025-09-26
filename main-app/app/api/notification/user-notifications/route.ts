import { getCurrentUser } from "@/actions/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Notification from "@/models/notification";
import User from "@/models/user";

export const POST = async (request:Request) => {
  await connectToMongoDB();
  
  const { page } = await request.json();
  const value = page || undefined;
  const pageNumber = parseInt(value as string);
  const pageSize = 6;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({success: false, message: 'Unathourized'}, {status: 403})
  };

  try {
    const notifications = await Notification.find({recipient: current_user._id})
    .populate({
      path:'issuer', 
      model: User,
      select: 'firstName lastName profilePicture phoneNumber'
    })
    .populate({
      path:'recipient', 
      model: User,
      select: 'firstName lastName profilePicture phoneNumber'
    }) 
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize + 1)
    .sort({created_at: -1})
    .exec();

    const nextPage = notifications.length > pageSize ? pageNumber + 1 : undefined;

    const data = {
      notifications: notifications.slice(0, pageSize),
      nextPage: nextPage
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({success: false, message: 'Internal server error'}, {status: 500});
  }
};
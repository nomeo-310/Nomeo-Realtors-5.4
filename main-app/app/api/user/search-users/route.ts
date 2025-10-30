import { getCurrentUser } from "@/actions/user-actions";
import User from "@/models/user";

export const POST = async (request:Request) => {
  const { queryText } = await request.json();

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  };

  try {
    const users = await User.find({role: 'user', _id:{ $ne: current_user?._id }, $or: [{ name: new RegExp(queryText, 'i')},{ username: new RegExp(queryText, 'i') }, { email: new RegExp(queryText, 'i') }]})
    .select('_id username surName lastName role email profilePicture phoneNumber')
    .limit(6).exec();
    
    
    return Response.json(users);
  } catch (error) {
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  }
}
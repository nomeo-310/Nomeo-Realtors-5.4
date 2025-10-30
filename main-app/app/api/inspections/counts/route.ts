import { getCurrentUser } from "@/actions/user-actions";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import Inspection from "@/models/inspection";

export const GET = async () => {
  await connectToMongoDB();
  
  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  }

  if (current_user.role !== 'agent') {
   return Response.json({error: 'Unathourized'}, {status: 403})
  }

  try {
    const inspections = await Inspection.countDocuments({agent: current_user.agentId, status: 'pending'})
    const data = {count: inspections};

    return Response.json(data);
  } catch (error) {
    console.error(error)
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  };
}
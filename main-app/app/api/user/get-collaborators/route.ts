import { getCurrentUser } from "@/actions/user-actions";
import User from "@/models/user";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

type requestBody = {
  contributorIds: string[];
}

export const POST = async (request:NextRequest) => {
  const { contributorIds } = await request.json() as requestBody;

  if (!Array.isArray(contributorIds)) {
    return Response.json({error: 'Internal server error, try again later'}, {status: 400});
  }

  const current_user = await getCurrentUser();

  if (!current_user) {
    return Response.json({error: 'Unathourized'}, {status: 403})
  };

  let validIds

  validIds = contributorIds.filter(id => mongoose.Types.ObjectId.isValid(id));

  if (contributorIds.length > 2) {
    const ids = contributorIds.slice(0, 2);
    validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
  }

  try {
    const users = await User.find({_id: {$in: validIds}})
    .select('_id username surName lastName role email profilePicture phoneNumber')
    
    
    return Response.json(users);
  } catch (error) {
    return Response.json({error: 'Internal server error, try again later'}, {status: 500}); 
  }
}
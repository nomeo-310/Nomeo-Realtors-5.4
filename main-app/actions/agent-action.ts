'use server'

import { connectToMongoDB } from "@/lib/connectToMongoDB";
import { getCurrentUser } from "./user-actions";
import Agent from "@/models/agent";

export const getAgentVerificationStatus = async (agentId: string) => {
  try {
    await connectToMongoDB();
    
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'agent' || currentUser.agentId !== agentId) {
      return { verified: false, error: 'Unauthorized or invalid user' };
    }

    const agentDetails = await Agent.findOne({_id: currentUser.agentId, verificationStatus: 'verified'});

    if (agentDetails) {
      return { isPending: false };
    } else {
      return { isPending: true, error: 'Agent is not verified' };
    }

  } catch (error) {
    console.error("Error in getAgentVerificationStatus:", error);
    return { isPending: true, error: 'An unexpected error occurred' };
  }
};
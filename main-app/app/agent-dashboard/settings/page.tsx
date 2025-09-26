import { getAgentById, getCurrentUser } from "@/actions/user-actions";
import SettingsClient from "@/components/pages/dashboard/settings-client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: "Settings",
};

const SettingsPage = async () => {
  const current_user = await getCurrentUser();

  if (!current_user || !current_user.agentId) {
    redirect("/");
  }

  const agent_details = await getAgentById(current_user.agentId);

  return <SettingsClient user={current_user} agent={agent_details} />;
};

export default SettingsPage;

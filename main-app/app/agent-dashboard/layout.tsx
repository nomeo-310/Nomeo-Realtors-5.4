import AgentDashboardLayout from "@/components/layouts/agent-dashboard-layout";
import { redirect } from "next/navigation";
import { userDetails } from "@/lib/types";
import { getCurrentUserDetails } from "@/actions/user-actions";


export default async function Layout({children}: {children: React.ReactNode}) {
  const current_user:userDetails = await getCurrentUserDetails();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'agent') {
    redirect('/user-dashboard') 
  };

  return (
    <AgentDashboardLayout>
      {children}
    </AgentDashboardLayout>
  );
}

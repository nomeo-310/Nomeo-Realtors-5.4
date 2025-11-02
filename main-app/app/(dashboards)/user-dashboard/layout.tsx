import { getCurrentUserDetails } from "@/actions/user-actions";
import UserDashboardLayout from "@/components/layouts/user-dashboard-layout";
import { userDetails } from "@/lib/types";
import { notFound, redirect } from "next/navigation";


export default async function Layout({children}:{children: React.ReactNode}) {
  const current_user:userDetails = await getCurrentUserDetails();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'user') {
    if (current_user.role === 'agent') {
      redirect('/agent-dashboard')
    } else {
      notFound();
    }
  };
  
  return (
    <UserDashboardLayout>
      {children}
    </UserDashboardLayout>
  );
}

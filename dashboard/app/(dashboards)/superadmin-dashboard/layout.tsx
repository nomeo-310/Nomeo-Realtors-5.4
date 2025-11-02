import { getCurrentUser } from "@/actions/auth-actions";
import SuperAdminDashboardLayout from "@/components/layouts/superadmin-dashboard-layout";
import { notFound, redirect } from "next/navigation";


export default async function Layout({children}: {children: React.ReactNode}) {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'superAdmin') {
    notFound();
  };

  console.log(current_user)

  return (
    <SuperAdminDashboardLayout>
      {children}
    </SuperAdminDashboardLayout>
  );
}
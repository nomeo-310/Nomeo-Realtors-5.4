import { getCurrentUser } from "@/actions/auth-actions";
import AdminDashboardLayout from "@/components/layouts/admin-dashboard-layout";
import { notFound, redirect } from "next/navigation";


export default async function Layout({children}: {children: React.ReactNode}) {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'admin') {
    notFound();
  };
  
  return (
    <AdminDashboardLayout>
      {children}
    </AdminDashboardLayout>
  );
}
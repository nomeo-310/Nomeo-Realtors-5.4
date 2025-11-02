import { getCurrentUser } from "@/actions/auth-actions";
import CreatorDashboardLayout from "@/components/layouts/creator-dashboard-layout";
import { notFound, redirect } from "next/navigation";


export default async function Layout({children}: {children: React.ReactNode}) {
  const current_user = await getCurrentUser();

  if (!current_user) {
    redirect('/')
  };

  if (current_user.role !== 'creator') {
    notFound();
  };
  
  return (
    <CreatorDashboardLayout>
      {children}
    </CreatorDashboardLayout>
  );
}
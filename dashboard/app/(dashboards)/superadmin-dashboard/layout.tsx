import SuperAdminDashboardLayout from "@/components/layouts/superadmin-dashboard-layout";


export default async function Layout({children}: {children: React.ReactNode}) {

  return (
    <SuperAdminDashboardLayout>
      {children}
    </SuperAdminDashboardLayout>
  );
}
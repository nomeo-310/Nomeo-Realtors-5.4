import AdminDashboardLayout from "@/components/layouts/admin-dashboard-layout";


export default async function Layout({children}: {children: React.ReactNode}) {

  return (
    <AdminDashboardLayout>
      {children}
    </AdminDashboardLayout>
  );
}
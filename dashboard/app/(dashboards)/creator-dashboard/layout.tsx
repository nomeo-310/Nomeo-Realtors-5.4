import CreatorDashboardLayout from "@/components/layouts/creator-dashboard-layout";


export default async function Layout({children}: {children: React.ReactNode}) {

  return (
    <CreatorDashboardLayout>
      {children}
    </CreatorDashboardLayout>
  );
}
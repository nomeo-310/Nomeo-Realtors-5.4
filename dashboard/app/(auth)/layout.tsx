import type { Metadata } from "next";
import AuthLayout from "@/components/layouts/auth-layout";

export const metadata: Metadata = {
  title: { template: "Dashboard | %s", default: "Nomeo Realtors | Dashboard" },
  description: "A real estate webapp built with ReactJS bootsrapped in NextJS, styled with TailwindCSS. A WebApp designed by Salomi Afolabi of Nomeo Consults. The app was initially intended as a real estate application to help in leasing and purchasing apartments but in the future will include investment opportunities as well other types of real estate adverts. This application is an updated version of the just concluded Nomeo Suites 5.1",
};

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Quicksand, Urbanist } from "@/lib/font";
import ModalProvider from "@/provider/modal-provider";
import { ThemeProvider } from "@/provider/theme-provider";
import QueryProvider from "@/provider/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { template: "Nomeo Realtors | %s", default: "Nomeo Realtors | Dashboard" },
  description: "A real estate webapp built with ReactJS bootsrapped in NextJS, styled with TailwindCSS. A WebApp designed by Salomi Afolabi of Nomeo Consults. The app was initially intended as a real estate application to help in leasing and purchasing apartments but in the future will include investment opportunities as well other types of real estate adverts. This application is an updated version of the just concluded Nomeo Suites 5.1",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={`${Urbanist.variable} ${Quicksand.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem={false}>
          <QueryProvider>
            <Toaster position="bottom-right" richColors/>
            <ModalProvider/>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

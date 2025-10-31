import type { Metadata } from "next";
import "@/app/globals.css";
import Navbar from "@/app/components/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/app/components/sidebar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SIPAHADIG BENGKULU IIA",
  description: "Sistem Pengelolaan Arsip Lapas Kelas IIA Bengkulu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <div className="px-5 mt-5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

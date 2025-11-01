"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  FileUp,
  FileDown,
  FileClock,
  FileArchive,
  Shield,
  ShieldHalf,
  ShieldOff,
  LogOut,
  Settings,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const dokumenKategori = [
    { nama: "SK TIM Pemeriksa", slug: "sk-tim-pemeriksa", icon: FileText },
    { nama: "Surat Panggilan", slug: "surat-panggilan", icon: FileUp },
    { nama: "Berkas BAP", slug: "berkas-bap", icon: FileDown },
    { nama: "Resume BAP", slug: "resume-bap", icon: FileClock },
    { nama: "Telaahan", slug: "telaahan", icon: FileArchive },
  ];

  return (
    <Sidebar>
      <SidebarContent className="pt-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarGroup>
              <Link href="/dashboard">
                <SidebarMenuButton isActive={pathname === "/dashboard"}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarGroup>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarGroup>
              {dokumenKategori.map((k) => {
                const Icon = k.icon;
                return (
                  <Link href={`/dashboard/dokumen/${k.slug}`} key={k.slug}>
                    <SidebarMenuButton
                      isActive={pathname === `/dashboard/dokumen/${k.slug}`}
                    >
                      <Icon className="w-4 h-4" />
                      {k.nama}
                    </SidebarMenuButton>
                  </Link>
                );
              })}
            </SidebarGroup>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarGroup>
              <Link href="/dashboard/arsip/ringan">
                <SidebarMenuButton
                  isActive={
                    pathname.startsWith("/dashboard/arsip") &&
                    pathname.includes("ringan")
                  }
                >
                  <Shield className="w-4 h-4" />
                  Hukuman Disiplin Ringan
                </SidebarMenuButton>
              </Link>
              <Link href="/dashboard/arsip/sedang">
                <SidebarMenuButton
                  isActive={
                    pathname.startsWith("/dashboard/arsip") &&
                    pathname.includes("sedang")
                  }
                >
                  <ShieldHalf className="w-4 h-4" />
                  Hukuman Disiplin Sedang
                </SidebarMenuButton>
              </Link>
              <Link href="/dashboard/arsip/berat">
                <SidebarMenuButton
                  isActive={
                    pathname.startsWith("/dashboard/arsip") &&
                    pathname.includes("berat")
                  }
                >
                  <ShieldOff className="w-4 h-4" />
                  Hukuman Disiplin Berat
                </SidebarMenuButton>
              </Link>
            </SidebarGroup>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Link href="/dashboard/dokumen/pengaturan">
            <SidebarMenuButton
              isActive={pathname === "/dashboard/dokumen/pengaturan"}
            >
              <Settings className="w-4 h-4" />
              Pengaturan Dokumen
            </SidebarMenuButton>
          </Link>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;

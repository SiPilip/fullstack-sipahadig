import { LoginForm } from "@/app/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOGIN - SIPAHADIG BENGKULU IIA",
  description: "Sistem Pengelolaan Arsip Lapas Kelas IIA Bengkulu",
};

export default function page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

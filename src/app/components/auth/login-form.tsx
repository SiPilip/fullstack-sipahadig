"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import bgLogin from "@/../public/images/bg-lapas-bengkulu.png";
import lapasBengkuluLogo from "@/../public/images/lapas-bengkulu.png";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Mencoba masuk...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Login berhasil!", { id: toastId });
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Terjadi kesalahan.", { id: toastId });
      }
    } catch (error) {
      toast.error("Tidak dapat terhubung ke server.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="w-full h-full absolute z-0 top-0 left-0">
        <Image
          src={bgLogin}
          fill
          className="object-cover opacity-50 "
          alt="bg-login"
        />
      </div>
      <Card className="z-50 flex flex-row gap-0 items-center w-full py-12 px-5">
        <div className="w-2/5  flex items-center justify-center">
          <div className="w-36 relative aspect-square " key={"logoimipas"}>
            <Image
              src={lapasBengkuluLogo}
              fill
              className="object-contain"
              alt="logo1"
            />
          </div>
        </div>
        <div className="w-3/5">
          <CardHeader className="mb-5">
            <CardTitle className="leading-6! text-lg">
              Anda memasuki Sistem Pengelolaan Arsip Lembaga Pemasyarakatan
              Kelas IIA Bengkulu
            </CardTitle>
            <CardDescription>
              Harap masukkan identitas autoritas anda!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#1b1d55] rounded-none!"
                  >
                    {loading ? "Harap tunggu..." : "Masuk"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

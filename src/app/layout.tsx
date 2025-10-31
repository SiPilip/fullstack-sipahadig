import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["200", "300", "400", "700"], // Specify desired weights
  subsets: ["latin"], // Specify desired subsets
  variable: "--font-poppins", // Assign a CSS variable name
  display: "swap", // Recommended for font loading optimization
});

export const metadata: Metadata = {
  title: "SIPAHADIG BENGKULU",
  description: "Sistem Pengelolaan Arsip Lapas II Bengkulu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}

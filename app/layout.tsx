import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Splendo Hotel & Suites",
  description: "Splendo Room Service & QR Order Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col bg-[#F5F4EF] text-stone-900 font-sans">
        {children}
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  );
}

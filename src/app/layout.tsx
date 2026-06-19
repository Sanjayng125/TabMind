import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TabMind",
  description: "Save tabs. AI tags them. Find anything instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        // "h-full",
        // "antialiased",
        // "font-mono",
        "dark",
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className="bg-[#0A0A0D] antialiased">
        <QueryProvider>
          <Header />
          {children}
          <Toaster richColors />
        </QueryProvider>
      </body>
    </html>
  );
}

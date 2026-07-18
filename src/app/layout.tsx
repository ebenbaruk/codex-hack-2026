import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Buyable — Acquisition intelligence for Codex",
    template: "%s · Buyable",
  },
  description:
    "Give Codex the intelligence to find, prove and pursue the best private businesses to buy.",
  applicationName: "Buyable",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0d0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

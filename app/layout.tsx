import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font" });

export const metadata = {
  title: "Openpath: stop invoice fraud before your AI agent pays",
  description: "Exact rules the AI cannot override, AI judgment only where it is needed, and an independent score on every payment decision.",
};

export const viewport = { themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

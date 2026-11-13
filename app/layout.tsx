import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Openpath",
  description: "See the exact path every agent decision takes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

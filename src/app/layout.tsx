import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lion's Share Bookkeeping",
  description: "Self-hosted bookkeeping for Lion's Share Digital",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

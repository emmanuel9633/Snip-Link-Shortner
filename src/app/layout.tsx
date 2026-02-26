import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snip — Link Shortener",
  description: "A modern link shortener with analytics dashboard built with Next.js 15",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

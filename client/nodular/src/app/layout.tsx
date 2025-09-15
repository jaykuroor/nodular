import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Use the Inter font for a modern, clean look
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cognoscent - AI Chat Board",
  description: "A multi-threaded AI chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
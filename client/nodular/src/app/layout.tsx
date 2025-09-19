import type { Metadata } from "next";
import { Ubuntu, Work_Sans } from "next/font/google";
import "./globals.css";

// Use the Inter font for a modern, clean look
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ['300', '400', '500', '700']
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: "Nodular",
  description: "Explore realities with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>{children}</body>
    </html>
  );
}
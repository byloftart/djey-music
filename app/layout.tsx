import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "DJey Music",
  description: "Original music by DJey Music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

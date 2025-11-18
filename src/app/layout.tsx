import type { Metadata } from "next";
import "@/app/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Wolfie",
  description: "Created by nilmarp.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

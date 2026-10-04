import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor · Jaksel Weekend Strolls",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

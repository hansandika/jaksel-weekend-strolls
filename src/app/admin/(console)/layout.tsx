import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidSessionCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const ok = await isValidSessionCookie(
    cookieStore.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_SECRET,
  );
  if (!ok) redirect("/admin");
  return children;
}

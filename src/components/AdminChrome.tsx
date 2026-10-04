import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";

export function AdminChrome({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="phone-shell">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-coral">Editor</p>
        <div className="flex items-center gap-3 text-[12px] text-cream/45">
          <Link href="/admin/queue" className="hover:text-cream">
            Queue
          </Link>
          <Link href="/admin/discover" className="hover:text-cream">
            Discover
          </Link>
          <Link href="/" className="hover:text-cream">
            Hub
          </Link>
          <form action={logoutAdmin}>
            <button type="submit" className="hover:text-cream">
              Log out
            </button>
          </form>
        </div>
      </div>
      <h1 className="mt-1.5 text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-cream">
        {title}
      </h1>
      <p className="mt-2 text-[14px] leading-snug text-cream/55">{subtitle}</p>
      {children}
    </main>
  );
}

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidSessionCookie } from "@/lib/admin-auth";
import { loginAdmin } from "./actions";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const authed = await isValidSessionCookie(
    cookieStore.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_SECRET,
  );
  if (authed) redirect("/admin/queue");

  return (
    <main className="phone-shell">
      <p className="text-[13px] font-medium text-coral">Editor</p>
      <h1 className="mt-1.5 text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-cream">
        Candidate Queue
      </h1>
      <p className="mt-2 text-[14px] leading-snug text-cream/55">
        Admin secret login. Public hub stays at{" "}
        <Link href="/" className="text-coral">
          /
        </Link>
        .
      </p>

      <form action={loginAdmin} className="mt-8 space-y-3">
        <input type="hidden" name="next" value={params.next || "/admin/queue"} />
        <label className="block text-[12px] text-cream/50" htmlFor="secret">
          Admin secret
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-full bg-[#2b2522] px-4 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none"
          placeholder="paste secret"
        />
        {params.error ? (
          <p className="text-[13px] text-coral">Wrong secret. Try again.</p>
        ) : null}
        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-[12px] bg-coral text-[15px] font-semibold text-ink"
        >
          Enter
        </button>
      </form>
    </main>
  );
}

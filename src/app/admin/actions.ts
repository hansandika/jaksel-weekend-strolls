"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  isValidSessionCookie,
  makeSessionToken,
} from "@/lib/admin-auth";
import {
  runDiscovery,
  setCandidateStatus,
  updateCandidate,
} from "@/lib/admin-api";
import { fetchOverpassElements } from "@/lib/overpass";

async function isHttps(): Promise<boolean> {
  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto");
  const host = headerStore.get("host") ?? "";
  return proto === "https" || host.includes("trycloudflare.com");
}

export async function loginAdmin(formData: FormData) {
  const secret = String(formData.get("secret") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin/queue");
  const next = nextRaw.startsWith("/admin") ? nextRaw : "/admin/queue";
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    redirect("/admin?error=1");
  }
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, await makeSessionToken(process.env.ADMIN_SECRET), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: await isHttps(),
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(next);
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: await isHttps(),
    maxAge: 0,
  });
  redirect("/admin");
}

async function requireSession() {
  const cookieStore = await cookies();
  const ok = await isValidSessionCookie(
    cookieStore.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_SECRET,
  );
  if (!ok) redirect("/admin");
}

export async function bulkSetStatus(formData: FormData) {
  await requireSession();
  const status = String(formData.get("status") ?? "");
  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length === 0) redirect("/admin/queue?notice=select");
  await setCandidateStatus(ids, status);
  revalidatePath("/admin/queue");
  redirect("/admin/queue");
}

export async function setOneStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) redirect("/admin/queue");
  await setCandidateStatus([id], status);
  revalidatePath("/admin/queue");
  revalidatePath(`/admin/candidates/${id}`);
  redirect(`/admin/candidates/${id}`);
}

export async function saveCandidateDraft(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const draft_why = String(formData.get("draft_why") ?? "");
  const draft_tip = String(formData.get("draft_tip") ?? "");
  const tiktokRaw = String(formData.get("tiktok_urls") ?? "");
  const tiktok_urls = tiktokRaw
    .split(/\s+/)
    .map((url) => url.trim())
    .filter(Boolean);
  if (!id) redirect("/admin/queue");
  await updateCandidate(id, { draft_why, draft_tip, tiktok_urls });
  revalidatePath(`/admin/candidates/${id}`);
  redirect(`/admin/candidates/${id}?saved=1`);
}

export async function startDiscovery(formData: FormData) {
  await requireSession();
  const areas = formData.getAll("areas").map(String);
  const placeTypes = formData.getAll("place_types").map(String);
  let result: Awaited<ReturnType<typeof runDiscovery>> | undefined;
  try {
    result = await runDiscovery(areas, placeTypes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery failed";
    if (!/overpass/i.test(message)) {
      redirect(`/admin/discover?error=${encodeURIComponent(message)}`);
    }
    try {
      const elements = await fetchOverpassElements(areas, placeTypes);
      result = await runDiscovery(areas, placeTypes, elements);
    } catch (fallbackError) {
      const fallback =
        fallbackError instanceof Error ? fallbackError.message : message;
      redirect(`/admin/discover?error=${encodeURIComponent(fallback)}`);
    }
  }
  if (!result) {
    redirect("/admin/discover?error=Discovery%20failed");
  }
  revalidatePath("/admin/queue");
  revalidatePath("/admin/discover");
  redirect(
    `/admin/discover?ok=1&inserted=${result.inserted}&found=${result.found}&skipped=${result.skipped}`,
  );
}

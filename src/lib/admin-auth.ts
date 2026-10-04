const COOKIE = "jws_admin";
const SESSION_PAYLOAD = "jaksel-admin-session-v1";

export const ADMIN_COOKIE = COOKIE;

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function makeSessionToken(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(SESSION_PAYLOAD),
  );
  return hex(sig);
}

export async function isValidSessionCookie(
  value: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!value || !secret) return false;
  const expected = await makeSessionToken(secret);
  if (value.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < value.length; i++) {
    out |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return out === 0;
}

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const adminLookupCookieName = "guiding_light_admin_lookup";
const sessionSecret =
  process.env.SESSION_SECRET ?? "guiding-light-dev-session-secret";

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const unquoted = trimmed.replace(/^['"]+|['"]+$/g, "").trim();

  return unquoted || null;
}

function signAdminLookupAccess(key: string) {
  return createHmac("sha256", sessionSecret)
    .update(`admin-lookup:${key}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function getAdminLookupKey() {
  return normalizeEnvValue(process.env.ADMIN_LOOKUP_KEY);
}

export function isAdminLookupConfigured() {
  return Boolean(getAdminLookupKey());
}

export async function hasAdminLookupAccess() {
  const adminLookupKey = getAdminLookupKey();

  if (!adminLookupKey) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(adminLookupCookieName)?.value;

  if (!token) {
    return false;
  }

  return safeEqual(token, signAdminLookupAccess(adminLookupKey));
}

export async function grantAdminLookupAccess(inputKey: string) {
  const adminLookupKey = getAdminLookupKey();

  if (!adminLookupKey || !safeEqual(inputKey.trim(), adminLookupKey)) {
    return false;
  }

  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);

  cookieStore.set(adminLookupCookieName, signAdminLookupAccess(adminLookupKey), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return true;
}

export async function clearAdminLookupAccess() {
  const cookieStore = await cookies();
  cookieStore.delete(adminLookupCookieName);
}

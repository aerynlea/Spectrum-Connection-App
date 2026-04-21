import { createHmac, timingSafeEqual } from "node:crypto";

import type { MemberRosterRecord } from "@/lib/app-types";
import { getAppUrl } from "@/lib/platform";

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

export function getNewsletterPostalAddress() {
  return normalizeEnvValue(process.env.NEWSLETTER_POSTAL_ADDRESS);
}

function signNewsletterToken(userId: string, email: string) {
  return createHmac("sha256", sessionSecret)
    .update(`newsletter:${userId}:${email.toLowerCase()}`)
    .digest("base64url");
}

export function buildNewsletterUnsubscribeUrl(member: Pick<MemberRosterRecord, "id" | "email">) {
  const url = new URL("/newsletter/unsubscribe", getAppUrl());

  url.searchParams.set("user", member.id);
  url.searchParams.set("token", signNewsletterToken(member.id, member.email));

  return url.toString();
}

export function verifyNewsletterUnsubscribeToken(input: {
  userId: string;
  email: string;
  token: string;
}) {
  const expectedToken = signNewsletterToken(input.userId, input.email);
  const left = Buffer.from(input.token);
  const right = Buffer.from(expectedToken);

  return (
    left.length === right.length &&
    timingSafeEqual(left, right)
  );
}

import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSession,
  deleteExpiredSessions,
  deleteSession,
  getUserByExternalAuthId,
  getSession,
  getUserById,
  upsertHostedUser,
} from "@/lib/data";
import { isClerkConfigured } from "@/lib/platform";

const sessionCookieName = "guiding_light_session";
const sessionSecret =
  process.env.SESSION_SECRET ?? "guiding-light-dev-session-secret";

function signSessionId(sessionId: string) {
  return createHmac("sha256", sessionSecret).update(sessionId).digest("base64url");
}

export function hashPasswordResetToken(token: string) {
  return createHmac("sha256", sessionSecret)
    .update(`password-reset:${token}`)
    .digest("hex");
}

function createSessionToken(sessionId: string) {
  return `${sessionId}.${signSessionId(sessionId)}`;
}

function parseSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [sessionId, signature] = token.split(".");

  if (!sessionId || !signature) {
    return null;
  }

  const expectedSignature = signSessionId(sessionId);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return sessionId;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");

  return (
    storedBuffer.length === derivedHash.length &&
    timingSafeEqual(storedBuffer, derivedHash)
  );
}

export async function establishSession(userId: string) {
  if (isClerkConfigured) {
    return;
  }

  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  const sessionId = await createSession(userId, expiresAt);

  cookieStore.set(sessionCookieName, createSessionToken(sessionId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearSession() {
  if (isClerkConfigured) {
    return;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  const sessionId = parseSessionToken(token);

  if (sessionId) {
    await deleteSession(sessionId);
  }

  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser() {
  if (isClerkConfigured) {
    const { userId } = await clerkAuth();

    if (!userId) {
      return null;
    }

    const existingUser = await getUserByExternalAuthId(userId);

    if (existingUser) {
      return existingUser;
    }

    const clerkUser = await clerkCurrentUser();
    const primaryEmail = clerkUser?.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    );
    const fallbackEmail = clerkUser?.emailAddresses[0]?.emailAddress;
    const email = primaryEmail?.emailAddress ?? fallbackEmail;

    if (!clerkUser || !email) {
      return null;
    }

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      email.split("@")[0] ||
      "Guiding Light Member";

    return await upsertHostedUser({
      externalAuthId: userId,
      email,
      name: fullName,
    });
  }

  await deleteExpiredSessions();

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  const sessionId = parseSessionToken(token);

  if (!sessionId) {
    return null;
  }

  const session = await getSession(sessionId);

  if (!session || new Date(session.expires_at) <= new Date()) {
    cookieStore.delete(sessionCookieName);
    return null;
  }

  return await getUserById(session.user_id);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      isClerkConfigured
        ? "/sign-in"
        : "/auth?error=Please sign in to continue.",
    );
  }

  return user;
}

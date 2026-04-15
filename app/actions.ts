"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearSession,
  establishSession,
  hashPassword,
  hashPasswordResetToken,
  requireCurrentUser,
  verifyPassword,
} from "@/lib/auth";
import { syncCurrentClerkMetadata } from "@/lib/clerk-metadata";
import {
  ageGroupOptions,
  communityTopicOptions,
  goalOptions,
  roleOptions,
} from "@/lib/catalog";
import {
  createPasswordResetToken,
  createCommunityReply,
  createCommunityPost,
  createUser,
  deleteExpiredPasswordResetTokens,
  deleteSessionsForUser,
  getUserAuthByEmail,
  getUserByEmail,
  getPasswordResetToken,
  markPasswordResetTokenUsed,
  toggleSavedResource,
  updateUserPassword,
  updateUserProfile,
} from "@/lib/data";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/email";
import { hasPremiumAccess } from "@/lib/membership";
import type { AgeGroup, GoalKey, UserRole } from "@/lib/app-types";
import { formatRole } from "@/lib/formatters";
import { getAppUrl, isClerkConfigured, isProductionDeployment } from "@/lib/platform";
import { stripe, getStripePriceId, getStripeReturnUrl } from "@/lib/stripe";

const validRoles = new Set(roleOptions.map((option) => option.value));
const validAgeGroups = new Set(ageGroupOptions.map((option) => option.value));
const validGoals = new Set(goalOptions.map((option) => option.value));
const validTopics = new Set(communityTopicOptions);

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

function buildPath(pathname: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `${pathname}?${search.toString()}`;
}

function pickGoals(formData: FormData) {
  return formData
    .getAll("goals")
    .map((value) => String(value))
    .filter((value): value is GoalKey => validGoals.has(value as GoalKey));
}

function pickRole(value: FormDataEntryValue | null) {
  const role = String(value ?? "");

  return validRoles.has(role as UserRole) ? (role as UserRole) : null;
}

function pickAgeGroup(value: FormDataEntryValue | null) {
  const ageGroup = String(value ?? "");

  return validAgeGroups.has(ageGroup as AgeGroup)
    ? (ageGroup as AgeGroup)
    : null;
}

function revalidateAppShell() {
  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/community");
  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath("/membership");
  revalidatePath("/onboarding");
  revalidatePath("/professionals");
  revalidatePath("/resources");
}

export async function signUpAction(formData: FormData) {
  if (isClerkConfigured) {
    redirect("/sign-up");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const role = pickRole(formData.get("role"));
  const ageGroup = pickAgeGroup(formData.get("ageGroup"));
  const goals = pickGoals(formData);

  if (!name || !email || !password || !location || !role || !ageGroup) {
    redirect(
      buildPath("/auth", {
        error: "Please complete every required sign-up field.",
      }),
    );
  }

  if (password.length < 8) {
    redirect(
      buildPath("/auth", {
        error: "Use a password with at least 8 characters.",
      }),
    );
  }

  if (goals.length === 0) {
    redirect(
      buildPath("/auth", {
        error: "Choose at least one support goal so recommendations can respond to you.",
      }),
    );
  }

  if (await getUserByEmail(email)) {
    redirect(
      buildPath("/auth", {
        error: "An account with that email already exists. Try signing in instead.",
      }),
    );
  }

  const user = await createUser({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    ageGroup,
    location,
    goals,
    verified: false,
    onboardingCompleted: false,
  });

  if (!user) {
    redirect(buildPath("/auth", { error: "We could not create your account." }));
  }

  await establishSession(user.id);
  revalidateAppShell();
  redirect(
    buildPath("/onboarding", {
      message: "Welcome to Guiding Light. Let’s shape your support space.",
    }),
  );
}

export async function signInAction(formData: FormData) {
  if (isClerkConfigured) {
    redirect("/sign-in");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(buildPath("/auth", { error: "Enter your email and password." }));
  }

  const authRecord = await getUserAuthByEmail(email);

  if (!authRecord || !verifyPassword(password, authRecord.password_hash)) {
    redirect(
      buildPath("/auth", {
        error: "That email and password combination did not match.",
      }),
    );
  }

  await establishSession(authRecord.id);
  revalidateAppShell();
  redirect(buildPath("/dashboard", { message: "You are signed in." }));
}

export async function requestPasswordResetAction(formData: FormData) {
  if (isClerkConfigured) {
    redirect("/sign-in");
  }

  if (isProductionDeployment && !isPasswordResetEmailConfigured()) {
    redirect(
      buildPath("/forgot-password", {
        error:
          "Password reset email is being connected right now. Please try again shortly.",
      }),
    );
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect(
      buildPath("/forgot-password", {
        error: "Enter the email connected to your account first.",
      }),
    );
  }

  await deleteExpiredPasswordResetTokens();

  const user = await getUserByEmail(email);
  const authRecord = await getUserAuthByEmail(email);

  if (!user || !authRecord) {
    redirect(
      buildPath("/forgot-password", {
        message:
          "If that email is in Guiding Light, a reset link will be on the way.",
      }),
    );
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

  await createPasswordResetToken(user.id, tokenHash, expiresAt);

  const resetUrl = `${getAppUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const emailSent = await sendPasswordResetEmail({
    name: user.name,
    to: user.email,
    resetUrl,
  });

  if (!emailSent && process.env.NODE_ENV !== "production") {
    redirect(
      buildPath("/reset-password", {
        message:
          "Email delivery is not connected yet, so this development link was opened directly.",
        token: rawToken,
      }),
    );
  }

  redirect(
    buildPath("/forgot-password", {
      message:
        "If that email is in Guiding Light, a reset link will be on the way.",
    }),
  );
}

export async function resetPasswordAction(formData: FormData) {
  if (isClerkConfigured) {
    redirect("/sign-in");
  }

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    redirect(
      buildPath("/forgot-password", {
        error: "That reset link is missing or no longer valid.",
      }),
    );
  }

  if (!password || !confirmPassword) {
    redirect(
      buildPath("/reset-password", {
        error: "Enter and confirm your new password.",
        token,
      }),
    );
  }

  if (password.length < 8) {
    redirect(
      buildPath("/reset-password", {
        error: "Use a password with at least 8 characters.",
        token,
      }),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      buildPath("/reset-password", {
        error: "Those passwords did not match.",
        token,
      }),
    );
  }

  await deleteExpiredPasswordResetTokens();

  const tokenRecord = await getPasswordResetToken(hashPasswordResetToken(token));

  if (
    !tokenRecord ||
    tokenRecord.used_at ||
    new Date(tokenRecord.expires_at) <= new Date()
  ) {
    redirect(
      buildPath("/forgot-password", {
        error: "That reset link has expired. Request a new one to keep going.",
      }),
    );
  }

  await updateUserPassword(tokenRecord.user_id, hashPassword(password));
  await markPasswordResetTokenUsed(tokenRecord.id);
  await deleteSessionsForUser(tokenRecord.user_id);

  revalidateAppShell();
  redirect(
    buildPath("/auth", {
      message: "Your password has been reset. Sign in with your new password.",
    }),
  );
}

export async function signOutAction() {
  await clearSession();
  revalidateAppShell();
  redirect(buildPath("/", { message: "You have been signed out." }));
}

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const currentUser = await requireCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const role = pickRole(formData.get("role"));
  const ageGroup = pickAgeGroup(formData.get("ageGroup"));
  const goals = pickGoals(formData);

  if (!name || !location || !role || !ageGroup || goals.length === 0) {
    return {
      status: "error",
      message: "Please keep every profile field completed before saving.",
    };
  }

  await updateUserProfile(currentUser.id, {
    name,
    role,
    ageGroup,
    location,
    goals,
  });

  revalidateAppShell();
  return {
    status: "success",
    message: "Your profile has been saved.",
  };
}

export async function completeOnboardingAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const role = pickRole(formData.get("role"));
  const ageGroup = pickAgeGroup(formData.get("ageGroup"));
  const goals = pickGoals(formData);

  if (!name || !location || !role || !ageGroup || goals.length === 0) {
    redirect(
      buildPath("/onboarding", {
        error: "Please finish each onboarding step before continuing.",
      }),
    );
  }

  const updatedUser = await updateUserProfile(currentUser.id, {
    name,
    role,
    ageGroup,
    location,
    goals,
    onboardingCompleted: true,
  });

  if (updatedUser) {
    await syncCurrentClerkMetadata({
      onboardingCompleted: true,
      membershipTier: updatedUser.membershipTier,
      subscriptionStatus: updatedUser.subscriptionStatus,
    });
  }

  revalidateAppShell();
  redirect(
    buildPath("/dashboard", {
      message: "Your support space is ready.",
    }),
  );
}

export async function toggleSavedResourceAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const resourceId = String(formData.get("resourceId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/resources");

  if (!resourceId) {
    redirect(returnTo);
  }

  await toggleSavedResource(currentUser.id, resourceId);
  revalidateAppShell();
  redirect(returnTo);
}

export async function startPremiumCheckoutAction() {
  const currentUser = await requireCurrentUser();

  if (!currentUser.onboardingCompleted) {
    redirect(
      buildPath("/onboarding", {
        error: "Finish onboarding before starting membership.",
      }),
    );
  }

  if (hasPremiumAccess(currentUser)) {
    redirect(
      buildPath("/membership", {
        message: "Your premium membership is already active.",
      }),
    );
  }

  const priceId = getStripePriceId();

  if (!stripe || !priceId) {
    redirect(
      buildPath("/membership", {
        error: "Membership checkout is still being connected.",
      }),
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    client_reference_id: currentUser.id,
    customer: currentUser.stripeCustomerId ?? undefined,
    customer_email: currentUser.stripeCustomerId ? undefined : currentUser.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId: currentUser.id,
      userEmail: currentUser.email,
    },
    subscription_data: {
      metadata: {
        userId: currentUser.id,
      },
    },
    success_url: `${getStripeReturnUrl("/membership/success")}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: getStripeReturnUrl("/membership/cancel"),
  });

  if (!session.url) {
    redirect(
      buildPath("/membership", {
        error: "We could not open Stripe checkout just yet.",
      }),
    );
  }

  redirect(session.url);
}

export async function openPremiumBillingPortalAction() {
  const currentUser = await requireCurrentUser();

  if (!stripe || !currentUser.stripeCustomerId) {
    redirect(
      buildPath("/membership", {
        error: "Your billing portal is not ready yet.",
      }),
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: currentUser.stripeCustomerId,
    return_url: getStripeReturnUrl("/membership"),
  });

  redirect(session.url);
}

export async function createCommunityPostAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const topic = String(formData.get("topic") ?? "");
  const tag = String(formData.get("tag") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!validTopics.has(topic as (typeof communityTopicOptions)[number])) {
    redirect(buildPath("/community", { error: "Choose a valid topic group." }));
  }

  if (!tag || !title || !body) {
    redirect(
      buildPath("/community", {
        error: "Please fill out the topic, tag, title, and post body.",
      }),
    );
  }

  await createCommunityPost({
    userId: currentUser.id,
    authorName: currentUser.name,
    authorRole: formatRole(currentUser.role),
    topic,
    tag,
    title,
    body,
  });

  revalidateAppShell();
  redirect(buildPath("/community", { message: "Your post is now live." }));
}

export async function createCommunityReplyAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!postId || !body) {
    redirect(buildPath("/community", { error: "Write a reply before posting." }));
  }

  await createCommunityReply({
    postId,
    userId: currentUser.id,
    authorName: currentUser.name,
    authorRole: formatRole(currentUser.role),
    body,
  });

  revalidateAppShell();
  redirect(
    `/community?message=${encodeURIComponent("Your reply is now live.")}#${postId}`,
  );
}

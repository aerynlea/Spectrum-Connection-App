"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminLookupAccess,
  grantAdminLookupAccess,
  hasAdminLookupAccess,
  isAdminLookupConfigured,
} from "@/lib/admin-access";
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
  createModerationReport,
  createCommunityReply,
  createCommunityPost,
  createUser,
  deleteExpiredPasswordResetTokens,
  deletePasswordResetTokensForUser,
  deleteSessionsForUser,
  getCommunityPostById,
  getCommunityReplyById,
  getLatestPasswordResetTokenForUser,
  getProfessionalById,
  getUserAuthByEmail,
  getUserByEmail,
  getPasswordResetToken,
  markPasswordResetTokenUsed,
  setCommunityPostHidden,
  setCommunityReplyHidden,
  setProfessionalHidden,
  toggleSavedResource,
  updateModerationReport,
  updateUserPassword,
  updateUserProfile,
} from "@/lib/data";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/email";
import { hasPremiumAccess } from "@/lib/membership";
import type {
  AgeGroup,
  GoalKey,
  ModerationTargetType,
  UserRole,
} from "@/lib/app-types";
import { formatRole } from "@/lib/formatters";
import {
  getAppUrl,
  isClerkConfigured,
  isLocalDevelopment,
} from "@/lib/platform";
import { reportReasonOptions } from "@/lib/site-data";
import { stripe, getStripePriceId, getStripeReturnUrl } from "@/lib/stripe";

const validRoles = new Set(roleOptions.map((option) => option.value));
const validAgeGroups = new Set(ageGroupOptions.map((option) => option.value));
const validGoals = new Set(goalOptions.map((option) => option.value));
const validTopics = new Set(communityTopicOptions);
const validModerationTargets = new Set<ModerationTargetType>([
  "community-post",
  "community-reply",
  "professional",
]);
const validReportReasons = new Set<string>(reportReasonOptions);
const passwordResetRequestCooldownMs = 1000 * 60 * 5;

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

function buildPath(pathname: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `${pathname}?${search.toString()}`;
}

function appendNoticeToPath(
  pathname: string,
  tone: "message" | "error",
  value: string,
) {
  const url = new URL(pathname || "/", getAppUrl());
  url.searchParams.set(tone, value);
  return `${url.pathname}${url.search}${url.hash}`;
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

function summarizeModerationText(value: string, maxLength = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

async function getModerationTargetSnapshot(
  targetType: ModerationTargetType,
  targetId: string,
) {
  if (targetType === "community-post") {
    const post = await getCommunityPostById(targetId, true);

    if (!post) {
      return null;
    }

    return {
      targetLabel: post.title,
      targetExcerpt: summarizeModerationText(post.body),
      targetAuthor: post.authorName,
    };
  }

  if (targetType === "community-reply") {
    const reply = await getCommunityReplyById(targetId, true);

    if (!reply) {
      return null;
    }

    return {
      targetLabel: "Community reply",
      targetExcerpt: summarizeModerationText(reply.body),
      targetAuthor: reply.authorName,
    };
  }

  const professional = await getProfessionalById(targetId, true);

  if (!professional) {
    return null;
  }

  return {
    targetLabel: `${professional.name} • ${professional.title}`,
    targetExcerpt: summarizeModerationText(professional.summary),
    targetAuthor: professional.name,
  };
}

function revalidateAppShell() {
  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/admin-tools/email-lookup");
  revalidatePath("/admin-tools/moderation");
  revalidatePath("/community");
  revalidatePath("/dashboard");
  revalidatePath("/events");
  revalidatePath("/membership");
  revalidatePath("/onboarding");
  revalidatePath("/professionals");
  revalidatePath("/resources");
}

export async function unlockAdminLookupAction(formData: FormData) {
  const key = String(formData.get("key") ?? "");

  if (!isAdminLookupConfigured()) {
    redirect(
      buildPath("/admin-tools/email-lookup", {
        error: "The admin lookup tool is not configured yet.",
      }),
    );
  }

  const granted = await grantAdminLookupAccess(key);

  if (!granted) {
    redirect(
      buildPath("/admin-tools/email-lookup", {
        error: "That lookup key did not match.",
      }),
    );
  }

  redirect(
    buildPath("/admin-tools/email-lookup", {
      message: "Private lookup access is open for this session.",
    }),
  );
}

export async function lockAdminLookupAction() {
  await clearAdminLookupAccess();
  redirect(
    buildPath("/admin-tools/email-lookup", {
      message: "The lookup tool has been locked again.",
    }),
  );
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

  if (!isLocalDevelopment && !isPasswordResetEmailConfigured()) {
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

  const latestResetToken = await getLatestPasswordResetTokenForUser(user.id);
  const now = Date.now();
  const latestResetCreatedAt = latestResetToken
    ? new Date(latestResetToken.created_at).getTime()
    : 0;
  const latestResetExpiresAt = latestResetToken
    ? new Date(latestResetToken.expires_at).getTime()
    : 0;
  const hasActiveRecentReset =
    Boolean(latestResetToken) &&
    !latestResetToken?.used_at &&
    Number.isFinite(latestResetCreatedAt) &&
    Number.isFinite(latestResetExpiresAt) &&
    latestResetExpiresAt > now &&
    now - latestResetCreatedAt < passwordResetRequestCooldownMs;

  if (hasActiveRecentReset) {
    redirect(
      buildPath("/forgot-password", {
        message:
          "If that email is in Guiding Light, a reset link may already be on the way. Give it a few minutes and check your inbox before trying again.",
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

  if (!emailSent) {
    await deletePasswordResetTokensForUser(user.id);

    if (process.env.NODE_ENV !== "production") {
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
        error: "We could not send the reset email just now. Please try again shortly.",
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

export async function submitModerationReportAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/community");

  if (!validModerationTargets.has(targetType as ModerationTargetType) || !targetId) {
    redirect(
      appendNoticeToPath(
        returnTo,
        "error",
        "We could not tell what you were trying to report.",
      ),
    );
  }

  if (!validReportReasons.has(reason)) {
    redirect(
      appendNoticeToPath(
        returnTo,
        "error",
        "Choose the reason that best matches your concern.",
      ),
    );
  }

  const snapshot = await getModerationTargetSnapshot(
    targetType as ModerationTargetType,
    targetId,
  );

  if (!snapshot) {
    redirect(
      appendNoticeToPath(
        returnTo,
        "error",
        "That item is no longer available to review.",
      ),
    );
  }

  await createModerationReport({
    targetType: targetType as ModerationTargetType,
    targetId,
    reporterUserId: currentUser.id,
    reporterName: currentUser.name,
    reason,
    details,
    targetLabel: snapshot.targetLabel,
    targetExcerpt: snapshot.targetExcerpt,
    targetAuthor: snapshot.targetAuthor,
  });

  revalidatePath("/community");
  revalidatePath("/professionals");
  revalidatePath("/admin-tools/moderation");

  redirect(
    appendNoticeToPath(
      returnTo,
      "message",
      "Thanks for speaking up. We’ll review that concern with care.",
    ),
  );
}

export async function reviewModerationReportAction(formData: FormData) {
  if (!isAdminLookupConfigured()) {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "Moderation access is not configured yet.",
      }),
    );
  }

  if (!(await hasAdminLookupAccess())) {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "Unlock the moderation queue first.",
      }),
    );
  }

  const reportId = String(formData.get("reportId") ?? "");
  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const intent = String(formData.get("intent") ?? "");

  if (!reportId || !targetId || !validModerationTargets.has(targetType as ModerationTargetType)) {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "That moderation action was missing important details.",
      }),
    );
  }

  if (intent === "hide") {
    if (targetType === "community-post") {
      await setCommunityPostHidden(targetId, true);
    } else if (targetType === "community-reply") {
      await setCommunityReplyHidden(targetId, true);
    } else {
      await setProfessionalHidden(targetId, true);
    }

    await updateModerationReport(reportId, {
      status: "resolved",
      actionTaken: "hidden",
    });
  } else if (intent === "restore") {
    if (targetType === "community-post") {
      await setCommunityPostHidden(targetId, false);
    } else if (targetType === "community-reply") {
      await setCommunityReplyHidden(targetId, false);
    } else {
      await setProfessionalHidden(targetId, false);
    }

    await updateModerationReport(reportId, {
      status: "resolved",
      actionTaken: "restored",
    });
  } else if (intent === "dismiss") {
    await updateModerationReport(reportId, {
      status: "dismissed",
      actionTaken: "dismissed",
    });
  } else if (intent === "review") {
    await updateModerationReport(reportId, {
      status: "reviewed",
      actionTaken: "reviewed",
    });
  } else {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "That moderation action was not recognized.",
      }),
    );
  }

  revalidatePath("/community");
  revalidatePath("/professionals");
  revalidatePath("/admin-tools/moderation");

  redirect(
    buildPath("/admin-tools/moderation", {
      message: "The moderation queue has been updated.",
    }),
  );
}

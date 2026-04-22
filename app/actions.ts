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
  createModerationEscalation,
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
  getLatestSupportPlanForUser,
  getLatestPasswordResetTokenForUser,
  getProfessionalById,
  listMemberRoster,
  getUserAuthByEmail,
  getUserByEmail,
  getPasswordResetToken,
  markPasswordResetTokenUsed,
  setCommunityPostHidden,
  setCommunityReplyHidden,
  setProfessionalHidden,
  toggleSavedResource,
  upsertModerationMemberNote,
  updateSupportPlanStepStatus,
  updateModerationReport,
  updateProfessionalVerification,
  updateUserPassword,
  updateUserProfile,
} from "@/lib/data";
import {
  isPasswordResetEmailConfigured,
  isNewsletterEmailConfigured,
  sendNewsletterEmail,
  sendPasswordResetEmail,
} from "@/lib/email";
import { hasPremiumAccess } from "@/lib/membership";
import {
  buildNewsletterUnsubscribeUrl,
  getNewsletterPostalAddress,
} from "@/lib/newsletter";
import type {
  AgeGroup,
  ModerationEscalationEventType,
  GoalKey,
  ModerationTargetType,
  ProfessionalVerificationStatus,
  SupportStepStatus,
  UserRole,
} from "@/lib/app-types";
import {
  formatCalendarDate,
  formatRole,
  formatSupportStepStatus,
} from "@/lib/formatters";
import {
  getAppUrl,
  isClerkConfigured,
  isLocalDevelopment,
} from "@/lib/platform";
import {
  ensureCurrentSupportPlanForUser,
  getSupportPlanWindow,
} from "@/lib/support-plans";
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
const validProfessionalVerificationStatuses =
  new Set<ProfessionalVerificationStatus>([
    "verified",
    "review-in-progress",
    "community-shared",
  ]);
const validReportReasons = new Set<string>(reportReasonOptions);
const validSupportStepStatuses = new Set<SupportStepStatus>([
  "not-started",
  "saved",
  "contacted",
  "attended",
  "done",
]);
const validFollowUpShortcuts = new Set(["3-days", "next-week"] as const);
const passwordResetRequestCooldownMs = 1000 * 60 * 5;
const validAdminReturnPaths = new Set([
  "/admin-tools/email-lookup",
  "/admin-tools/members",
  "/admin-tools/moderation",
]);

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export type SupportPlanStepActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  currentFollowUpAt: string | null;
  currentNote: string;
  currentStatus: SupportStepStatus | null;
};

export type ToggleSavedResourceActionState = {
  isSaved: boolean;
  message: string | null;
  refreshCurrentPage: boolean;
  status: "success" | "error";
};

type FollowUpShortcut = "3-days" | "next-week";

function buildPath(pathname: string, params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `${pathname}?${search.toString()}`;
}

function normalizeReturnPathname(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) {
    return "/resources";
  }

  return trimmed.split("#")[0]?.split("?")[0] || "/resources";
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

function pickNewsletterPreference(formData: FormData) {
  return formData.get("newsletterSubscribed") !== null;
}

function pickAdminReturnTo(
  value: FormDataEntryValue | null,
  fallback: string,
) {
  const returnTo = String(value ?? "").trim();

  return validAdminReturnPaths.has(returnTo) ? returnTo : fallback;
}

function summarizeModerationText(value: string, maxLength = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeFollowUpAt(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const date = new Date(`${raw}T12:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function pickFollowUpShortcut(value: FormDataEntryValue | null) {
  const shortcut = String(value ?? "").trim();

  return validFollowUpShortcuts.has(shortcut as FollowUpShortcut)
    ? (shortcut as FollowUpShortcut)
    : null;
}

function buildFollowUpShortcutDate(
  shortcut: FollowUpShortcut,
  referenceDate = new Date(),
) {
  const nextDate = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
      12,
      0,
      0,
      0,
    ),
  );

  nextDate.setUTCDate(
    nextDate.getUTCDate() + (shortcut === "3-days" ? 3 : 7),
  );

  return nextDate.toISOString();
}

function buildModerationSubjectKey(targetUserId: string | null, targetAuthor: string) {
  const authorKey = targetAuthor.trim().toLowerCase().replace(/\s+/g, " ");

  return targetUserId?.trim() || `author:${authorKey}`;
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
      targetUserId: post.userId,
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
      targetUserId: reply.userId,
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
    targetUserId: null,
  };
}

function revalidateAppShell() {
  revalidatePath("/");
  revalidatePath("/auth");
  revalidatePath("/admin-tools/email-lookup");
  revalidatePath("/admin-tools/members");
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
  const returnTo = pickAdminReturnTo(
    formData.get("returnTo"),
    "/admin-tools/email-lookup",
  );

  if (!isAdminLookupConfigured()) {
    redirect(
      buildPath(returnTo, {
        error: "The admin lookup tool is not configured yet.",
      }),
    );
  }

  const granted = await grantAdminLookupAccess(key);

  if (!granted) {
    redirect(
      buildPath(returnTo, {
        error: "That lookup key did not match.",
      }),
    );
  }

  redirect(
    buildPath(returnTo, {
      message: "Private lookup access is open for this session.",
    }),
  );
}

export async function lockAdminLookupAction(formData: FormData) {
  const returnTo = pickAdminReturnTo(
    formData.get("returnTo"),
    "/admin-tools/email-lookup",
  );

  await clearAdminLookupAccess();
  redirect(
    buildPath(returnTo, {
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
  const newsletterSubscribed = pickNewsletterPreference(formData);

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
    newsletterSubscribed,
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
  redirect(buildPath("/", { message: "You are signed in." }));
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
  const newsletterSubscribed = pickNewsletterPreference(formData);

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
    newsletterSubscribed,
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
  const newsletterSubscribed = pickNewsletterPreference(formData);

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
    newsletterSubscribed,
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

export async function updateSupportPlanStepStatusAction(
  _previousState: SupportPlanStepActionState,
  formData: FormData,
): Promise<SupportPlanStepActionState> {
  const currentUser = await requireCurrentUser();
  const stepId = String(formData.get("stepId") ?? "").trim();
  const currentStatus = String(formData.get("currentStatus") ?? "").trim();
  const requestedStatus = String(
    formData.get("status") ?? currentStatus,
  ).trim();
  const note = String(formData.get("note") ?? "").trim();
  const followUpShortcut = pickFollowUpShortcut(formData.get("followUpShortcut"));
  const followUpAt = followUpShortcut
    ? buildFollowUpShortcutDate(followUpShortcut)
    : normalizeFollowUpAt(formData.get("followUpAt"));

  if (!stepId || !validSupportStepStatuses.has(requestedStatus as SupportStepStatus)) {
    return {
      status: "error",
      message: "That step update did not go through.",
      currentFollowUpAt: null,
      currentNote: "",
      currentStatus: null,
    };
  }

  const plan = await ensureCurrentSupportPlanForUser(currentUser);
  const step = plan?.steps.find((item) => item.id === stepId);

  if (!plan || !step) {
    return {
      status: "error",
      message: "We could not find that step in your current weekly plan.",
      currentFollowUpAt: null,
      currentNote: "",
      currentStatus: null,
    };
  }

  const nextStatus = requestedStatus as SupportStepStatus;
  const nextNote = note.slice(0, 500);
  const updatedStep = await updateSupportPlanStepStatus(
    step.id,
    {
      followUpAt,
      note: nextNote,
      status: nextStatus,
    },
  );
  const didStatusChange = nextStatus !== step.status;
  const didNoteChange = nextNote !== step.note;
  const didFollowUpChange = (followUpAt ?? null) !== (step.followUpAt ?? null);
  const nextFollowUpLabel = updatedStep?.followUpAt ?? followUpAt;

  revalidatePath("/dashboard");

  return {
    status: "success",
    currentFollowUpAt:
      updatedStep?.followUpAt ?? followUpAt ?? step.followUpAt,
    currentNote: updatedStep?.note ?? nextNote,
    message: didStatusChange
      ? `Step marked ${formatSupportStepStatus(nextStatus).toLowerCase()}.`
      : didFollowUpChange && nextFollowUpLabel
        ? `Follow-up moved to ${formatCalendarDate(nextFollowUpLabel)}.`
      : didNoteChange || didFollowUpChange
        ? "Step details saved."
        : "Step saved.",
    currentStatus: updatedStep?.status ?? nextStatus,
  };
}

export async function sendNewsletterAction(formData: FormData) {
  const hasAccess = await hasAdminLookupAccess();

  if (!hasAccess) {
    redirect(
      buildPath("/admin-tools/members", {
        error: "Unlock the member roster before sending newsletter emails.",
      }),
    );
  }

  if (!isNewsletterEmailConfigured()) {
    redirect(
      buildPath("/admin-tools/members", {
        error: "Newsletter sending is not configured yet.",
      }),
    );
  }

  const postalAddress = getNewsletterPostalAddress();

  if (!postalAddress) {
    redirect(
      buildPath("/admin-tools/members", {
        error: "Add NEWSLETTER_POSTAL_ADDRESS before sending newsletter emails.",
      }),
    );
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject || !body) {
    redirect(
      buildPath("/admin-tools/members", {
        error: "Add both a subject and message before sending the newsletter.",
      }),
    );
  }

  const recipients = (await listMemberRoster()).filter(
    (member) => member.newsletterSubscribed,
  );

  if (recipients.length === 0) {
    redirect(
      buildPath("/admin-tools/members", {
        error: "No members have opted into newsletter emails yet.",
      }),
    );
  }

  let deliveredCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    const delivered = await sendNewsletterEmail({
      name: recipient.name,
      to: recipient.email,
      subject,
      body,
      unsubscribeUrl: buildNewsletterUnsubscribeUrl(recipient),
      postalAddress,
    });

    if (delivered) {
      deliveredCount += 1;
    } else {
      failedCount += 1;
    }
  }

  revalidatePath("/admin-tools/members");

  if (failedCount > 0) {
    redirect(
      buildPath("/admin-tools/members", {
        error: `Sent ${deliveredCount} newsletter email${
          deliveredCount === 1 ? "" : "s"
        }, but ${failedCount} did not go through.`,
      }),
    );
  }

  redirect(
    buildPath("/admin-tools/members", {
      message: `Newsletter sent to ${deliveredCount} subscribed member${
        deliveredCount === 1 ? "" : "s"
      }.`,
    }),
  );
}

export async function toggleSavedResourceAction(input: {
  resourceId: string;
  returnTo?: string;
}): Promise<ToggleSavedResourceActionState> {
  const currentUser = await requireCurrentUser();
  const resourceId = input.resourceId.trim();
  const returnPath = normalizeReturnPathname(input.returnTo ?? "/resources");

  if (!resourceId) {
    return {
      isSaved: false,
      message: "We could not save that resource.",
      refreshCurrentPage: false,
      status: "error",
    };
  }

  const isSaved = await toggleSavedResource(currentUser.id, resourceId);

  if (isSaved) {
    const currentPlan = await getLatestSupportPlanForUser(currentUser.id);
    const { cycleStart } = getSupportPlanWindow();
    const matchingStep = currentPlan?.steps.find(
      (step) =>
        currentPlan.cycleStart === cycleStart &&
        step.targetType === "resource" &&
        step.targetId === resourceId &&
        step.status === "not-started",
    );

    if (matchingStep) {
      await updateSupportPlanStepStatus(matchingStep.id, {
        status: "saved",
      });
    }
  }

  revalidatePath(returnPath);

  if (returnPath !== "/dashboard") {
    revalidatePath("/dashboard");
  }

  return {
    isSaved,
    message: isSaved ? "Resource saved." : "Resource removed.",
    refreshCurrentPage: returnPath === "/dashboard",
    status: "success",
  };
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

  const reportId = await createModerationReport({
    targetType: targetType as ModerationTargetType,
    targetId,
    targetUserId: snapshot.targetUserId,
    reporterUserId: currentUser.id,
    reporterName: currentUser.name,
    reason,
    details,
    targetLabel: snapshot.targetLabel,
    targetExcerpt: snapshot.targetExcerpt,
    targetAuthor: snapshot.targetAuthor,
  });

  if (targetType !== "professional") {
    await createModerationEscalation({
      subjectKey: buildModerationSubjectKey(
        snapshot.targetUserId,
        snapshot.targetAuthor,
      ),
      targetUserId: snapshot.targetUserId,
      targetAuthor: snapshot.targetAuthor,
      reportId,
      eventType: "report-filed",
      reason,
      note: details,
    });
  }

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
  const moderatorNote = String(formData.get("moderatorNote") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim() || null;
  const targetAuthor = String(formData.get("targetAuthor") ?? "").trim();
  const reportReason = String(formData.get("reportReason") ?? "").trim();

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
      moderatorNote,
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
      moderatorNote,
    });
  } else if (intent === "dismiss") {
    await updateModerationReport(reportId, {
      status: "dismissed",
      actionTaken: "dismissed",
      moderatorNote,
    });
  } else if (intent === "review") {
    await updateModerationReport(reportId, {
      status: "reviewed",
      actionTaken: "reviewed",
      moderatorNote,
    });
  } else {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "That moderation action was not recognized.",
      }),
    );
  }

  if (targetType !== "professional" && targetAuthor) {
    const eventTypeByIntent: Record<string, ModerationEscalationEventType> = {
      review: "reviewed",
      hide: "hidden",
      restore: "restored",
      dismiss: "dismissed",
    };
    const escalationEventType = eventTypeByIntent[intent];

    if (escalationEventType) {
      await createModerationEscalation({
        subjectKey: buildModerationSubjectKey(targetUserId, targetAuthor),
        targetUserId,
        targetAuthor,
        reportId,
        eventType: escalationEventType,
        reason: reportReason,
        note: moderatorNote,
      });
    }
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

export async function saveModerationMemberNoteAction(formData: FormData) {
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

  const subjectKey = String(formData.get("subjectKey") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim() || null;
  const targetAuthor = String(formData.get("targetAuthor") ?? "").trim();
  const note = String(formData.get("note") ?? "");

  if (!subjectKey || !targetAuthor) {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "That member note was missing important details.",
      }),
    );
  }

  await upsertModerationMemberNote({
    subjectKey,
    targetUserId,
    targetAuthor,
    note,
  });

  await createModerationEscalation({
    subjectKey,
    targetUserId,
    targetAuthor,
    reportId: null,
    eventType: "member-note-updated",
    reason: "",
    note: note.trim(),
  });

  revalidatePath("/admin-tools/moderation");

  redirect(
    buildPath("/admin-tools/moderation", {
      message: "The member-level moderation note has been saved.",
    }),
  );
}

export async function updateProfessionalVerificationAction(formData: FormData) {
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

  const professionalId = String(formData.get("professionalId") ?? "");
  const verificationStatus = String(formData.get("verificationStatus") ?? "");
  const verificationNote = String(formData.get("verificationNote") ?? "").trim();

  if (
    !professionalId ||
    !validProfessionalVerificationStatuses.has(
      verificationStatus as ProfessionalVerificationStatus,
    )
  ) {
    redirect(
      buildPath("/admin-tools/moderation", {
        error: "That verification update was missing important details.",
      }),
    );
  }

  await updateProfessionalVerification(professionalId, {
    verificationStatus: verificationStatus as ProfessionalVerificationStatus,
    verificationNote,
  });

  revalidatePath("/professionals");
  revalidatePath("/admin-tools/moderation");

  redirect(
    buildPath("/admin-tools/moderation", {
      message: "The professional verification review has been updated.",
    }),
  );
}

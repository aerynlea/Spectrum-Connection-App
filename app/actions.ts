"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearSession, establishSession, hashPassword, requireCurrentUser, verifyPassword } from "@/lib/auth";
import {
  ageGroupOptions,
  communityTopicOptions,
  goalOptions,
  roleOptions,
} from "@/lib/catalog";
import {
  createCommunityPost,
  createUser,
  getUserAuthByEmail,
  getUserByEmail,
  toggleSavedResource,
  updateUserProfile,
} from "@/lib/data";
import type { AgeGroup, GoalKey, UserRole } from "@/lib/app-types";
import { formatRole } from "@/lib/formatters";
import { isClerkConfigured } from "@/lib/platform";

const validRoles = new Set(roleOptions.map((option) => option.value));
const validAgeGroups = new Set(ageGroupOptions.map((option) => option.value));
const validGoals = new Set(goalOptions.map((option) => option.value));
const validTopics = new Set(communityTopicOptions);

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
  });

  if (!user) {
    redirect(buildPath("/auth", { error: "We could not create your account." }));
  }

  await establishSession(user.id);
  revalidateAppShell();
  redirect(buildPath("/dashboard", { message: "Welcome to Guiding Light." }));
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

export async function signOutAction() {
  await clearSession();
  revalidateAppShell();
  redirect(buildPath("/", { message: "You have been signed out." }));
}

export async function updateProfileAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const role = pickRole(formData.get("role"));
  const ageGroup = pickAgeGroup(formData.get("ageGroup"));
  const goals = pickGoals(formData);

  if (!name || !location || !role || !ageGroup || goals.length === 0) {
    redirect(
      buildPath("/dashboard", {
        error: "Please keep every profile field completed before saving.",
      }),
    );
  }

  await updateUserProfile(currentUser.id, {
    name,
    role,
    ageGroup,
    location,
    goals,
  });

  revalidateAppShell();
  redirect(buildPath("/dashboard", { message: "Profile updated." }));
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

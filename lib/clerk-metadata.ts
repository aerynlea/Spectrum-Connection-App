import { auth as clerkAuth, clerkClient } from "@clerk/nextjs/server";

import type { MembershipTier, SubscriptionStatus } from "@/lib/app-types";
import { isClerkConfigured } from "@/lib/platform";

type GuidingLightMetadataInput = {
  onboardingCompleted?: boolean;
  membershipTier?: MembershipTier;
  subscriptionStatus?: SubscriptionStatus;
};

function buildGuidingLightMetadata(input: GuidingLightMetadataInput) {
  const guidingLight: Record<string, boolean | MembershipTier | SubscriptionStatus> = {};

  if (typeof input.onboardingCompleted === "boolean") {
    guidingLight.onboardingCompleted = input.onboardingCompleted;
  }

  if (input.membershipTier) {
    guidingLight.membershipTier = input.membershipTier;
  }

  if (input.subscriptionStatus) {
    guidingLight.subscriptionStatus = input.subscriptionStatus;
  }

  return guidingLight;
}

export async function syncCurrentClerkMetadata(input: GuidingLightMetadataInput) {
  if (!isClerkConfigured) {
    return;
  }

  const { userId } = await clerkAuth();

  if (!userId) {
    return;
  }

  await syncClerkMetadataForUser(userId, input);
}

export async function syncClerkMetadataForUser(
  userId: string,
  input: GuidingLightMetadataInput,
) {
  if (!isClerkConfigured) {
    return;
  }

  const guidingLight = buildGuidingLightMetadata(input);

  if (Object.keys(guidingLight).length === 0) {
    return;
  }

  const client = await clerkClient();

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      guidingLight,
    },
  });
}

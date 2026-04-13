import type {
  AppUser,
  GoalKey,
  MembershipTier,
  SubscriptionStatus,
} from "@/lib/app-types";

type PremiumRoadmapItem = {
  title: string;
  detail: string;
};

const premiumRoadmapLibrary: Record<GoalKey, PremiumRoadmapItem> = {
  "early-support": {
    title: "Start with a calmer weekly support rhythm",
    detail:
      "Keep one easy place for therapy notes, early support links, and the next questions you want to ask.",
  },
  education: {
    title: "Keep school support steps easier to follow",
    detail:
      "Bring IEP reminders, school resource links, and meeting prep into one calmer planning space.",
  },
  "sensory-support": {
    title: "Build a sensory plan around everyday routines",
    detail:
      "Save what helps at home, on outings, and during transitions so support feels easier to repeat.",
  },
  "social-growth": {
    title: "Keep connection opportunities close by",
    detail:
      "Hold onto social groups, play ideas, and community events that match your family right now.",
  },
  employment: {
    title: "Stay organized around work and transition goals",
    detail:
      "Keep career resources, transition support, and helpful next steps together as plans grow.",
  },
  "independent-living": {
    title: "Turn daily living goals into smaller next steps",
    detail:
      "Track the supports, tools, and practical resources that make independence feel more reachable.",
  },
  "caregiver-wellness": {
    title: "Protect your own support system too",
    detail:
      "Keep caregiver applications, respite ideas, and grounding resources close when the week gets heavy.",
  },
};

export const membershipHighlights = [
  {
    eyebrow: "Premium planning",
    title: "A guided next-step plan built around your goals.",
    detail:
      "See a calmer roadmap shaped by your stage of life, support priorities, and what you want to tackle first.",
  },
  {
    eyebrow: "Saved support hub",
    title: "Keep your most useful links and reminders in one place.",
    detail:
      "Come back to the resources, outings, and events that matter without starting from scratch each visit.",
  },
  {
    eyebrow: "Caregiver-friendly flow",
    title: "Make planning feel gentler when life is already full.",
    detail:
      "Premium membership is designed to reduce searching, decision fatigue, and the feeling of doing everything alone.",
  },
];

const premiumStatuses = new Set<SubscriptionStatus>([
  "trialing",
  "active",
  "past_due",
]);

export function hasPremiumAccess(user: AppUser | null | undefined) {
  if (!user) {
    return false;
  }

  return (
    user.membershipTier === "premium" &&
    premiumStatuses.has(user.subscriptionStatus)
  );
}

export function getMembershipLabel(tier: MembershipTier) {
  return tier === "premium" ? "Premium member" : "Free member";
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "trialing":
      return "Trial active";
    case "active":
      return "Active";
    case "past_due":
      return "Payment update needed";
    case "canceled":
      return "Canceled";
    case "incomplete":
      return "Waiting for checkout";
    case "incomplete_expired":
      return "Checkout expired";
    case "unpaid":
      return "Payment issue";
    case "paused":
      return "Paused";
    default:
      return "Free plan";
  }
}

export function getMembershipDescription(user: AppUser) {
  if (hasPremiumAccess(user)) {
    return "Your premium planning tools are active.";
  }

  if (user.subscriptionStatus === "past_due" || user.subscriptionStatus === "unpaid") {
    return "Your premium access is still here, but billing needs attention.";
  }

  return "You are on the free plan right now.";
}

export function buildPremiumRoadmap(user: AppUser) {
  const prioritizedGoals: GoalKey[] =
    user.goals.length > 0 ? user.goals : ["social-growth"];

  return prioritizedGoals.slice(0, 3).map((goal) => ({
    ...premiumRoadmapLibrary[goal],
    goal,
  }));
}

import type {
  AppUser,
  CommunityPostRecord,
  EventRecord,
  GoalKey,
  ProfessionalRecord,
  ResourceRecord,
  SupportPlanRecord,
  SupportStepStatus,
} from "@/lib/app-types";
import {
  createSupportPlan,
  getLatestSupportPlanForUser,
  listCommunityPosts,
  listEvents,
  listProfessionals,
  listResources,
  listSupportPlansForUser,
  markSupportPlanRecapSent,
  markSupportPlanStepFollowUpReminderSent,
} from "@/lib/data";
import { sendNewsletterEmail } from "@/lib/email";
import {
  formatCalendarDate,
  formatDateTime,
  formatGoal,
  formatSupportStepStatus,
} from "@/lib/formatters";
import { isRegionalMatch, matchesUserLocation } from "@/lib/location";
import { buildNewsletterUnsubscribeUrl, getNewsletterPostalAddress } from "@/lib/newsletter";
import { getAppUrl } from "@/lib/platform";
import { buildRecommendations } from "@/lib/recommendations";

type SupportPlanSourceData = {
  communityPosts: CommunityPostRecord[];
  events: EventRecord[];
  professionals: ProfessionalRecord[];
  resources: ResourceRecord[];
};

type RankedProfessional = ProfessionalRecord & {
  reasons: string[];
  score: number;
};

type RankedCommunityPost = CommunityPostRecord & {
  reasons: string[];
  score: number;
};

const goalKeywordMap: Record<GoalKey, string[]> = {
  "early-support": [
    "early",
    "development",
    "therapy",
    "support",
    "navigation",
    "family",
  ],
  education: [
    "school",
    "iep",
    "education",
    "teacher",
    "classroom",
    "accommodation",
  ],
  "sensory-support": [
    "sensory",
    "regulation",
    "calm",
    "therapy",
    "routine",
    "stress",
  ],
  "social-growth": [
    "social",
    "community",
    "friend",
    "group",
    "conversation",
    "belonging",
  ],
  employment: [
    "employment",
    "job",
    "work",
    "career",
    "transition",
    "professional",
  ],
  "independent-living": [
    "independent",
    "housing",
    "daily",
    "living",
    "transportation",
    "adult",
  ],
  "caregiver-wellness": [
    "caregiver",
    "parent",
    "family",
    "support",
    "mentoring",
    "wellness",
  ],
};

function normalizeText(value: string) {
  return value.toLowerCase();
}

function toAbsoluteHref(href: string) {
  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  return new URL(href, getAppUrl()).toString();
}

function truncateTitle(value: string, maxLength = 64) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function isSupportStepComplete(status: SupportStepStatus) {
  return status !== "not-started";
}

export function getSupportPlanWindow(referenceDate = new Date()) {
  const cycleStart = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
    ),
  );
  const dayOfWeek = cycleStart.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  cycleStart.setUTCDate(cycleStart.getUTCDate() + mondayOffset);
  cycleStart.setUTCHours(0, 0, 0, 0);

  const cycleEnd = new Date(cycleStart);
  cycleEnd.setUTCDate(cycleEnd.getUTCDate() + 6);
  cycleEnd.setUTCHours(23, 59, 59, 999);

  return {
    cycleEnd: cycleEnd.toISOString(),
    cycleStart: cycleStart.toISOString(),
  };
}

function getSupportPlanDateLabel(plan: SupportPlanRecord) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(plan.cycleStart));
}

function buildProfileSignature(user: AppUser) {
  return [
    user.role,
    user.ageGroup,
    normalizeText(user.location).replace(/\s+/g, " ").trim(),
    [...user.goals].sort().join(","),
  ].join("|");
}

async function loadSupportPlanSourceData(user: AppUser): Promise<SupportPlanSourceData> {
  const [resources, events, communityPosts, professionals] = await Promise.all([
    listResources(user.id),
    listEvents(),
    listCommunityPosts(6),
    listProfessionals(),
  ]);

  return {
    communityPosts,
    events,
    professionals,
    resources,
  };
}

function buildGoalReason(user: AppUser, text: string) {
  const normalized = normalizeText(text);
  const matchedGoals = user.goals.filter((goal) =>
    goalKeywordMap[goal].some((keyword) => normalized.includes(keyword)),
  );

  if (matchedGoals.length === 0) {
    return [];
  }

  return [
    `Supports ${matchedGoals
      .slice(0, 2)
      .map((goal) => formatGoal(goal).toLowerCase())
      .join(" and ")}.`,
  ];
}

function rankProfessionalsForUser(user: AppUser, professionals: ProfessionalRecord[]) {
  return professionals
    .map((professional) => {
      let score = 0;
      const reasons: string[] = [];
      const text = normalizeText(
        [
          professional.name,
          professional.title,
          professional.focus,
          professional.summary,
          professional.organization,
        ].join(" "),
      );

      if (professional.acceptingNewFamilies) {
        score += 4;
        reasons.push("Open to families right now.");
      }

      if (professional.verificationStatus === "verified") {
        score += 3;
        reasons.push("Already reviewed and verified.");
      }

      if (isRegionalMatch(user.location, professional.regionTags)) {
        score += 4;
        reasons.push("Close to your area.");
      } else if (matchesUserLocation(user.location, professional.regionTags)) {
        score += 1;
        reasons.push("Accessible from your location.");
      }

      const goalReasons = buildGoalReason(user, text);
      score += goalReasons.length * 3;
      reasons.push(...goalReasons);

      if (user.role === "parent-caregiver" && /(parent|family|caregiver)/.test(text)) {
        score += 2;
        reasons.push("Speaks directly to family support.");
      }

      if (user.role === "self-advocate" && /(adult|self|advocacy|community)/.test(text)) {
        score += 2;
        reasons.push("Feels relevant for self-advocacy.");
      }

      if (user.role === "professional" && /(educator|partnership|provider|training)/.test(text)) {
        score += 2;
        reasons.push("Useful for provider collaboration.");
      }

      return {
        ...professional,
        reasons: reasons.slice(0, 3),
        score,
      } satisfies RankedProfessional;
    })
    .sort((left, right) => right.score - left.score);
}

function rankCommunityPostsForUser(user: AppUser, posts: CommunityPostRecord[]) {
  return posts
    .map((post) => {
      let score = 0;
      const reasons: string[] = [];
      const text = normalizeText([post.topic, post.tag, post.title, post.body].join(" "));
      const authorRole = normalizeText(post.authorRole);

      const goalReasons = buildGoalReason(user, text);
      score += goalReasons.length * 3;
      reasons.push(...goalReasons);

      if (user.role === "parent-caregiver" && authorRole.includes("parent")) {
        score += 2;
        reasons.push("Shared from a caregiver perspective.");
      }

      if (user.role === "self-advocate" && /(autistic|self)/.test(authorRole)) {
        score += 2;
        reasons.push("Grounded in lived autistic experience.");
      }

      if (user.role === "professional" && /(therapist|educator|professional)/.test(authorRole)) {
        score += 2;
        reasons.push("Includes a professional viewpoint.");
      }

      if (user.goals.includes("social-growth") && /(community|conversation|advice)/.test(text)) {
        score += 2;
        reasons.push("Encourages real community connection.");
      }

      return {
        ...post,
        reasons: reasons.slice(0, 3),
        score,
      } satisfies RankedCommunityPost;
    })
    .sort((left, right) => right.score - left.score);
}

function buildSupportPlanSummary(plan: {
  communityOrEventTitle: string;
  professionalTitle: string;
  resourceTitle: string;
}) {
  return [
    `This week: save ${truncateTitle(plan.resourceTitle, 42)},`,
    `reach out to ${truncateTitle(plan.professionalTitle, 36)},`,
    `and make space for ${truncateTitle(plan.communityOrEventTitle, 40)}.`,
  ].join(" ");
}

function getResourceReason(resource: ResourceRecord | { reasons: string[] }) {
  if (
    "reasons" in resource &&
    Array.isArray(resource.reasons) &&
    typeof resource.reasons[0] === "string"
  ) {
    return resource.reasons[0];
  }

  return "This resource lines up well with your role, goals, or age focus.";
}

function buildSupportPlanSteps(user: AppUser, data: SupportPlanSourceData) {
  const recommendations = buildRecommendations(user, data.resources, data.events);
  const topUnsavedResource =
    recommendations.resources.find((resource) => !resource.isSaved) ??
    data.resources.find((resource) => !resource.isSaved) ??
    recommendations.resources[0] ??
    data.resources[0];
  const topProfessional = rankProfessionalsForUser(user, data.professionals)[0];
  const topCommunityPost = rankCommunityPostsForUser(user, data.communityPosts)[0];
  const topEvent = recommendations.events.find((event) => (event.fitScore ?? 0) > 0)
    ?? recommendations.events[0]
    ?? data.events[0];

  if (!topUnsavedResource || !topProfessional || (!topEvent && !topCommunityPost)) {
    return null;
  }

  const shouldUseEvent =
    Boolean(topEvent) &&
    (topEvent.fitScore ?? 0) >= Math.max(topCommunityPost?.score ?? 0, 3);
  const topUnsavedResourceReason = getResourceReason(topUnsavedResource);

  const communityOrEventStep = shouldUseEvent && topEvent
    ? {
        ctaHref: topEvent.href,
        ctaLabel: "Open event page",
        detail: `${topEvent.title} is coming up on ${formatDateTime(topEvent.eventDate)}. ${topEvent.detail}`,
        kind: "event" as const,
        rationale:
          isRegionalMatch(user.location, topEvent.regionTags)
            ? "Close to your region and aligned with your current support profile."
            : "A relevant option you can keep on your radar this week.",
        suggestedStatus: "attended" as const,
        targetId: topEvent.id,
        targetType: "event" as const,
        title: "Choose one event to show up for this week.",
      }
    : {
        ctaHref: `/community#${topCommunityPost?.id ?? ""}`,
        ctaLabel: "Open community thread",
        detail: topCommunityPost
          ? `Start with “${topCommunityPost.title}” from ${topCommunityPost.authorName}. ${topCommunityPost.body}`
          : "Read one lived-experience conversation and decide what feels useful.",
        kind: "community" as const,
        rationale:
          topCommunityPost?.reasons[0] ??
          "A community check-in can make the next step feel less lonely.",
        suggestedStatus: "done" as const,
        targetId: topCommunityPost?.id ?? null,
        targetType: "community" as const,
        title: "Spend time in one community conversation this week.",
      };

  const summary = buildSupportPlanSummary({
    communityOrEventTitle: shouldUseEvent && topEvent
      ? topEvent.title
      : topCommunityPost?.title ?? "one community conversation",
    professionalTitle: topProfessional.name,
    resourceTitle: topUnsavedResource.title,
  });

  return {
    steps: [
      {
        position: 1,
        kind: "resource" as const,
        title: "Save one resource that matches what matters most right now.",
        detail: `${topUnsavedResource.title} from ${topUnsavedResource.organization} is a strong fit for this week. ${topUnsavedResource.summary}`,
        rationale: topUnsavedResourceReason,
        ctaLabel: "Open resource",
        ctaHref: topUnsavedResource.href,
        targetId: topUnsavedResource.id,
        targetType: "resource" as const,
        suggestedStatus: "saved" as const,
      },
      {
        position: 2,
        kind: "professional" as const,
        title: "Reach out to one trusted support team.",
        detail: `${topProfessional.name} can help with ${topProfessional.focus.toLowerCase()}. ${topProfessional.summary}`,
        rationale:
          topProfessional.reasons[0] ??
          "This provider looks especially relevant to your current profile.",
        ctaLabel: "Open provider details",
        ctaHref: `/professionals#${topProfessional.id}`,
        targetId: topProfessional.id,
        targetType: "professional" as const,
        suggestedStatus: "contacted" as const,
      },
      {
        position: 3,
        ...communityOrEventStep,
      },
    ],
    summary,
  };
}

function isCurrentPlanForUser(user: AppUser, plan: SupportPlanRecord, referenceDate = new Date()) {
  const { cycleStart } = getSupportPlanWindow(referenceDate);

  return (
    plan.cycleStart === cycleStart &&
    plan.profileSignature === buildProfileSignature(user)
  );
}

export async function ensureCurrentSupportPlanForUser(
  user: AppUser,
  data?: SupportPlanSourceData,
) {
  const existingPlan = await getLatestSupportPlanForUser(user.id);

  if (existingPlan && isCurrentPlanForUser(user, existingPlan)) {
    return existingPlan;
  }

  const sourceData = data ?? await loadSupportPlanSourceData(user);
  const planDraft = buildSupportPlanSteps(user, sourceData);

  if (!planDraft) {
    return existingPlan;
  }

  const { cycleEnd, cycleStart } = getSupportPlanWindow();

  return createSupportPlan(user.id, {
    cycleStart,
    cycleEnd,
    profileSignature: buildProfileSignature(user),
    steps: planDraft.steps,
    summary: planDraft.summary,
  });
}

export function getSupportPlanProgress(plan: SupportPlanRecord) {
  const completedCount = plan.steps.filter((step) => isSupportStepComplete(step.status)).length;

  return {
    completedCount,
    totalCount: plan.steps.length,
  };
}

function sortByFollowUpDate(left: { followUpAt: string | null }, right: { followUpAt: string | null }) {
  if (left.followUpAt && right.followUpAt) {
    return left.followUpAt.localeCompare(right.followUpAt);
  }

  if (left.followUpAt) {
    return -1;
  }

  if (right.followUpAt) {
    return 1;
  }

  return 0;
}

function formatStepFollowThrough(step: SupportPlanRecord["steps"][number]) {
  const parts: string[] = [];

  if (step.note.trim()) {
    parts.push(`Note: ${step.note.trim()}`);
  }

  if (step.followUpAt) {
    parts.push(`Follow up: ${formatCalendarDate(step.followUpAt)}`);
  }

  return parts.join(" ");
}

function toUtcDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

function getReminderBucketForStep(
  step: SupportPlanRecord["steps"][number],
  referenceDate = new Date(),
) {
  if (!step.followUpAt) {
    return null;
  }

  const todayKey = toUtcDateKey(referenceDate);
  const followUpKey = toUtcDateKey(step.followUpAt);

  if (followUpKey < todayKey) {
    return "overdue" as const;
  }

  if (followUpKey === todayKey) {
    return "today" as const;
  }

  return null;
}

export function getSupportPlanWaitingOn(plan: SupportPlanRecord) {
  return plan.steps
    .filter((step) => step.status === "contacted")
    .sort(sortByFollowUpDate);
}

export function getSupportPlanUpcomingFollowUps(plan: SupportPlanRecord) {
  return plan.steps
    .filter(
      (step) =>
        Boolean(step.followUpAt) &&
        step.status !== "done" &&
        step.status !== "attended",
    )
    .sort(sortByFollowUpDate);
}

export function getSupportPlanDueNow(
  plan: SupportPlanRecord,
  referenceDate = new Date(),
) {
  const { cycleEnd } = getSupportPlanWindow(referenceDate);
  const todayKey = toUtcDateKey(referenceDate);
  const cycleEndKey = cycleEnd.slice(0, 10);
  const overdue: SupportPlanRecord["steps"] = [];
  const today: SupportPlanRecord["steps"] = [];
  const thisWeek: SupportPlanRecord["steps"] = [];

  for (const step of getSupportPlanUpcomingFollowUps(plan)) {
    if (!step.followUpAt) {
      continue;
    }

    const followUpKey = toUtcDateKey(step.followUpAt);

    if (followUpKey < todayKey) {
      overdue.push(step);
      continue;
    }

    if (followUpKey === todayKey) {
      today.push(step);
      continue;
    }

    if (followUpKey <= cycleEndKey) {
      thisWeek.push(step);
    }
  }

  return {
    overdue,
    thisWeek,
    today,
    totalCount: overdue.length + today.length + thisWeek.length,
  };
}

export function wasSupportPlanRecapSentOnDate(
  plan: SupportPlanRecord,
  referenceDate = new Date(),
) {
  if (!plan.recapSentAt) {
    return false;
  }

  return toUtcDateKey(plan.recapSentAt) === toUtcDateKey(referenceDate);
}

export function getSupportPlanDueReminderCandidates(
  plan: SupportPlanRecord,
  referenceDate = new Date(),
) {
  const dueNow = getSupportPlanDueNow(plan, referenceDate);

  return [...dueNow.overdue, ...dueNow.today]
    .filter(
      (step) =>
        Boolean(step.followUpAt) &&
        step.followUpReminderSentFor !== step.followUpAt,
    )
    .sort(sortByFollowUpDate);
}

export function getSupportPlanWins(plan: SupportPlanRecord) {
  return plan.steps.filter((step) =>
    step.status === "saved" ||
    step.status === "attended" ||
    step.status === "done",
  );
}

function buildPreviousPlanMomentum(previousPlan: SupportPlanRecord | null) {
  if (!previousPlan) {
    return [];
  }

  const movedForward = getSupportPlanWins(previousPlan);

  if (movedForward.length === 0) {
    return [];
  }

  return [
    `Wins from last week: ${movedForward.length} step${
      movedForward.length === 1 ? "" : "s"
    } moved forward.`,
    ...movedForward.map((step) => {
      const followThrough = formatStepFollowThrough(step);

      return [
        `- ${step.title} (${formatSupportStepStatus(step.status)})`,
        followThrough ? `  ${followThrough}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }),
    "",
  ];
}

function buildDueNowMomentum(plan: SupportPlanRecord) {
  const dueNow = getSupportPlanDueNow(plan);
  const urgentSteps = [
    ...dueNow.overdue,
    ...dueNow.today,
    ...dueNow.thisWeek,
  ];

  if (urgentSteps.length === 0) {
    return [];
  }

  const summaryParts = [
    dueNow.overdue.length > 0
      ? `${dueNow.overdue.length} overdue`
      : null,
    dueNow.today.length > 0
      ? `${dueNow.today.length} due today`
      : null,
    dueNow.thisWeek.length > 0
      ? `${dueNow.thisWeek.length} due later this week`
      : null,
  ].filter((part): part is string => Boolean(part));

  return [
    `Follow-up focus: ${summaryParts.join(", ")}.`,
    ...urgentSteps.map((step) => {
      const followUpLabel = step.followUpAt
        ? formatCalendarDate(step.followUpAt)
        : "No follow-up date";

      return `- ${step.title}: ${followUpLabel} (${formatSupportStepStatus(step.status)})`;
    }),
    "",
  ];
}

export function buildSupportPlanEmailContent(
  user: AppUser,
  plan: SupportPlanRecord,
  previousPlan: SupportPlanRecord | null = null,
) {
  const progress = getSupportPlanProgress(plan);
  const stepLines = plan.steps.map((step, index) => {
    const lines = [
      `${index + 1}. ${step.title}`,
      step.detail,
      `Suggested finish: ${formatSupportStepStatus(step.suggestedStatus)}`,
      `Current status: ${formatSupportStepStatus(step.status)}`,
      `Open: ${toAbsoluteHref(step.ctaHref)}`,
    ];

    if (step.rationale) {
      lines.splice(2, 0, `Why this is showing up: ${step.rationale}`);
    }

    const followThrough = formatStepFollowThrough(step);

    if (followThrough) {
      lines.splice(lines.length - 1, 0, followThrough);
    }

    return lines.join("\n");
  });

  const subject = `Your Guiding Light next 3 steps for the week of ${getSupportPlanDateLabel(plan)}`;
  const body = [
    `Here is your weekly support recap, shaped around ${user.location} and the goals you chose in Guiding Light.`,
    progress.completedCount > 0
      ? `You have already moved ${progress.completedCount} of ${progress.totalCount} steps forward in this plan.`
      : "You have a fresh set of three gentle next steps waiting for you.",
    "",
    ...buildDueNowMomentum(plan),
    ...buildPreviousPlanMomentum(previousPlan),
    ...stepLines,
    "",
    `Dashboard: ${toAbsoluteHref("/dashboard")}`,
    "",
    "You can update your profile anytime if you want next week's plan to reflect a new season, goal, or location.",
  ].join("\n");

  return {
    body,
    subject,
  };
}

export function buildSupportPlanDueReminderEmailContent(
  user: AppUser,
  plan: SupportPlanRecord,
  steps: SupportPlanRecord["steps"],
  referenceDate = new Date(),
) {
  const overdueCount = steps.filter(
    (step) => getReminderBucketForStep(step, referenceDate) === "overdue",
  ).length;
  const todayCount = steps.filter(
    (step) => getReminderBucketForStep(step, referenceDate) === "today",
  ).length;
  const summaryParts = [
    overdueCount > 0 ? `${overdueCount} overdue` : null,
    todayCount > 0 ? `${todayCount} due today` : null,
  ].filter((part): part is string => Boolean(part));
  const subject =
    steps.length === 1
      ? todayCount === 1
        ? "A follow-up is due today in Guiding Light"
        : "A follow-up needs attention in Guiding Light"
      : `${steps.length} follow-ups need attention in Guiding Light`;
  const body = [
    `A gentle follow-up check-in from Guiding Light for your plan week of ${getSupportPlanDateLabel(plan)}, shaped around ${user.location}.`,
    `Right now you have ${summaryParts.join(" and ")} in your current support plan.`,
    "",
    ...steps.map((step, index) => {
      const bucket = getReminderBucketForStep(step, referenceDate);
      const urgencyLabel =
        bucket === "overdue"
          ? "Overdue"
          : bucket === "today"
            ? "Due today"
            : "Needs attention";
      const lines = [
        `${index + 1}. ${step.title}`,
        step.note.trim() ? `Latest note: ${step.note.trim()}` : step.detail,
        `Urgency: ${urgencyLabel}`,
        `Follow up: ${step.followUpAt ? formatCalendarDate(step.followUpAt) : "No date set"}`,
        `Current status: ${formatSupportStepStatus(step.status)}`,
        `Open support: ${toAbsoluteHref(step.ctaHref)}`,
      ];

      return lines.join("\n");
    }),
    "",
    `Dashboard: ${toAbsoluteHref("/dashboard")}`,
    "",
    "Use the Due now area on your dashboard to mark a step done, contact someone back, or move the follow-up forward in one click.",
  ].join("\n");

  return {
    body,
    subject,
  };
}

export async function sendSupportPlanRecapEmail(user: AppUser, plan: SupportPlanRecord) {
  const postalAddress = getNewsletterPostalAddress();

  if (!postalAddress) {
    return false;
  }

  const previousPlan = (await listSupportPlansForUser(user.id, 2)).find(
    (candidate) => candidate.id !== plan.id,
  ) ?? null;
  const { body, subject } = buildSupportPlanEmailContent(user, plan, previousPlan);
  const delivered = await sendNewsletterEmail({
    name: user.name,
    to: user.email,
    subject,
    body,
    unsubscribeUrl: buildNewsletterUnsubscribeUrl(user),
    postalAddress,
  });

  if (delivered) {
    await markSupportPlanRecapSent(plan.id);
  }

  return delivered;
}

export async function sendSupportPlanDueReminderEmail(
  user: AppUser,
  plan: SupportPlanRecord,
  steps: SupportPlanRecord["steps"],
  referenceDate = new Date(),
) {
  const postalAddress = getNewsletterPostalAddress();

  if (!postalAddress || steps.length === 0) {
    return false;
  }

  const { body, subject } = buildSupportPlanDueReminderEmailContent(
    user,
    plan,
    steps,
    referenceDate,
  );
  const delivered = await sendNewsletterEmail({
    name: user.name,
    to: user.email,
    subject,
    body,
    unsubscribeUrl: buildNewsletterUnsubscribeUrl(user),
    postalAddress,
  });

  if (delivered) {
    await Promise.all(
      steps
        .filter((step): step is SupportPlanRecord["steps"][number] & { followUpAt: string } =>
          Boolean(step.followUpAt),
        )
        .map((step) =>
          markSupportPlanStepFollowUpReminderSent(step.id, step.followUpAt),
        ),
    );
  }

  return delivered;
}

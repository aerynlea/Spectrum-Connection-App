import type {
  AppUser,
  EventRecord,
  RecommendationBundle,
  RecommendationRecord,
  ResourceRecord,
} from "@/lib/app-types";
import { isRegionalMatch, matchesUserLocation } from "@/lib/location";

function scoreResource(user: AppUser, resource: ResourceRecord) {
  let score = 0;
  const reasons: string[] = [];

  if (resource.ageGroup === user.ageGroup || resource.ageGroup === "all") {
    score += 4;
    reasons.push("Matches your current age-focus stage.");
  }

  const matchingGoals = user.goals.filter((goal) => resource.tags.includes(goal));

  if (matchingGoals.length > 0) {
    score += matchingGoals.length * 3;
    reasons.push(
      `Aligned with ${matchingGoals.length} of your priority goals.`,
    );
  }

  if (
    user.role === "professional" &&
    resource.audience.toLowerCase().includes("educator")
  ) {
    score += 2;
    reasons.push("Useful for professional collaboration.");
  }

  if (
    user.role === "self-advocate" &&
    resource.audience.toLowerCase().includes("adults")
  ) {
    score += 2;
    reasons.push("Relevant to self-advocate needs.");
  }

  if (
    user.role === "parent-caregiver" &&
    resource.audience.toLowerCase().includes("caregiver")
  ) {
    score += 2;
    reasons.push("Supports family and caregiver planning.");
  }

  if (resource.verified) {
    score += 1;
    reasons.push("Includes verified professional guidance.");
  }

  if (isRegionalMatch(user.location, resource.regionTags)) {
    score += 4;
    reasons.push("Close to your region.");
  } else if (matchesUserLocation(user.location, resource.regionTags)) {
    score += 1;
    reasons.push("Available wherever you are.");
  }

  if (resource.isSaved) {
    score -= 2;
  }

  return {
    resource,
    score,
    reasons: reasons.slice(0, 3),
  };
}

function scoreEvent(user: AppUser, event: EventRecord) {
  let fitScore = 0;

  const audience = event.audience.toLowerCase();

  if (user.ageGroup === "adult" && audience.includes("adults")) {
    fitScore += 4;
  }

  if (user.ageGroup === "teen" && audience.includes("teens")) {
    fitScore += 4;
  }

  if (
    (user.role === "parent-caregiver" || user.ageGroup === "caregiver") &&
    audience.includes("caregivers")
  ) {
    fitScore += 4;
  }

  if (user.role === "professional" && audience.includes("professionals")) {
    fitScore += 4;
  }

  if (event.format === "Virtual") {
    fitScore += 1;
  }

  if (isRegionalMatch(user.location, event.regionTags)) {
    fitScore += 4;
  } else if (matchesUserLocation(user.location, event.regionTags)) {
    fitScore += 1;
  }

  return {
    ...event,
    fitScore,
  };
}

export function buildRecommendations(
  user: AppUser,
  resources: ResourceRecord[],
  events: EventRecord[],
): RecommendationBundle {
  const recommendedResources: RecommendationRecord[] = resources
    .map((resource) => scoreResource(user, resource))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map((item) => ({
      ...item.resource,
      score: item.score,
      reasons: item.reasons,
    }));

  const matchedEvents = events
    .map((event) => scoreEvent(user, event))
    .sort((left, right) => (right.fitScore ?? 0) - (left.fitScore ?? 0))
    .slice(0, 3);

  return {
    resources: recommendedResources,
    events: matchedEvents,
  };
}

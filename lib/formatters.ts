import {
  ageGroupOptions,
  goalOptions,
  roleOptions,
} from "@/lib/catalog";
import type { AgeGroup, GoalKey, UserRole } from "@/lib/app-types";

const roleLabels = new Map(roleOptions.map((option) => [option.value, option.label]));
const ageLabels = new Map(
  ageGroupOptions.map((option) => [option.value, option.label]),
);
const goalLabels = new Map(goalOptions.map((option) => [option.value, option.label]));

export function formatRole(role: UserRole) {
  return roleLabels.get(role) ?? role;
}

export function formatAgeGroup(ageGroup: AgeGroup) {
  return ageLabels.get(ageGroup) ?? ageGroup;
}

export function formatGoal(goal: GoalKey) {
  return goalLabels.get(goal) ?? goal;
}

export function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export function formatMonthDay(isoDate: string) {
  const date = new Date(isoDate);

  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
  };
}

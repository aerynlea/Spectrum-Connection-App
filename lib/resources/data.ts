import type { Resource } from "./types";

export const resources: Resource[] = [
  {
    id: "speech-therapy-services",
    title: "Speech Therapy Services",
    description:
      "Local speech therapy support focused on communication development and early intervention needs.",
    category: "Therapy",
    ageGroup: "Early Childhood",
    location: "Local",
    verified: true,
    link: "https://example.com/speech-therapy",
  },
  {
    id: "parent-support-group",
    title: "Parent Support Group",
    description:
      "A weekly virtual support circle for parents looking for encouragement, practical advice, and shared understanding.",
    category: "Community",
    ageGroup: "All Ages",
    location: "Virtual",
    verified: true,
    link: "https://example.com/parent-group",
  },
  {
    id: "employment-transition-program",
    title: "Employment Transition Program",
    description:
      "Career readiness and transition support for autistic young adults entering the workforce.",
    category: "Employment",
    ageGroup: "Young Adult",
    location: "Local",
    verified: false,
    link: "https://example.com/employment-program",
  },
];
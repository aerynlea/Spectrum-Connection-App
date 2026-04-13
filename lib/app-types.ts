export type UserRole =
  | "parent-caregiver"
  | "self-advocate"
  | "professional";

export type AuthProvider = "local" | "clerk";

export type AgeGroup =
  | "early-years"
  | "school-age"
  | "teen"
  | "adult"
  | "caregiver";

export type GoalKey =
  | "early-support"
  | "education"
  | "sensory-support"
  | "social-growth"
  | "employment"
  | "independent-living"
  | "caregiver-wellness";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ageGroup: AgeGroup;
  location: string;
  goals: GoalKey[];
  verified: boolean;
  createdAt: string;
};

export type ResourceRecord = {
  id: string;
  title: string;
  summary: string;
  collectionName: string;
  category: string;
  audience: string;
  ageGroup: AgeGroup | "all";
  tags: GoalKey[];
  locationScope: string;
  verified: boolean;
  organization: string;
  href: string;
  regionTags: string[];
  savedCount: number;
  isSaved: boolean;
};

export type EventRecord = {
  id: string;
  title: string;
  detail: string;
  audience: string;
  format: string;
  eventDate: string;
  hostName: string;
  location: string;
  href: string;
  regionTags: string[];
  fitScore?: number;
};

export type CommunityPostRecord = {
  id: string;
  userId: string | null;
  authorName: string;
  authorRole: string;
  topic: string;
  tag: string;
  title: string;
  body: string;
  createdAt: string;
};

export type CommunityReplyRecord = {
  id: string;
  postId: string;
  userId: string | null;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
};

export type ProfessionalRecord = {
  id: string;
  name: string;
  title: string;
  focus: string;
  organization: string;
  location: string;
  summary: string;
  acceptingNewFamilies: boolean;
  verified: boolean;
  href: string;
  regionTags: string[];
};

export type RecommendationRecord = ResourceRecord & {
  score: number;
  reasons: string[];
};

export type RecommendationBundle = {
  resources: RecommendationRecord[];
  events: EventRecord[];
};

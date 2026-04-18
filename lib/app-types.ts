export type UserRole =
  | "parent-caregiver"
  | "self-advocate"
  | "professional";

export type AuthProvider = "local" | "clerk";

export type MembershipTier = "free" | "premium";
export type ModerationTargetType =
  | "community-post"
  | "community-reply"
  | "professional";
export type ModerationReportStatus = "open" | "reviewed" | "dismissed" | "resolved";
export type ModerationActionTaken =
  | "none"
  | "reviewed"
  | "hidden"
  | "restored"
  | "dismissed";
export type ModerationEscalationEventType =
  | "report-filed"
  | "reviewed"
  | "hidden"
  | "restored"
  | "dismissed"
  | "member-note-updated";
export type ModerationSeverityLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";
export type ProfessionalVerificationStatus =
  | "verified"
  | "review-in-progress"
  | "community-shared";

export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

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
  authProvider: AuthProvider;
  externalAuthId: string | null;
  role: UserRole;
  ageGroup: AgeGroup;
  location: string;
  goals: GoalKey[];
  verified: boolean;
  onboardingCompleted: boolean;
  membershipTier: MembershipTier;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
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
  isHidden: boolean;
};

export type CommunityReplyRecord = {
  id: string;
  postId: string;
  userId: string | null;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
  isHidden: boolean;
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
  verificationStatus: ProfessionalVerificationStatus;
  verificationNote: string;
  verificationUpdatedAt: string | null;
  href: string;
  regionTags: string[];
  isHidden: boolean;
};

export type ModerationReportRecord = {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  targetUserId: string | null;
  reporterUserId: string | null;
  reporterName: string;
  reason: string;
  details: string;
  status: ModerationReportStatus;
  actionTaken: ModerationActionTaken;
  moderatorNote: string;
  targetLabel: string;
  targetExcerpt: string;
  targetAuthor: string;
  createdAt: string;
  reviewedAt: string | null;
};

export type TrustHistoryRecord = {
  key: string;
  targetUserId: string | null;
  targetAuthor: string;
  totalReports: number;
  openReports: number;
  resolvedReports: number;
  hiddenActions: number;
  dismissedReports: number;
  lastReportedAt: string;
  lastReviewedAt: string | null;
  severityLevel: ModerationSeverityLevel;
  severityScore: number;
  reviewCues: Array<{
    label: string;
    detail: string;
  }>;
};

export type ModerationMemberNoteRecord = {
  subjectKey: string;
  targetUserId: string | null;
  targetAuthor: string;
  note: string;
  updatedAt: string;
};

export type ModerationEscalationRecord = {
  id: string;
  subjectKey: string;
  targetUserId: string | null;
  targetAuthor: string;
  reportId: string | null;
  eventType: ModerationEscalationEventType;
  reason: string;
  note: string;
  createdAt: string;
};

export type RecommendationRecord = ResourceRecord & {
  score: number;
  reasons: string[];
};

export type RecommendationBundle = {
  resources: RecommendationRecord[];
  events: EventRecord[];
};

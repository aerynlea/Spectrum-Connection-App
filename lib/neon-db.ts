import { randomUUID } from "node:crypto";

import { neon } from "@neondatabase/serverless";

import {
  communityPostSeeds,
  eventSeeds,
  professionalSeeds,
  resourceSeeds,
} from "@/lib/catalog";
import type {
  AgeGroup,
  AppUser,
  AuthProvider,
  CommunityPostRecord,
  CommunityReplyRecord,
  EventRecord,
  GoalKey,
  MembershipTier,
  MemberRosterRecord,
  ModerationActionTaken,
  ModerationEscalationEventType,
  ModerationEscalationRecord,
  ModerationMemberNoteRecord,
  ModerationReportRecord,
  ModerationReportStatus,
  ModerationTargetType,
  ProfessionalVerificationStatus,
  ProfessionalRecord,
  ResourceRecord,
  SubscriptionStatus,
  UserRole,
} from "@/lib/app-types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  auth_provider: AuthProvider;
  external_auth_id: string | null;
  role: UserRole;
  age_group: AgeGroup;
  location: string;
  goals: string;
  verified: boolean;
  onboarding_completed: boolean;
  membership_tier: MembershipTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  newsletter_subscribed: boolean;
  newsletter_subscribed_at: string | null;
  created_at: string;
};

type MemberRosterRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  newsletter_subscribed: boolean;
  newsletter_subscribed_at: string | null;
};

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
};

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
};

type ResourceRow = {
  id: string;
  title: string;
  summary: string;
  collection_name: string;
  category: string;
  audience: string;
  age_group: AgeGroup | "all";
  tags: string;
  location_scope: string;
  verified: boolean;
  organization: string;
  href: string;
  region_tags: string;
  saved_count: string | number;
  is_saved: boolean;
};

type EventRow = {
  id: string;
  title: string;
  detail: string;
  audience: string;
  format: string;
  eventDate: string;
  hostName: string;
  location: string;
  href: string;
  region_tags: string;
};

type ProfessionalRow = {
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
  region_tags: string;
  isHidden: boolean;
};

type CommunityReplyRow = {
  id: string;
  postId: string;
  userId: string | null;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
  isHidden: boolean;
};

type ModerationReportRow = {
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

type ModerationMemberNoteRow = {
  subjectKey: string;
  targetUserId: string | null;
  targetAuthor: string;
  note: string;
  updatedAt: string;
};

type ModerationEscalationRow = {
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

type StatsRow = {
  users_count: string | number;
  resources_count: string | number;
  posts_count: string | number;
  saved_count: string | number;
};

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  ageGroup: AgeGroup;
  location: string;
  goals: GoalKey[];
  verified?: boolean;
  authProvider?: AuthProvider;
  externalAuthId?: string | null;
  onboardingCompleted?: boolean;
  membershipTier?: MembershipTier;
  subscriptionStatus?: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  newsletterSubscribed?: boolean;
};

export type ProfileUpdateInput = {
  name: string;
  role: UserRole;
  ageGroup: AgeGroup;
  location: string;
  goals: GoalKey[];
  onboardingCompleted?: boolean;
  newsletterSubscribed?: boolean;
};

export type MembershipUpdateInput = {
  membershipTier?: MembershipTier;
  subscriptionStatus?: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

export type NewsletterSubscriptionUpdateInput = {
  newsletterSubscribed: boolean;
};

const globalForNeon = globalThis as typeof globalThis & {
  guidingLightNeonInit?: Promise<void>;
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for the Neon adapter.");
  }

  return neon(databaseUrl);
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toUser(row: UserRow): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    authProvider: row.auth_provider,
    externalAuthId: row.external_auth_id,
    role: row.role,
    ageGroup: row.age_group,
    location: row.location,
    goals: parseJson<GoalKey[]>(row.goals, []),
    verified: Boolean(row.verified),
    onboardingCompleted: Boolean(row.onboarding_completed),
    membershipTier: row.membership_tier,
    subscriptionStatus: row.subscription_status,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    newsletterSubscribed: Boolean(row.newsletter_subscribed),
    newsletterSubscribedAt: row.newsletter_subscribed_at,
    createdAt: row.created_at,
  };
}

function toMemberRosterRecord(row: MemberRosterRow): MemberRosterRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    newsletterSubscribed: Boolean(row.newsletter_subscribed),
    newsletterSubscribedAt: row.newsletter_subscribed_at,
  };
}

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

function toResource(row: ResourceRow): ResourceRecord {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    collectionName: row.collection_name,
    category: row.category,
    audience: row.audience,
    ageGroup: row.age_group,
    tags: parseJson<GoalKey[]>(row.tags, []),
    locationScope: row.location_scope,
    verified: Boolean(row.verified),
    organization: row.organization,
    href: row.href,
    regionTags: parseJson<string[]>(row.region_tags, []),
    savedCount: toNumber(row.saved_count),
    isSaved: Boolean(row.is_saved),
  };
}

function toEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    audience: row.audience,
    format: row.format,
    eventDate: row.eventDate,
    hostName: row.hostName,
    location: row.location,
    href: row.href,
    regionTags: parseJson<string[]>(row.region_tags, []),
  };
}

function toProfessional(row: ProfessionalRow): ProfessionalRecord {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    focus: row.focus,
    organization: row.organization,
    location: row.location,
    summary: row.summary,
    acceptingNewFamilies: Boolean(row.acceptingNewFamilies),
    verified: Boolean(row.verified),
    verificationStatus: row.verificationStatus,
    verificationNote: row.verificationNote,
    verificationUpdatedAt: row.verificationUpdatedAt,
    href: row.href,
    regionTags: parseJson<string[]>(row.region_tags, []),
    isHidden: Boolean(row.isHidden),
  };
}

function toCommunityReply(row: CommunityReplyRow): CommunityReplyRecord {
  return {
    id: row.id,
    postId: row.postId,
    userId: row.userId,
    authorName: row.authorName,
    authorRole: row.authorRole,
    body: row.body,
    createdAt: row.createdAt,
    isHidden: Boolean(row.isHidden),
  };
}

function toModerationReport(row: ModerationReportRow): ModerationReportRecord {
  return {
    id: row.id,
    targetType: row.targetType,
    targetId: row.targetId,
    targetUserId: row.targetUserId,
    reporterUserId: row.reporterUserId,
    reporterName: row.reporterName,
    reason: row.reason,
    details: row.details,
    status: row.status,
    actionTaken: row.actionTaken,
    moderatorNote: row.moderatorNote,
    targetLabel: row.targetLabel,
    targetExcerpt: row.targetExcerpt,
    targetAuthor: row.targetAuthor,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt,
  };
}

function toModerationMemberNote(
  row: ModerationMemberNoteRow,
): ModerationMemberNoteRecord {
  return {
    subjectKey: row.subjectKey,
    targetUserId: row.targetUserId,
    targetAuthor: row.targetAuthor,
    note: row.note,
    updatedAt: row.updatedAt,
  };
}

function toModerationEscalation(
  row: ModerationEscalationRow,
): ModerationEscalationRecord {
  return {
    id: row.id,
    subjectKey: row.subjectKey,
    targetUserId: row.targetUserId,
    targetAuthor: row.targetAuthor,
    reportId: row.reportId,
    eventType: row.eventType,
    reason: row.reason,
    note: row.note,
    createdAt: row.createdAt,
  };
}

async function seedHostedDatabase() {
  const sql = getSql();

  await sql.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL,
      age_group TEXT NOT NULL,
      location TEXT NOT NULL,
      goals TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL,
      auth_provider TEXT NOT NULL DEFAULT 'local',
      external_auth_id TEXT,
      onboarding_completed BOOLEAN NOT NULL DEFAULT true,
      membership_tier TEXT NOT NULL DEFAULT 'free',
      subscription_status TEXT NOT NULL DEFAULT 'inactive',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      newsletter_subscribed BOOLEAN NOT NULL DEFAULT false,
      newsletter_subscribed_at TEXT
    )
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT true
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS membership_tier TEXT NOT NULL DEFAULT 'free'
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive'
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN NOT NULL DEFAULT false
  `);

  await sql.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS newsletter_subscribed_at TEXT
  `);

  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_external_auth_id_idx
    ON users (external_auth_id)
    WHERE external_auth_id IS NOT NULL
  `);

  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_idx
    ON users (stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL
  `);

  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_subscription_id_idx
    ON users (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used_at TEXT
    )
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx
    ON password_reset_tokens (user_id)
  `);

  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS password_reset_tokens_token_hash_idx
    ON password_reset_tokens (token_hash)
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      collection_name TEXT NOT NULL,
      category TEXT NOT NULL,
      audience TEXT NOT NULL,
      age_group TEXT NOT NULL,
      tags TEXT NOT NULL,
      location_scope TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT false,
      organization TEXT NOT NULL,
      href TEXT NOT NULL,
      region_tags TEXT NOT NULL DEFAULT '[]'
    )
  `);

  await sql.query(`
    ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS region_tags TEXT NOT NULL DEFAULT '[]'
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      detail TEXT NOT NULL,
      audience TEXT NOT NULL,
      format TEXT NOT NULL,
      event_date TEXT NOT NULL,
      host_name TEXT NOT NULL,
      location TEXT NOT NULL,
      href TEXT NOT NULL DEFAULT '',
      region_tags TEXT NOT NULL DEFAULT '[]'
    )
  `);

  await sql.query(`
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS href TEXT NOT NULL DEFAULT ''
  `);

  await sql.query(`
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS region_tags TEXT NOT NULL DEFAULT '[]'
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      topic TEXT NOT NULL,
      tag TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      is_hidden BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL
    )
  `);

  await sql.query(`
    ALTER TABLE community_posts
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS saved_resources (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, resource_id)
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS professionals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      focus TEXT NOT NULL,
      organization TEXT NOT NULL,
      location TEXT NOT NULL,
      summary TEXT NOT NULL,
      accepting_new_families BOOLEAN NOT NULL DEFAULT false,
      verified BOOLEAN NOT NULL DEFAULT false,
      verification_status TEXT NOT NULL DEFAULT 'community-shared',
      verification_note TEXT NOT NULL DEFAULT '',
      verification_updated_at TEXT,
      is_hidden BOOLEAN NOT NULL DEFAULT false,
      href TEXT NOT NULL DEFAULT '',
      region_tags TEXT NOT NULL DEFAULT '[]'
    )
  `);

  await sql.query(`
    ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'community-shared'
  `);

  await sql.query(`
    ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS verification_note TEXT NOT NULL DEFAULT ''
  `);

  await sql.query(`
    ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS verification_updated_at TEXT
  `);

  await sql.query(`
    ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false
  `);

  await sql.query(`
    ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS href TEXT NOT NULL DEFAULT ''
  `);

  await sql.query(`
    ALTER TABLE professionals
    ADD COLUMN IF NOT EXISTS region_tags TEXT NOT NULL DEFAULT '[]'
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS community_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      body TEXT NOT NULL,
      is_hidden BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL
    )
  `);

  await sql.query(`
    ALTER TABLE community_replies
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS moderation_reports (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_user_id TEXT,
      reporter_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      reporter_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      action_taken TEXT NOT NULL DEFAULT 'none',
      moderator_note TEXT NOT NULL DEFAULT '',
      target_label TEXT NOT NULL,
      target_excerpt TEXT NOT NULL,
      target_author TEXT NOT NULL,
      created_at TEXT NOT NULL,
      reviewed_at TEXT
    )
  `);

  await sql.query(`
    ALTER TABLE moderation_reports
    ADD COLUMN IF NOT EXISTS target_user_id TEXT
  `);

  await sql.query(`
    ALTER TABLE moderation_reports
    ADD COLUMN IF NOT EXISTS moderator_note TEXT NOT NULL DEFAULT ''
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS moderation_reports_status_idx
    ON moderation_reports (status, created_at DESC)
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS moderation_reports_target_idx
    ON moderation_reports (target_type, target_id)
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS moderation_reports_target_user_idx
    ON moderation_reports (target_user_id, created_at DESC)
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS moderation_member_notes (
      subject_key TEXT PRIMARY KEY,
      target_user_id TEXT,
      target_author TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    )
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS moderation_member_notes_target_user_idx
    ON moderation_member_notes (target_user_id)
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS moderation_escalations (
      id TEXT PRIMARY KEY,
      subject_key TEXT NOT NULL,
      target_user_id TEXT,
      target_author TEXT NOT NULL,
      report_id TEXT,
      event_type TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS moderation_escalations_subject_idx
    ON moderation_escalations (subject_key, created_at DESC)
  `);

  await sql.query(`
    CREATE INDEX IF NOT EXISTS moderation_escalations_target_user_idx
    ON moderation_escalations (target_user_id, created_at DESC)
  `);

  for (const resource of resourceSeeds) {
    await sql`
      INSERT INTO resources (
        id,
        title,
        summary,
        collection_name,
        category,
        audience,
        age_group,
        tags,
        location_scope,
        verified,
        organization,
        href,
        region_tags
      ) VALUES (
        ${resource.id},
        ${resource.title},
        ${resource.summary},
        ${resource.collectionName},
        ${resource.category},
        ${resource.audience},
        ${resource.ageGroup},
        ${JSON.stringify(resource.tags)},
        ${resource.locationScope},
        ${resource.verified},
        ${resource.organization},
        ${resource.href},
        ${JSON.stringify(resource.regionTags)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        collection_name = EXCLUDED.collection_name,
        category = EXCLUDED.category,
        audience = EXCLUDED.audience,
        age_group = EXCLUDED.age_group,
        tags = EXCLUDED.tags,
        location_scope = EXCLUDED.location_scope,
        verified = EXCLUDED.verified,
        organization = EXCLUDED.organization,
        href = EXCLUDED.href,
        region_tags = EXCLUDED.region_tags
    `;
  }

  for (const event of eventSeeds) {
    await sql`
      INSERT INTO events (
        id,
        title,
        detail,
        audience,
        format,
        event_date,
        host_name,
        location,
        href,
        region_tags
      ) VALUES (
        ${event.id},
        ${event.title},
        ${event.detail},
        ${event.audience},
        ${event.format},
        ${event.eventDate},
        ${event.hostName},
        ${event.location},
        ${event.href},
        ${JSON.stringify(event.regionTags)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        detail = EXCLUDED.detail,
        audience = EXCLUDED.audience,
        format = EXCLUDED.format,
        event_date = EXCLUDED.event_date,
        host_name = EXCLUDED.host_name,
        location = EXCLUDED.location,
        href = EXCLUDED.href,
        region_tags = EXCLUDED.region_tags
    `;
  }

  for (const professional of professionalSeeds) {
    await sql`
      INSERT INTO professionals (
        id,
        name,
        title,
        focus,
        organization,
        location,
      summary,
      accepting_new_families,
      verified,
      verification_status,
      verification_note,
      verification_updated_at,
      href,
      region_tags
    ) VALUES (
      ${professional.id},
      ${professional.name},
        ${professional.title},
        ${professional.focus},
        ${professional.organization},
        ${professional.location},
      ${professional.summary},
      ${professional.acceptingNewFamilies},
      ${professional.verified},
      ${professional.verificationStatus},
      ${professional.verificationNote},
      ${professional.verificationUpdatedAt},
      ${professional.href},
      ${JSON.stringify(professional.regionTags)}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
        title = EXCLUDED.title,
        focus = EXCLUDED.focus,
        organization = EXCLUDED.organization,
        location = EXCLUDED.location,
      summary = EXCLUDED.summary,
      accepting_new_families = EXCLUDED.accepting_new_families,
      verified = EXCLUDED.verified,
      verification_status = EXCLUDED.verification_status,
      verification_note = EXCLUDED.verification_note,
      verification_updated_at = EXCLUDED.verification_updated_at,
      href = EXCLUDED.href,
      region_tags = EXCLUDED.region_tags
    `;
  }

  for (const post of communityPostSeeds) {
    await sql`
      INSERT INTO community_posts (
        id,
        user_id,
        author_name,
        author_role,
        topic,
        tag,
        title,
        body,
        created_at
      ) VALUES (
        ${post.id},
        ${null},
        ${post.authorName},
        ${post.authorRole},
        ${post.topic},
        ${post.tag},
        ${post.title},
        ${post.body},
        ${post.createdAt}
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

async function ensureHostedDatabase() {
  if (!globalForNeon.guidingLightNeonInit) {
    globalForNeon.guidingLightNeonInit = seedHostedDatabase();
  }

  await globalForNeon.guidingLightNeonInit;
}

export async function getStats() {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT
      (SELECT COUNT(*) FROM users) AS users_count,
      (SELECT COUNT(*) FROM resources) AS resources_count,
      (SELECT COUNT(*) FROM community_posts) AS posts_count,
      (SELECT COUNT(*) FROM saved_resources) AS saved_count
  `) as StatsRow[];

  return {
    usersCount: toNumber(row.users_count),
    resourcesCount: toNumber(row.resources_count),
    postsCount: toNumber(row.posts_count),
    savedCount: toNumber(row.saved_count),
  };
}

export async function getUserByEmail(email: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT
      id,
      name,
      email,
      auth_provider,
      external_auth_id,
      role,
      age_group,
      location,
      goals,
      verified,
      onboarding_completed,
      membership_tier,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      newsletter_subscribed,
      newsletter_subscribed_at,
      created_at
    FROM users
    WHERE lower(email) = lower(${email})
  `) as UserRow[];

  return row ? toUser(row) : null;
}

export async function getUserByExternalAuthId(externalAuthId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT
      id,
      name,
      email,
      auth_provider,
      external_auth_id,
      role,
      age_group,
      location,
      goals,
      verified,
      onboarding_completed,
      membership_tier,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      newsletter_subscribed,
      newsletter_subscribed_at,
      created_at
    FROM users
    WHERE external_auth_id = ${externalAuthId}
  `) as UserRow[];

  return row ? toUser(row) : null;
}

export async function getUserAuthByEmail(email: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT id, password_hash
    FROM users
    WHERE lower(email) = lower(${email})
      AND auth_provider = 'local'
      AND password_hash <> ''
  `) as Array<{ id: string; password_hash: string }>;

  return row ?? undefined;
}

export async function getUserById(userId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT
      id,
      name,
      email,
      auth_provider,
      external_auth_id,
      role,
      age_group,
      location,
      goals,
      verified,
      onboarding_completed,
      membership_tier,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      newsletter_subscribed,
      newsletter_subscribed_at,
      created_at
    FROM users
    WHERE id = ${userId}
  `) as UserRow[];

  return row ? toUser(row) : null;
}

export async function createUser(input: CreateUserInput) {
  await ensureHostedDatabase();
  const sql = getSql();

  const userId = randomUUID();
  const createdAt = new Date().toISOString();
  const newsletterSubscribed = Boolean(input.newsletterSubscribed);
  const newsletterSubscribedAt = newsletterSubscribed ? createdAt : null;

  await sql`
    INSERT INTO users (
      id,
      name,
      email,
      password_hash,
      role,
      age_group,
      location,
      goals,
      verified,
      created_at,
      auth_provider,
      external_auth_id,
      onboarding_completed,
      membership_tier,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      newsletter_subscribed,
      newsletter_subscribed_at
    ) VALUES (
      ${userId},
      ${input.name},
      ${input.email.toLowerCase()},
      ${input.passwordHash ?? ""},
      ${input.role},
      ${input.ageGroup},
      ${input.location},
      ${JSON.stringify(input.goals)},
      ${input.verified ?? false},
      ${createdAt},
      ${input.authProvider ?? "local"},
      ${input.externalAuthId ?? null},
      ${input.onboardingCompleted ?? true},
      ${input.membershipTier ?? "free"},
      ${input.subscriptionStatus ?? "inactive"},
      ${input.stripeCustomerId ?? null},
      ${input.stripeSubscriptionId ?? null},
      ${newsletterSubscribed},
      ${newsletterSubscribedAt}
    )
  `;

  return getUserById(userId);
}

export async function listMemberRoster() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      id,
      name,
      email,
      created_at,
      newsletter_subscribed,
      newsletter_subscribed_at
    FROM users
    ORDER BY created_at DESC, lower(name) ASC, lower(email) ASC
  `) as MemberRosterRow[];

  return rows.map((row) => toMemberRosterRecord(row));
}

export async function upsertHostedUser(input: {
  externalAuthId: string;
  email: string;
  name: string;
}) {
  await ensureHostedDatabase();
  const sql = getSql();

  const existingByExternal = await getUserByExternalAuthId(input.externalAuthId);

  if (existingByExternal) {
    await sql`
      UPDATE users
      SET name = ${input.name}, email = ${input.email.toLowerCase()}
      WHERE id = ${existingByExternal.id}
    `;
    return getUserById(existingByExternal.id);
  }

  const existingByEmail = await getUserByEmail(input.email);

  if (existingByEmail) {
    await sql`
      UPDATE users
      SET
        name = ${input.name},
        auth_provider = 'clerk',
        external_auth_id = ${input.externalAuthId}
      WHERE id = ${existingByEmail.id}
    `;
    return getUserById(existingByEmail.id);
  }

  return createUser({
    name: input.name,
    email: input.email,
    passwordHash: "",
    role: "self-advocate",
    ageGroup: "adult",
    location: "Set your location in dashboard",
    goals: ["social-growth"],
    verified: false,
    authProvider: "clerk",
    externalAuthId: input.externalAuthId,
    onboardingCompleted: false,
  });
}

export async function updateUserProfile(userId: string, input: ProfileUpdateInput) {
  await ensureHostedDatabase();
  const sql = getSql();

  const shouldUpdateOnboarding = Object.prototype.hasOwnProperty.call(
    input,
    "onboardingCompleted",
  );
  const shouldUpdateNewsletter = Object.prototype.hasOwnProperty.call(
    input,
    "newsletterSubscribed",
  );
  const newsletterSubscribed = Boolean(input.newsletterSubscribed);
  const newsletterSubscribedAt = newsletterSubscribed
    ? new Date().toISOString()
    : null;

  await sql`
    UPDATE users
    SET
      name = ${input.name},
      role = ${input.role},
      age_group = ${input.ageGroup},
      location = ${input.location},
      goals = ${JSON.stringify(input.goals)},
      onboarding_completed = CASE
        WHEN ${shouldUpdateOnboarding} THEN ${input.onboardingCompleted ?? false}
        ELSE onboarding_completed
      END,
      newsletter_subscribed = CASE
        WHEN ${shouldUpdateNewsletter} THEN ${newsletterSubscribed}
        ELSE newsletter_subscribed
      END,
      newsletter_subscribed_at = CASE
        WHEN ${shouldUpdateNewsletter} AND ${newsletterSubscribed}
          THEN COALESCE(newsletter_subscribed_at, ${newsletterSubscribedAt})
        WHEN ${shouldUpdateNewsletter}
          THEN NULL
        ELSE newsletter_subscribed_at
      END
    WHERE id = ${userId}
  `;

  return getUserById(userId);
}

export async function updateUserNewsletterSubscription(
  userId: string,
  input: NewsletterSubscriptionUpdateInput,
) {
  await ensureHostedDatabase();
  const sql = getSql();

  const newsletterSubscribed = Boolean(input.newsletterSubscribed);
  const newsletterSubscribedAt = newsletterSubscribed
    ? new Date().toISOString()
    : null;

  await sql`
    UPDATE users
    SET
      newsletter_subscribed = ${newsletterSubscribed},
      newsletter_subscribed_at = CASE
        WHEN ${newsletterSubscribed}
          THEN COALESCE(newsletter_subscribed_at, ${newsletterSubscribedAt})
        ELSE NULL
      END
    WHERE id = ${userId}
  `;

  return getUserById(userId);
}

export async function updateUserMembership(userId: string, input: MembershipUpdateInput) {
  await ensureHostedDatabase();
  const sql = getSql();

  const shouldUpdateCustomer = Object.prototype.hasOwnProperty.call(
    input,
    "stripeCustomerId",
  );
  const shouldUpdateSubscription = Object.prototype.hasOwnProperty.call(
    input,
    "stripeSubscriptionId",
  );

  await sql`
    UPDATE users
    SET
      membership_tier = COALESCE(${input.membershipTier ?? null}, membership_tier),
      subscription_status = COALESCE(${input.subscriptionStatus ?? null}, subscription_status),
      stripe_customer_id = CASE
        WHEN ${shouldUpdateCustomer} THEN ${input.stripeCustomerId ?? null}
        ELSE stripe_customer_id
      END,
      stripe_subscription_id = CASE
        WHEN ${shouldUpdateSubscription} THEN ${input.stripeSubscriptionId ?? null}
        ELSE stripe_subscription_id
      END
    WHERE id = ${userId}
  `;

  return getUserById(userId);
}

export async function createSession(userId: string, expiresAt: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const sessionId = randomUUID();

  await sql`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt}, ${new Date().toISOString()})
  `;

  return sessionId;
}

export async function getSession(sessionId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT id, user_id, expires_at
    FROM sessions
    WHERE id = ${sessionId}
  `) as SessionRow[];

  return row ?? undefined;
}

export async function deleteSession(sessionId: string) {
  await ensureHostedDatabase();
  const sql = getSql();
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function deleteSessionsForUser(userId: string) {
  await ensureHostedDatabase();
  const sql = getSql();
  await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
}

export async function deleteExpiredSessions() {
  await ensureHostedDatabase();
  const sql = getSql();
  await sql`DELETE FROM sessions WHERE expires_at <= ${new Date().toISOString()}`;
}

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: string,
) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;

  const tokenId = randomUUID();

  await sql`
    INSERT INTO password_reset_tokens (
      id,
      user_id,
      token_hash,
      expires_at,
      created_at,
      used_at
    ) VALUES (
      ${tokenId},
      ${userId},
      ${tokenHash},
      ${expiresAt},
      ${new Date().toISOString()},
      ${null}
    )
  `;

  return tokenId;
}

export async function getPasswordResetToken(tokenHash: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT id, user_id, token_hash, created_at, expires_at, used_at
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
  `) as PasswordResetTokenRow[];

  return row ?? undefined;
}

export async function getLatestPasswordResetTokenForUser(userId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT id, user_id, token_hash, created_at, expires_at, used_at
    FROM password_reset_tokens
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as PasswordResetTokenRow[];

  return row ?? undefined;
}

export async function markPasswordResetTokenUsed(tokenId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE password_reset_tokens
    SET used_at = ${new Date().toISOString()}
    WHERE id = ${tokenId}
  `;
}

export async function deletePasswordResetTokensForUser(userId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;
}

export async function deleteExpiredPasswordResetTokens() {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    DELETE FROM password_reset_tokens
    WHERE expires_at <= ${new Date().toISOString()} OR used_at IS NOT NULL
  `;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, auth_provider = 'local'
    WHERE id = ${userId}
  `;

  return getUserById(userId);
}

export async function listResources(userId?: string | null) {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      resources.id,
      resources.title,
      resources.summary,
      resources.collection_name,
      resources.category,
      resources.audience,
      resources.age_group,
      resources.tags,
      resources.location_scope,
      resources.verified,
      resources.organization,
      resources.href,
      resources.region_tags,
      COALESCE(resource_saves.saved_count, 0) AS saved_count,
      CASE
        WHEN user_saves.resource_id IS NULL THEN false
        ELSE true
      END AS is_saved
    FROM resources
    LEFT JOIN (
      SELECT resource_id, COUNT(*) AS saved_count
      FROM saved_resources
      GROUP BY resource_id
    ) AS resource_saves ON resource_saves.resource_id = resources.id
    LEFT JOIN saved_resources AS user_saves
      ON user_saves.resource_id = resources.id
      AND user_saves.user_id = ${userId ?? ""}
    ORDER BY resources.collection_name, resources.title
  `) as ResourceRow[];

  return rows.map(toResource);
}

export async function listSavedResources(userId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      resources.id,
      resources.title,
      resources.summary,
      resources.collection_name,
      resources.category,
      resources.audience,
      resources.age_group,
      resources.tags,
      resources.location_scope,
      resources.verified,
      resources.organization,
      resources.href,
      resources.region_tags,
      COALESCE(resource_saves.saved_count, 0) AS saved_count,
      true AS is_saved
    FROM saved_resources
    INNER JOIN resources ON resources.id = saved_resources.resource_id
    LEFT JOIN (
      SELECT resource_id, COUNT(*) AS saved_count
      FROM saved_resources
      GROUP BY resource_id
    ) AS resource_saves ON resource_saves.resource_id = resources.id
    WHERE saved_resources.user_id = ${userId}
    ORDER BY saved_resources.created_at DESC
  `) as ResourceRow[];

  return rows.map(toResource);
}

export async function toggleSavedResource(userId: string, resourceId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [existing] = (await sql`
    SELECT resource_id
    FROM saved_resources
    WHERE user_id = ${userId} AND resource_id = ${resourceId}
  `) as Array<{ resource_id: string }>;

  if (existing) {
    await sql`
      DELETE FROM saved_resources
      WHERE user_id = ${userId} AND resource_id = ${resourceId}
    `;
    return false;
  }

  await sql`
    INSERT INTO saved_resources (user_id, resource_id, created_at)
    VALUES (${userId}, ${resourceId}, ${new Date().toISOString()})
  `;

  return true;
}

export async function listEvents() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      id,
      title,
      detail,
      audience,
      format,
      event_date AS "eventDate",
      host_name AS "hostName",
      location,
      href,
      region_tags
    FROM events
    ORDER BY event_date ASC
  `) as EventRow[];

  return rows.map(toEvent);
}

export async function listCommunityPosts(limit = 20) {
  await ensureHostedDatabase();
  const sql = getSql();

  return (await sql`
    SELECT
      id,
      user_id AS "userId",
      author_name AS "authorName",
      author_role AS "authorRole",
      topic,
      tag,
      title,
      body,
      created_at AS "createdAt",
      is_hidden AS "isHidden"
    FROM community_posts
    WHERE is_hidden = false
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as CommunityPostRecord[];
}

export async function getCommunityPostById(postId: string, includeHidden = false) {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql.query(
    includeHidden
      ? `
        SELECT
          id,
          user_id AS "userId",
          author_name AS "authorName",
          author_role AS "authorRole",
          topic,
          tag,
          title,
          body,
          created_at AS "createdAt",
          is_hidden AS "isHidden"
        FROM community_posts
        WHERE id = $1
      `
      : `
        SELECT
          id,
          user_id AS "userId",
          author_name AS "authorName",
          author_role AS "authorRole",
          topic,
          tag,
          title,
          body,
          created_at AS "createdAt",
          is_hidden AS "isHidden"
        FROM community_posts
        WHERE id = $1 AND is_hidden = false
      `,
    [postId],
  )) as CommunityPostRecord[];

  return rows[0];
}

export async function listCommunityReplies() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      id,
      post_id AS "postId",
      user_id AS "userId",
      author_name AS "authorName",
      author_role AS "authorRole",
      body,
      created_at AS "createdAt",
      is_hidden AS "isHidden"
    FROM community_replies
    WHERE is_hidden = false
    ORDER BY created_at ASC
  `) as CommunityReplyRow[];

  return rows.map(toCommunityReply);
}

export async function getCommunityReplyById(replyId: string, includeHidden = false) {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql.query(
    includeHidden
      ? `
        SELECT
          id,
          post_id AS "postId",
          user_id AS "userId",
          author_name AS "authorName",
          author_role AS "authorRole",
          body,
          created_at AS "createdAt",
          is_hidden AS "isHidden"
        FROM community_replies
        WHERE id = $1
      `
      : `
        SELECT
          id,
          post_id AS "postId",
          user_id AS "userId",
          author_name AS "authorName",
          author_role AS "authorRole",
          body,
          created_at AS "createdAt",
          is_hidden AS "isHidden"
        FROM community_replies
        WHERE id = $1 AND is_hidden = false
      `,
    [replyId],
  )) as CommunityReplyRow[];

  return rows[0] ? toCommunityReply(rows[0]) : undefined;
}

export async function createCommunityPost(input: {
  userId: string;
  authorName: string;
  authorRole: string;
  topic: string;
  tag: string;
  title: string;
  body: string;
}) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    INSERT INTO community_posts (
      id,
      user_id,
      author_name,
      author_role,
      topic,
      tag,
      title,
      body,
      is_hidden,
      created_at
    ) VALUES (
      ${randomUUID()},
      ${input.userId},
      ${input.authorName},
      ${input.authorRole},
      ${input.topic},
      ${input.tag},
      ${input.title},
      ${input.body},
      ${false},
      ${new Date().toISOString()}
    )
  `;
}

export async function createCommunityReply(input: {
  postId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  body: string;
}) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    INSERT INTO community_replies (
      id,
      post_id,
      user_id,
      author_name,
      author_role,
      body,
      is_hidden,
      created_at
    ) VALUES (
      ${randomUUID()},
      ${input.postId},
      ${input.userId},
      ${input.authorName},
      ${input.authorRole},
      ${input.body},
      ${false},
      ${new Date().toISOString()}
    )
  `;
}

export async function listProfessionals(includeHidden = false) {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = includeHidden
    ? ((await sql`
    SELECT
      id,
      name,
      title,
      focus,
      organization,
      location,
      summary,
      accepting_new_families AS "acceptingNewFamilies",
      verified,
      verification_status AS "verificationStatus",
      verification_note AS "verificationNote",
      verification_updated_at AS "verificationUpdatedAt",
      href,
      region_tags,
      is_hidden AS "isHidden"
    FROM professionals
    ORDER BY verified DESC, accepting_new_families DESC, name ASC
  `) as ProfessionalRow[])
    : ((await sql`
    SELECT
      id,
      name,
      title,
      focus,
      organization,
      location,
      summary,
      accepting_new_families AS "acceptingNewFamilies",
      verified,
      verification_status AS "verificationStatus",
      verification_note AS "verificationNote",
      verification_updated_at AS "verificationUpdatedAt",
      href,
      region_tags,
      is_hidden AS "isHidden"
    FROM professionals
    WHERE is_hidden = false
    ORDER BY verified DESC, accepting_new_families DESC, name ASC
  `) as ProfessionalRow[]);

  return rows.map(toProfessional);
}

export async function getProfessionalById(professionalId: string, includeHidden = false) {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql.query(
    includeHidden
      ? `
        SELECT
          id,
          name,
          title,
          focus,
          organization,
          location,
          summary,
          accepting_new_families AS "acceptingNewFamilies",
          verified,
          verification_status AS "verificationStatus",
          verification_note AS "verificationNote",
          verification_updated_at AS "verificationUpdatedAt",
          href,
          region_tags,
          is_hidden AS "isHidden"
        FROM professionals
        WHERE id = $1
      `
      : `
        SELECT
          id,
          name,
          title,
          focus,
          organization,
          location,
          summary,
          accepting_new_families AS "acceptingNewFamilies",
          verified,
          verification_status AS "verificationStatus",
          verification_note AS "verificationNote",
          verification_updated_at AS "verificationUpdatedAt",
          href,
          region_tags,
          is_hidden AS "isHidden"
        FROM professionals
        WHERE id = $1 AND is_hidden = false
      `,
    [professionalId],
  )) as ProfessionalRow[];

  return rows[0] ? toProfessional(rows[0]) : undefined;
}

export async function createModerationReport(input: {
  targetType: ModerationTargetType;
  targetId: string;
  targetUserId: string | null;
  reporterUserId: string | null;
  reporterName: string;
  reason: string;
  details: string;
  targetLabel: string;
  targetExcerpt: string;
  targetAuthor: string;
}) {
  await ensureHostedDatabase();
  const sql = getSql();
  const reportId = randomUUID();

  await sql`
    INSERT INTO moderation_reports (
      id,
      target_type,
      target_id,
      target_user_id,
      reporter_user_id,
      reporter_name,
      reason,
      details,
      status,
      action_taken,
      moderator_note,
      target_label,
      target_excerpt,
      target_author,
      created_at,
      reviewed_at
    ) VALUES (
      ${reportId},
      ${input.targetType},
      ${input.targetId},
      ${input.targetUserId},
      ${input.reporterUserId},
      ${input.reporterName},
      ${input.reason},
      ${input.details},
      ${"open"},
      ${"none"},
      ${""},
      ${input.targetLabel},
      ${input.targetExcerpt},
      ${input.targetAuthor},
      ${new Date().toISOString()},
      ${null}
    )
  `;

  return reportId;
}

export async function listModerationReports() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      id,
      target_type AS "targetType",
      target_id AS "targetId",
      target_user_id AS "targetUserId",
      reporter_user_id AS "reporterUserId",
      reporter_name AS "reporterName",
      reason,
      details,
      status,
      action_taken AS "actionTaken",
      moderator_note AS "moderatorNote",
      target_label AS "targetLabel",
      target_excerpt AS "targetExcerpt",
      target_author AS "targetAuthor",
      created_at AS "createdAt",
      reviewed_at AS "reviewedAt"
    FROM moderation_reports
    ORDER BY
      CASE status
        WHEN 'open' THEN 0
        WHEN 'reviewed' THEN 1
        WHEN 'resolved' THEN 2
        ELSE 3
      END,
      created_at DESC
  `) as ModerationReportRow[];

  return rows.map(toModerationReport);
}

export async function listModerationMemberNotes() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      subject_key AS "subjectKey",
      target_user_id AS "targetUserId",
      target_author AS "targetAuthor",
      note,
      updated_at AS "updatedAt"
    FROM moderation_member_notes
    ORDER BY updated_at DESC
  `) as ModerationMemberNoteRow[];

  return rows.map(toModerationMemberNote);
}

export async function upsertModerationMemberNote(input: {
  subjectKey: string;
  targetUserId: string | null;
  targetAuthor: string;
  note: string;
}) {
  await ensureHostedDatabase();
  const sql = getSql();
  const trimmedNote = input.note.trim();

  if (!trimmedNote) {
    await sql`
      DELETE FROM moderation_member_notes
      WHERE subject_key = ${input.subjectKey}
    `;
    return;
  }

  await sql`
    INSERT INTO moderation_member_notes (
      subject_key,
      target_user_id,
      target_author,
      note,
      updated_at
    ) VALUES (
      ${input.subjectKey},
      ${input.targetUserId},
      ${input.targetAuthor},
      ${trimmedNote},
      ${new Date().toISOString()}
    )
    ON CONFLICT (subject_key) DO UPDATE SET
      target_user_id = EXCLUDED.target_user_id,
      target_author = EXCLUDED.target_author,
      note = EXCLUDED.note,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function listModerationEscalations() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
    SELECT
      id,
      subject_key AS "subjectKey",
      target_user_id AS "targetUserId",
      target_author AS "targetAuthor",
      report_id AS "reportId",
      event_type AS "eventType",
      reason,
      note,
      created_at AS "createdAt"
    FROM moderation_escalations
    ORDER BY created_at DESC
  `) as ModerationEscalationRow[];

  return rows.map(toModerationEscalation);
}

export async function createModerationEscalation(input: {
  subjectKey: string;
  targetUserId: string | null;
  targetAuthor: string;
  reportId: string | null;
  eventType: ModerationEscalationEventType;
  reason: string;
  note: string;
}) {
  await ensureHostedDatabase();
  const sql = getSql();
  const escalationId = randomUUID();

  await sql`
    INSERT INTO moderation_escalations (
      id,
      subject_key,
      target_user_id,
      target_author,
      report_id,
      event_type,
      reason,
      note,
      created_at
    ) VALUES (
      ${escalationId},
      ${input.subjectKey},
      ${input.targetUserId},
      ${input.targetAuthor},
      ${input.reportId},
      ${input.eventType},
      ${input.reason},
      ${input.note},
      ${new Date().toISOString()}
    )
  `;

  return escalationId;
}

export async function updateModerationReport(
  reportId: string,
  input: {
    status: ModerationReportStatus;
    actionTaken: ModerationActionTaken;
    moderatorNote?: string;
  },
) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE moderation_reports
    SET
      status = ${input.status},
      action_taken = ${input.actionTaken},
      moderator_note = ${input.moderatorNote ?? ""},
      reviewed_at = ${new Date().toISOString()}
    WHERE id = ${reportId}
  `;
}

export async function setCommunityPostHidden(postId: string, isHidden: boolean) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE community_posts
    SET is_hidden = ${isHidden}
    WHERE id = ${postId}
  `;
}

export async function setCommunityReplyHidden(replyId: string, isHidden: boolean) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE community_replies
    SET is_hidden = ${isHidden}
    WHERE id = ${replyId}
  `;
}

export async function setProfessionalHidden(professionalId: string, isHidden: boolean) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE professionals
    SET is_hidden = ${isHidden}
    WHERE id = ${professionalId}
  `;
}

export async function updateProfessionalVerification(
  professionalId: string,
  input: {
    verificationStatus: ProfessionalVerificationStatus;
    verificationNote: string;
  },
) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE professionals
    SET
      verified = ${input.verificationStatus === "verified"},
      verification_status = ${input.verificationStatus},
      verification_note = ${input.verificationNote},
      verification_updated_at = ${new Date().toISOString()}
    WHERE id = ${professionalId}
  `;
}

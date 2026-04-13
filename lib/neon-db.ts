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
  ProfessionalRecord,
  ResourceRecord,
  UserRole,
} from "@/lib/app-types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age_group: AgeGroup;
  location: string;
  goals: string;
  verified: boolean;
  created_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
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
  href: string;
  region_tags: string;
};

type CommunityReplyRow = {
  id: string;
  postId: string;
  userId: string | null;
  authorName: string;
  authorRole: string;
  body: string;
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
};

export type ProfileUpdateInput = {
  name: string;
  role: UserRole;
  ageGroup: AgeGroup;
  location: string;
  goals: GoalKey[];
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
    role: row.role,
    ageGroup: row.age_group,
    location: row.location,
    goals: parseJson<GoalKey[]>(row.goals, []),
    verified: Boolean(row.verified),
    createdAt: row.created_at,
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
    href: row.href,
    regionTags: parseJson<string[]>(row.region_tags, []),
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
      external_auth_id TEXT
    )
  `);

  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_external_auth_id_idx
    ON users (external_auth_id)
    WHERE external_auth_id IS NOT NULL
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
      created_at TEXT NOT NULL
    )
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
      href TEXT NOT NULL DEFAULT '',
      region_tags TEXT NOT NULL DEFAULT '[]'
    )
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
      created_at TEXT NOT NULL
    )
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
    SELECT id, name, email, role, age_group, location, goals, verified, created_at
    FROM users
    WHERE lower(email) = lower(${email})
  `) as UserRow[];

  return row ? toUser(row) : null;
}

export async function getUserByExternalAuthId(externalAuthId: string) {
  await ensureHostedDatabase();
  const sql = getSql();

  const [row] = (await sql`
    SELECT id, name, email, role, age_group, location, goals, verified, created_at
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
    SELECT id, name, email, role, age_group, location, goals, verified, created_at
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
      external_auth_id
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
      ${input.externalAuthId ?? null}
    )
  `;

  return getUserById(userId);
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
  });
}

export async function updateUserProfile(userId: string, input: ProfileUpdateInput) {
  await ensureHostedDatabase();
  const sql = getSql();

  await sql`
    UPDATE users
    SET
      name = ${input.name},
      role = ${input.role},
      age_group = ${input.ageGroup},
      location = ${input.location},
      goals = ${JSON.stringify(input.goals)}
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

export async function deleteExpiredSessions() {
  await ensureHostedDatabase();
  const sql = getSql();
  await sql`DELETE FROM sessions WHERE expires_at <= ${new Date().toISOString()}`;
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
      created_at AS "createdAt"
    FROM community_posts
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as CommunityPostRecord[];
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
      created_at AS "createdAt"
    FROM community_replies
    ORDER BY created_at ASC
  `) as CommunityReplyRow[];

  return rows.map(toCommunityReply);
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
      created_at
    ) VALUES (
      ${randomUUID()},
      ${input.postId},
      ${input.userId},
      ${input.authorName},
      ${input.authorRole},
      ${input.body},
      ${new Date().toISOString()}
    )
  `;
}

export async function listProfessionals() {
  await ensureHostedDatabase();
  const sql = getSql();

  const rows = (await sql`
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
      href,
      region_tags
    FROM professionals
    ORDER BY verified DESC, accepting_new_families DESC, name ASC
  `) as ProfessionalRow[];

  return rows.map(toProfessional);
}

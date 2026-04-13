import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

import {
  communityPostSeeds,
  eventSeeds,
  professionalSeeds,
  resourceSeeds,
} from "@/lib/catalog";
import type {
  AppUser,
  AuthProvider,
  CommunityPostRecord,
  EventRecord,
  ProfessionalRecord,
  ResourceRecord,
  UserRole,
  AgeGroup,
  GoalKey,
} from "@/lib/app-types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age_group: AgeGroup;
  location: string;
  goals: string;
  verified: number;
  created_at: string;
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
  verified: number;
  organization: string;
  href: string;
  region_tags: string;
  saved_count?: number;
  is_saved?: number;
};

type CommunityRow = {
  id: string;
  user_id: string | null;
  author_name: string;
  author_role: string;
  topic: string;
  tag: string;
  title: string;
  body: string;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  detail: string;
  audience: string;
  format: string;
  event_date: string;
  host_name: string;
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
  accepting_new_families: number;
  verified: number;
  href: string;
  region_tags: string;
};

type CommunityReplyRow = {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string;
  author_role: string;
  body: string;
  created_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
};

type StatsRow = {
  users_count: number;
  resources_count: number;
  posts_count: number;
  saved_count: number;
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

const dataDirectory = join(process.cwd(), "data");
const databasePath = join(dataDirectory, "guiding-light.db");
const schemaVersion = "2026-04-real-connections";

const globalForDatabase = globalThis as typeof globalThis & {
  guidingLightDb?: DatabaseSync;
  guidingLightDbSchemaVersion?: string;
};

function getDatabase() {
  if (globalForDatabase.guidingLightDb) {
    if (globalForDatabase.guidingLightDbSchemaVersion !== schemaVersion) {
      ensureUserColumns(globalForDatabase.guidingLightDb);
      ensureContentColumns(globalForDatabase.guidingLightDb);
      seedDatabase(globalForDatabase.guidingLightDb);
      globalForDatabase.guidingLightDbSchemaVersion = schemaVersion;
    }

    return globalForDatabase.guidingLightDb;
  }

  mkdirSync(dataDirectory, { recursive: true });

  const db = new DatabaseSync(databasePath);

  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL,
      age_group TEXT NOT NULL,
      location TEXT NOT NULL,
      goals TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      auth_provider TEXT NOT NULL DEFAULT 'local',
      external_auth_id TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

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
      verified INTEGER NOT NULL DEFAULT 0,
      organization TEXT NOT NULL,
      href TEXT NOT NULL,
      region_tags TEXT NOT NULL DEFAULT '[]'
    );

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
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      topic TEXT NOT NULL,
      tag TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS saved_resources (
      user_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, resource_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS professionals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      focus TEXT NOT NULL,
      organization TEXT NOT NULL,
      location TEXT NOT NULL,
      summary TEXT NOT NULL,
      accepting_new_families INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      href TEXT NOT NULL DEFAULT '',
      region_tags TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS community_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  ensureUserColumns(db);
  ensureContentColumns(db);

  seedDatabase(db);

  globalForDatabase.guidingLightDb = db;
  globalForDatabase.guidingLightDbSchemaVersion = schemaVersion;
  return db;
}

function database() {
  return getDatabase();
}

function ensureUserColumns(database: DatabaseSync) {
  const columns = database
    .prepare("PRAGMA table_info(users)")
    .all() as Array<{ name: string }>;
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("auth_provider")) {
    database.exec(
      "ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'local'",
    );
  }

  if (!columnNames.has("external_auth_id")) {
    database.exec("ALTER TABLE users ADD COLUMN external_auth_id TEXT");
  }

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_external_auth_id_idx
    ON users (external_auth_id)
  `);
}

function ensureColumn(
  database: DatabaseSync,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as Array<{ name: string }>;

  if (!columns.some((column) => column.name === columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
}

function ensureContentColumns(database: DatabaseSync) {
  ensureColumn(
    database,
    "resources",
    "region_tags",
    "region_tags TEXT NOT NULL DEFAULT '[]'",
  );
  ensureColumn(database, "events", "href", "href TEXT NOT NULL DEFAULT ''");
  ensureColumn(
    database,
    "events",
    "region_tags",
    "region_tags TEXT NOT NULL DEFAULT '[]'",
  );
  ensureColumn(
    database,
    "professionals",
    "href",
    "href TEXT NOT NULL DEFAULT ''",
  );
  ensureColumn(
    database,
    "professionals",
    "region_tags",
    "region_tags TEXT NOT NULL DEFAULT '[]'",
  );

  database.exec(`
    CREATE TABLE IF NOT EXISTS community_replies (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
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
    savedCount: row.saved_count ?? 0,
    isSaved: Boolean(row.is_saved ?? 0),
  };
}

function toEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    audience: row.audience,
    format: row.format,
    eventDate: row.event_date,
    hostName: row.host_name,
    location: row.location,
    href: row.href,
    regionTags: parseJson<string[]>(row.region_tags, []),
  };
}

function toCommunityPost(row: CommunityRow): CommunityPostRecord {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    topic: row.topic,
    tag: row.tag,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
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
    acceptingNewFamilies: Boolean(row.accepting_new_families),
    verified: Boolean(row.verified),
    href: row.href,
    regionTags: parseJson<string[]>(row.region_tags, []),
  };
}

function toCommunityReply(row: CommunityReplyRow) {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    body: row.body,
    createdAt: row.created_at,
  };
}

function seedDatabase(database: DatabaseSync) {
  const upsertResource = database.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      collection_name = excluded.collection_name,
      category = excluded.category,
      audience = excluded.audience,
      age_group = excluded.age_group,
      tags = excluded.tags,
      location_scope = excluded.location_scope,
      verified = excluded.verified,
      organization = excluded.organization,
      href = excluded.href,
      region_tags = excluded.region_tags
  `);

  for (const resource of resourceSeeds) {
    upsertResource.run(
      resource.id,
      resource.title,
      resource.summary,
      resource.collectionName,
      resource.category,
      resource.audience,
      resource.ageGroup,
      JSON.stringify(resource.tags),
      resource.locationScope,
      resource.verified ? 1 : 0,
      resource.organization,
      resource.href,
      JSON.stringify(resource.regionTags),
    );
  }

  const upsertEvent = database.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      detail = excluded.detail,
      audience = excluded.audience,
      format = excluded.format,
      event_date = excluded.event_date,
      host_name = excluded.host_name,
      location = excluded.location,
      href = excluded.href,
      region_tags = excluded.region_tags
  `);

  for (const event of eventSeeds) {
    upsertEvent.run(
      event.id,
      event.title,
      event.detail,
      event.audience,
      event.format,
      event.eventDate,
      event.hostName,
      event.location,
      event.href,
      JSON.stringify(event.regionTags),
    );
  }

  const upsertProfessional = database.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      title = excluded.title,
      focus = excluded.focus,
      organization = excluded.organization,
      location = excluded.location,
      summary = excluded.summary,
      accepting_new_families = excluded.accepting_new_families,
      verified = excluded.verified,
      href = excluded.href,
      region_tags = excluded.region_tags
  `);

  for (const professional of professionalSeeds) {
    upsertProfessional.run(
      professional.id,
      professional.name,
      professional.title,
      professional.focus,
      professional.organization,
      professional.location,
      professional.summary,
      professional.acceptingNewFamilies ? 1 : 0,
      professional.verified ? 1 : 0,
      professional.href,
      JSON.stringify(professional.regionTags),
    );
  }

  const insertPost = database.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  for (const post of communityPostSeeds) {
    insertPost.run(
      post.id,
      null,
      post.authorName,
      post.authorRole,
      post.topic,
      post.tag,
      post.title,
      post.body,
      post.createdAt,
    );
  }
}

export function getStats() {
  const row = database().prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users_count,
      (SELECT COUNT(*) FROM resources) AS resources_count,
      (SELECT COUNT(*) FROM community_posts) AS posts_count,
      (SELECT COUNT(*) FROM saved_resources) AS saved_count
  `).get() as StatsRow;

  return {
    usersCount: row.users_count,
    resourcesCount: row.resources_count,
    postsCount: row.posts_count,
    savedCount: row.saved_count,
  };
}

export function getUserByEmail(email: string) {
  const row = database()
    .prepare(
      "SELECT id, name, email, role, age_group, location, goals, verified, created_at FROM users WHERE lower(email) = lower(?)",
    )
    .get(email) as UserRow | undefined;

  return row ? toUser(row) : null;
}

export function getUserByExternalAuthId(externalAuthId: string) {
  const row = database()
    .prepare(
      "SELECT id, name, email, role, age_group, location, goals, verified, created_at FROM users WHERE external_auth_id = ?",
    )
    .get(externalAuthId) as UserRow | undefined;

  return row ? toUser(row) : null;
}

export function getUserAuthByEmail(email: string) {
  return database()
    .prepare(
      "SELECT id, password_hash FROM users WHERE lower(email) = lower(?) AND auth_provider = 'local' AND password_hash <> ''",
    )
    .get(email) as { id: string; password_hash: string } | undefined;
}

export function getUserById(userId: string) {
  const row = database()
    .prepare(
      "SELECT id, name, email, role, age_group, location, goals, verified, created_at FROM users WHERE id = ?",
    )
    .get(userId) as UserRow | undefined;

  return row ? toUser(row) : null;
}

export function createUser(input: CreateUserInput) {
  const userId = randomUUID();
  const createdAt = new Date().toISOString();

  database().prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    input.name,
    input.email.toLowerCase(),
    input.passwordHash ?? "",
    input.role,
    input.ageGroup,
    input.location,
    JSON.stringify(input.goals),
    input.verified ? 1 : 0,
    createdAt,
    input.authProvider ?? "local",
    input.externalAuthId ?? null,
  );

  return getUserById(userId);
}

export function upsertHostedUser(input: {
  externalAuthId: string;
  email: string;
  name: string;
}) {
  const existingByExternal = getUserByExternalAuthId(input.externalAuthId);

  if (existingByExternal) {
    database().prepare(`
      UPDATE users
      SET name = ?, email = ?
      WHERE id = ?
    `).run(input.name, input.email.toLowerCase(), existingByExternal.id);

    return getUserById(existingByExternal.id);
  }

  const existingByEmail = getUserByEmail(input.email);

  if (existingByEmail) {
    database().prepare(`
      UPDATE users
      SET
        name = ?,
        auth_provider = 'clerk',
        external_auth_id = ?
      WHERE id = ?
    `).run(input.name, input.externalAuthId, existingByEmail.id);

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

export function updateUserProfile(userId: string, input: ProfileUpdateInput) {
  database().prepare(`
    UPDATE users
    SET name = ?, role = ?, age_group = ?, location = ?, goals = ?
    WHERE id = ?
  `).run(
    input.name,
    input.role,
    input.ageGroup,
    input.location,
    JSON.stringify(input.goals),
    userId,
  );

  return getUserById(userId);
}

export function createSession(userId: string, expiresAt: string) {
  const sessionId = randomUUID();

  database().prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, userId, expiresAt, new Date().toISOString());

  return sessionId;
}

export function getSession(sessionId: string) {
  return database()
    .prepare("SELECT id, user_id, expires_at FROM sessions WHERE id = ?")
    .get(sessionId) as SessionRow | undefined;
}

export function deleteSession(sessionId: string) {
  database().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function deleteExpiredSessions() {
  database().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(
    new Date().toISOString(),
  );
}

export function listResources(userId?: string | null) {
  const query = `
    SELECT
      resources.*,
      COUNT(saved_resources.resource_id) AS saved_count,
      MAX(CASE WHEN saved_resources.user_id = ? THEN 1 ELSE 0 END) AS is_saved
    FROM resources
    LEFT JOIN saved_resources
      ON saved_resources.resource_id = resources.id
    GROUP BY resources.id
    ORDER BY resources.collection_name, resources.title
  `;

  return (database().prepare(query).all(userId ?? "") as ResourceRow[]).map(
    toResource,
  );
}

export function listSavedResources(userId: string) {
  const rows = database()
    .prepare(`
      SELECT
        resources.*,
        COUNT(saved_resources.resource_id) AS saved_count,
        1 AS is_saved
      FROM saved_resources
      INNER JOIN resources ON resources.id = saved_resources.resource_id
      WHERE saved_resources.user_id = ?
      GROUP BY resources.id
      ORDER BY saved_resources.created_at DESC
    `)
    .all(userId) as ResourceRow[];

  return rows.map(toResource);
}

export function toggleSavedResource(userId: string, resourceId: string) {
  const existing = database()
    .prepare(
      "SELECT 1 FROM saved_resources WHERE user_id = ? AND resource_id = ?",
    )
    .get(userId, resourceId) as { 1: number } | undefined;

  if (existing) {
    database().prepare(
      "DELETE FROM saved_resources WHERE user_id = ? AND resource_id = ?",
    ).run(userId, resourceId);
    return false;
  }

  database().prepare(`
    INSERT INTO saved_resources (user_id, resource_id, created_at)
    VALUES (?, ?, ?)
  `).run(userId, resourceId, new Date().toISOString());

  return true;
}

export function listEvents() {
  const rows = database()
    .prepare(
      "SELECT id, title, detail, audience, format, event_date, host_name, location, href, region_tags FROM events ORDER BY event_date ASC",
    )
    .all() as EventRow[];

  return rows.map(toEvent);
}

export function listCommunityPosts(limit = 20) {
  const rows = database()
    .prepare(`
      SELECT
        id,
        user_id,
        author_name,
        author_role,
        topic,
        tag,
        title,
        body,
        created_at
      FROM community_posts
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(limit) as CommunityRow[];

  return rows.map(toCommunityPost);
}

export function listCommunityReplies() {
  const rows = database()
    .prepare(`
      SELECT
        id,
        post_id,
        user_id,
        author_name,
        author_role,
        body,
        created_at
      FROM community_replies
      ORDER BY created_at ASC
    `)
    .all() as CommunityReplyRow[];

  return rows.map(toCommunityReply);
}

export function createCommunityPost(input: {
  userId: string;
  authorName: string;
  authorRole: string;
  topic: string;
  tag: string;
  title: string;
  body: string;
}) {
  database().prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    input.userId,
    input.authorName,
    input.authorRole,
    input.topic,
    input.tag,
    input.title,
    input.body,
    new Date().toISOString(),
  );
}

export function createCommunityReply(input: {
  postId: string;
  userId: string;
  authorName: string;
  authorRole: string;
  body: string;
}) {
  database().prepare(`
    INSERT INTO community_replies (
      id,
      post_id,
      user_id,
      author_name,
      author_role,
      body,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    input.postId,
    input.userId,
    input.authorName,
    input.authorRole,
    input.body,
    new Date().toISOString(),
  );
}

export function listProfessionals() {
  const rows = database()
    .prepare(`
      SELECT
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
      FROM professionals
      ORDER BY verified DESC, accepting_new_families DESC, name ASC
    `)
    .all() as ProfessionalRow[];

  return rows.map(toProfessional);
}

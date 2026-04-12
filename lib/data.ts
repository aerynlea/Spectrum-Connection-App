import * as local from "@/lib/db";
import * as hosted from "@/lib/neon-db";
import { isNeonConfigured } from "@/lib/platform";

export async function getStats() {
  return isNeonConfigured ? hosted.getStats() : local.getStats();
}

export async function getUserByEmail(email: string) {
  return isNeonConfigured ? hosted.getUserByEmail(email) : local.getUserByEmail(email);
}

export async function getUserByExternalAuthId(externalAuthId: string) {
  return isNeonConfigured
    ? hosted.getUserByExternalAuthId(externalAuthId)
    : local.getUserByExternalAuthId(externalAuthId);
}

export async function getUserAuthByEmail(email: string) {
  return isNeonConfigured
    ? hosted.getUserAuthByEmail(email)
    : local.getUserAuthByEmail(email);
}

export async function getUserById(userId: string) {
  return isNeonConfigured ? hosted.getUserById(userId) : local.getUserById(userId);
}

export async function createUser(
  input: Parameters<typeof local.createUser>[0],
) {
  return isNeonConfigured ? hosted.createUser(input) : local.createUser(input);
}

export async function upsertHostedUser(
  input: Parameters<typeof local.upsertHostedUser>[0],
) {
  return isNeonConfigured
    ? hosted.upsertHostedUser(input)
    : local.upsertHostedUser(input);
}

export async function updateUserProfile(
  userId: string,
  input: Parameters<typeof local.updateUserProfile>[1],
) {
  return isNeonConfigured
    ? hosted.updateUserProfile(userId, input)
    : local.updateUserProfile(userId, input);
}

export async function createSession(userId: string, expiresAt: string) {
  return isNeonConfigured
    ? hosted.createSession(userId, expiresAt)
    : local.createSession(userId, expiresAt);
}

export async function getSession(sessionId: string) {
  return isNeonConfigured ? hosted.getSession(sessionId) : local.getSession(sessionId);
}

export async function deleteSession(sessionId: string) {
  return isNeonConfigured
    ? hosted.deleteSession(sessionId)
    : local.deleteSession(sessionId);
}

export async function deleteExpiredSessions() {
  return isNeonConfigured
    ? hosted.deleteExpiredSessions()
    : local.deleteExpiredSessions();
}

export async function listResources(userId?: string | null) {
  return isNeonConfigured
    ? hosted.listResources(userId)
    : local.listResources(userId);
}

export async function listSavedResources(userId: string) {
  return isNeonConfigured
    ? hosted.listSavedResources(userId)
    : local.listSavedResources(userId);
}

export async function toggleSavedResource(userId: string, resourceId: string) {
  return isNeonConfigured
    ? hosted.toggleSavedResource(userId, resourceId)
    : local.toggleSavedResource(userId, resourceId);
}

export async function listEvents() {
  return isNeonConfigured ? hosted.listEvents() : local.listEvents();
}

export async function listCommunityPosts(limit = 20) {
  return isNeonConfigured
    ? hosted.listCommunityPosts(limit)
    : local.listCommunityPosts(limit);
}

export async function createCommunityPost(
  input: Parameters<typeof local.createCommunityPost>[0],
) {
  return isNeonConfigured
    ? hosted.createCommunityPost(input)
    : local.createCommunityPost(input);
}

export async function listProfessionals() {
  return isNeonConfigured
    ? hosted.listProfessionals()
    : local.listProfessionals();
}

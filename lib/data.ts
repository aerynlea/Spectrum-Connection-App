import { isNeonConfigured } from "@/lib/platform";

type LocalModule = typeof import("@/lib/db");

async function getLocal() {
  return import("@/lib/db");
}

async function getHosted() {
  return import("@/lib/neon-db");
}

export async function getStats() {
  return isNeonConfigured ? (await getHosted()).getStats() : (await getLocal()).getStats();
}

export async function getUserByEmail(email: string) {
  return isNeonConfigured
    ? (await getHosted()).getUserByEmail(email)
    : (await getLocal()).getUserByEmail(email);
}

export async function getUserByExternalAuthId(externalAuthId: string) {
  return isNeonConfigured
    ? (await getHosted()).getUserByExternalAuthId(externalAuthId)
    : (await getLocal()).getUserByExternalAuthId(externalAuthId);
}

export async function getUserAuthByEmail(email: string) {
  return isNeonConfigured
    ? (await getHosted()).getUserAuthByEmail(email)
    : (await getLocal()).getUserAuthByEmail(email);
}

export async function getUserById(userId: string) {
  return isNeonConfigured
    ? (await getHosted()).getUserById(userId)
    : (await getLocal()).getUserById(userId);
}

export async function listMemberRoster() {
  return isNeonConfigured
    ? (await getHosted()).listMemberRoster()
    : (await getLocal()).listMemberRoster();
}

export async function createUser(
  input: Parameters<LocalModule["createUser"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).createUser(input)
    : (await getLocal()).createUser(input);
}

export async function upsertHostedUser(
  input: Parameters<LocalModule["upsertHostedUser"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).upsertHostedUser(input)
    : (await getLocal()).upsertHostedUser(input);
}

export async function updateUserProfile(
  userId: string,
  input: Parameters<LocalModule["updateUserProfile"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).updateUserProfile(userId, input)
    : (await getLocal()).updateUserProfile(userId, input);
}

export async function updateUserNewsletterSubscription(
  userId: string,
  input: Parameters<LocalModule["updateUserNewsletterSubscription"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).updateUserNewsletterSubscription(userId, input)
    : (await getLocal()).updateUserNewsletterSubscription(userId, input);
}

export async function updateUserMembership(
  userId: string,
  input: Parameters<LocalModule["updateUserMembership"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).updateUserMembership(userId, input)
    : (await getLocal()).updateUserMembership(userId, input);
}

export async function getLatestSupportPlanForUser(userId: string) {
  return isNeonConfigured
    ? (await getHosted()).getLatestSupportPlanForUser(userId)
    : (await getLocal()).getLatestSupportPlanForUser(userId);
}

export async function createSupportPlan(
  userId: string,
  input: Parameters<LocalModule["createSupportPlan"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).createSupportPlan(userId, input)
    : (await getLocal()).createSupportPlan(userId, input);
}

export async function updateSupportPlanStepStatus(
  stepId: string,
  status: Parameters<LocalModule["updateSupportPlanStepStatus"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).updateSupportPlanStepStatus(stepId, status)
    : (await getLocal()).updateSupportPlanStepStatus(stepId, status);
}

export async function markSupportPlanRecapSent(planId: string, sentAt?: string) {
  return isNeonConfigured
    ? (await getHosted()).markSupportPlanRecapSent(planId, sentAt)
    : (await getLocal()).markSupportPlanRecapSent(planId, sentAt);
}

export async function createSession(userId: string, expiresAt: string) {
  return isNeonConfigured
    ? (await getHosted()).createSession(userId, expiresAt)
    : (await getLocal()).createSession(userId, expiresAt);
}

export async function getSession(sessionId: string) {
  return isNeonConfigured
    ? (await getHosted()).getSession(sessionId)
    : (await getLocal()).getSession(sessionId);
}

export async function deleteSession(sessionId: string) {
  return isNeonConfigured
    ? (await getHosted()).deleteSession(sessionId)
    : (await getLocal()).deleteSession(sessionId);
}

export async function deleteSessionsForUser(userId: string) {
  return isNeonConfigured
    ? (await getHosted()).deleteSessionsForUser(userId)
    : (await getLocal()).deleteSessionsForUser(userId);
}

export async function deleteExpiredSessions() {
  return isNeonConfigured
    ? (await getHosted()).deleteExpiredSessions()
    : (await getLocal()).deleteExpiredSessions();
}

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: string,
) {
  return isNeonConfigured
    ? (await getHosted()).createPasswordResetToken(userId, tokenHash, expiresAt)
    : (await getLocal()).createPasswordResetToken(userId, tokenHash, expiresAt);
}

export async function getPasswordResetToken(tokenHash: string) {
  return isNeonConfigured
    ? (await getHosted()).getPasswordResetToken(tokenHash)
    : (await getLocal()).getPasswordResetToken(tokenHash);
}

export async function getLatestPasswordResetTokenForUser(userId: string) {
  return isNeonConfigured
    ? (await getHosted()).getLatestPasswordResetTokenForUser(userId)
    : (await getLocal()).getLatestPasswordResetTokenForUser(userId);
}

export async function markPasswordResetTokenUsed(tokenId: string) {
  return isNeonConfigured
    ? (await getHosted()).markPasswordResetTokenUsed(tokenId)
    : (await getLocal()).markPasswordResetTokenUsed(tokenId);
}

export async function deletePasswordResetTokensForUser(userId: string) {
  return isNeonConfigured
    ? (await getHosted()).deletePasswordResetTokensForUser(userId)
    : (await getLocal()).deletePasswordResetTokensForUser(userId);
}

export async function deleteExpiredPasswordResetTokens() {
  return isNeonConfigured
    ? (await getHosted()).deleteExpiredPasswordResetTokens()
    : (await getLocal()).deleteExpiredPasswordResetTokens();
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  return isNeonConfigured
    ? (await getHosted()).updateUserPassword(userId, passwordHash)
    : (await getLocal()).updateUserPassword(userId, passwordHash);
}

export async function listResources(userId?: string | null) {
  return isNeonConfigured
    ? (await getHosted()).listResources(userId)
    : (await getLocal()).listResources(userId);
}

export async function listSavedResources(userId: string) {
  return isNeonConfigured
    ? (await getHosted()).listSavedResources(userId)
    : (await getLocal()).listSavedResources(userId);
}

export async function toggleSavedResource(userId: string, resourceId: string) {
  return isNeonConfigured
    ? (await getHosted()).toggleSavedResource(userId, resourceId)
    : (await getLocal()).toggleSavedResource(userId, resourceId);
}

export async function listEvents() {
  return isNeonConfigured ? (await getHosted()).listEvents() : (await getLocal()).listEvents();
}

export async function listCommunityPosts(limit = 20) {
  return isNeonConfigured
    ? (await getHosted()).listCommunityPosts(limit)
    : (await getLocal()).listCommunityPosts(limit);
}

export async function getCommunityPostById(postId: string, includeHidden = false) {
  return isNeonConfigured
    ? (await getHosted()).getCommunityPostById(postId, includeHidden)
    : (await getLocal()).getCommunityPostById(postId, includeHidden);
}

export async function listCommunityReplies() {
  return isNeonConfigured
    ? (await getHosted()).listCommunityReplies()
    : (await getLocal()).listCommunityReplies();
}

export async function getCommunityReplyById(replyId: string, includeHidden = false) {
  return isNeonConfigured
    ? (await getHosted()).getCommunityReplyById(replyId, includeHidden)
    : (await getLocal()).getCommunityReplyById(replyId, includeHidden);
}

export async function createCommunityPost(
  input: Parameters<LocalModule["createCommunityPost"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).createCommunityPost(input)
    : (await getLocal()).createCommunityPost(input);
}

export async function createCommunityReply(
  input: Parameters<LocalModule["createCommunityReply"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).createCommunityReply(input)
    : (await getLocal()).createCommunityReply(input);
}

export async function listProfessionals(includeHidden = false) {
  return isNeonConfigured
    ? (await getHosted()).listProfessionals(includeHidden)
    : (await getLocal()).listProfessionals(includeHidden);
}

export async function getProfessionalById(
  professionalId: string,
  includeHidden = false,
) {
  return isNeonConfigured
    ? (await getHosted()).getProfessionalById(professionalId, includeHidden)
    : (await getLocal()).getProfessionalById(professionalId, includeHidden);
}

export async function createModerationReport(
  input: Parameters<LocalModule["createModerationReport"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).createModerationReport(input)
    : (await getLocal()).createModerationReport(input);
}

export async function listModerationReports() {
  return isNeonConfigured
    ? (await getHosted()).listModerationReports()
    : (await getLocal()).listModerationReports();
}

export async function listModerationMemberNotes() {
  return isNeonConfigured
    ? (await getHosted()).listModerationMemberNotes()
    : (await getLocal()).listModerationMemberNotes();
}

export async function upsertModerationMemberNote(
  input: Parameters<LocalModule["upsertModerationMemberNote"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).upsertModerationMemberNote(input)
    : (await getLocal()).upsertModerationMemberNote(input);
}

export async function listModerationEscalations() {
  return isNeonConfigured
    ? (await getHosted()).listModerationEscalations()
    : (await getLocal()).listModerationEscalations();
}

export async function createModerationEscalation(
  input: Parameters<LocalModule["createModerationEscalation"]>[0],
) {
  return isNeonConfigured
    ? (await getHosted()).createModerationEscalation(input)
    : (await getLocal()).createModerationEscalation(input);
}

export async function updateModerationReport(
  reportId: string,
  input: Parameters<LocalModule["updateModerationReport"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).updateModerationReport(reportId, input)
    : (await getLocal()).updateModerationReport(reportId, input);
}

export async function setCommunityPostHidden(postId: string, isHidden: boolean) {
  return isNeonConfigured
    ? (await getHosted()).setCommunityPostHidden(postId, isHidden)
    : (await getLocal()).setCommunityPostHidden(postId, isHidden);
}

export async function setCommunityReplyHidden(replyId: string, isHidden: boolean) {
  return isNeonConfigured
    ? (await getHosted()).setCommunityReplyHidden(replyId, isHidden)
    : (await getLocal()).setCommunityReplyHidden(replyId, isHidden);
}

export async function setProfessionalHidden(professionalId: string, isHidden: boolean) {
  return isNeonConfigured
    ? (await getHosted()).setProfessionalHidden(professionalId, isHidden)
    : (await getLocal()).setProfessionalHidden(professionalId, isHidden);
}

export async function updateProfessionalVerification(
  professionalId: string,
  input: Parameters<LocalModule["updateProfessionalVerification"]>[1],
) {
  return isNeonConfigured
    ? (await getHosted()).updateProfessionalVerification(professionalId, input)
    : (await getLocal()).updateProfessionalVerification(professionalId, input);
}

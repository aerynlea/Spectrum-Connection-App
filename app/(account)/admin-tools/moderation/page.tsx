import { unstable_noStore as noStore } from "next/cache";

import {
  lockAdminLookupAction,
  reviewModerationReportAction,
  saveModerationMemberNoteAction,
  updateProfessionalVerificationAction,
  unlockAdminLookupAction,
} from "@/app/actions";
import { AdminToolLinks } from "@/components/admin-tool-links";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import {
  hasAdminLookupAccess,
  isAdminLookupConfigured,
} from "@/lib/admin-access";
import type {
  ModerationActionTaken,
  ModerationEscalationRecord,
  ModerationMemberNoteRecord,
  ModerationReportRecord,
  ModerationReportStatus,
  ModerationSeverityLevel,
  TrustHistoryRecord,
} from "@/lib/app-types";
import {
  getCommunityPostById,
  getCommunityReplyById,
  getProfessionalById,
  listModerationEscalations,
  listModerationMemberNotes,
  listModerationReports,
  listProfessionals,
} from "@/lib/data";
import { formatDateTime } from "@/lib/formatters";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type ModerationPageProps = {
  searchParams?: PageSearchParams;
};

type ModerationTargetState = {
  exists: boolean;
  hidden: boolean;
};

type PrioritizedReport = {
  report: ModerationReportRecord;
  targetState: ModerationTargetState;
  severityLevel: ModerationSeverityLevel;
  severityScore: number;
  reviewCues: Array<{
    label: string;
    detail: string;
  }>;
};

type QueueSignal = {
  title: string;
  detail: string;
  severityLevel: ModerationSeverityLevel;
};

type AutomationSuggestion = {
  id: string;
  title: string;
  detail: string;
  recommendedAction: string;
  severityLevel: ModerationSeverityLevel;
};

function buildModerationSubjectKey(targetUserId: string | null, targetAuthor: string) {
  const authorKey = targetAuthor.trim().toLowerCase().replace(/\s+/g, " ");

  return targetUserId?.trim() || `author:${authorKey}`;
}

function formatStatus(status: ModerationReportStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "reviewed":
      return "Reviewed";
    case "resolved":
      return "Resolved";
    case "dismissed":
      return "Dismissed";
    default:
      return status;
  }
}

function formatAction(action: ModerationActionTaken) {
  switch (action) {
    case "none":
      return "No action yet";
    case "reviewed":
      return "Reviewed";
    case "hidden":
      return "Hidden from public pages";
    case "restored":
      return "Restored to public pages";
    case "dismissed":
      return "Dismissed";
    default:
      return action;
  }
}

function formatTargetType(targetType: ModerationReportRecord["targetType"]) {
  switch (targetType) {
    case "community-post":
      return "Community post";
    case "community-reply":
      return "Community reply";
    case "professional":
      return "Professional listing";
    default:
      return targetType;
  }
}

function formatVerificationStatus(status: string) {
  switch (status) {
    case "verified":
      return "Verified";
    case "review-in-progress":
      return "Review in progress";
    default:
      return "Community-shared";
  }
}

function formatSeverity(level: ModerationSeverityLevel) {
  switch (level) {
    case "critical":
      return "Critical";
    case "high":
      return "High priority";
    case "medium":
      return "Watch closely";
    default:
      return "Low priority";
  }
}

function groupEscalationsBySubject(escalations: ModerationEscalationRecord[]) {
  const entries = new Map<string, ModerationEscalationRecord[]>();

  for (const escalation of escalations) {
    const existing = entries.get(escalation.subjectKey);

    if (existing) {
      existing.push(escalation);
      continue;
    }

    entries.set(escalation.subjectKey, [escalation]);
  }

  return entries;
}

function scoreReason(reason: string) {
  switch (reason) {
    case "Misinformation or unsafe advice":
      return 4;
    case "Privacy concern":
      return 4;
    case "Unkind or harmful interaction":
      return 3;
    case "Spam or self-promotion":
      return 2;
    default:
      return 1;
  }
}

function severityFromScore(score: number): ModerationSeverityLevel {
  if (score >= 8) {
    return "critical";
  }

  if (score >= 6) {
    return "high";
  }

  if (score >= 3) {
    return "medium";
  }

  return "low";
}

function isRecent(timestamp: string, days: number) {
  return (
    Date.now() - new Date(timestamp).getTime() <=
    days * 24 * 60 * 60 * 1000
  );
}

function deriveTrustPriority(
  history: Omit<TrustHistoryRecord, "severityLevel" | "severityScore" | "reviewCues">,
  memberNote: ModerationMemberNoteRecord | undefined,
  historyEscalations: ModerationEscalationRecord[],
) {
  const reviewCues: TrustHistoryRecord["reviewCues"] = [];
  let score = 0;

  if (history.openReports > 1) {
    score += 4;
    reviewCues.push({
      label: "Multiple open reports",
      detail: `${history.openReports} reports are still waiting for review.`,
    });
  } else if (history.openReports === 1) {
    score += 2;
    reviewCues.push({
      label: "Open concern still active",
      detail: "There is still an unresolved report tied to this member.",
    });
  }

  if (history.hiddenActions > 0) {
    score += 2;
    reviewCues.push({
      label: "Content has been hidden before",
      detail: `${history.hiddenActions} moderation action${
        history.hiddenActions === 1 ? "" : "s"
      } led to content being hidden.`,
    });
  }

  if (history.totalReports >= 3) {
    score += 2;
    reviewCues.push({
      label: "Repeat concern pattern",
      detail: `${history.totalReports} total reports have been filed for this member or profile name.`,
    });
  }

  const recentEscalationCount = historyEscalations.filter((event) =>
    isRecent(event.createdAt, 14),
  ).length;

  if (recentEscalationCount >= 3) {
    score += 2;
    reviewCues.push({
      label: "Several recent moderation events",
      detail: `${recentEscalationCount} moderation events happened in the last two weeks.`,
    });
  }

  if (isRecent(history.lastReportedAt, 7)) {
    score += 1;
    reviewCues.push({
      label: "Reported recently",
      detail: "The newest concern came in within the last week.",
    });
  }

  if (memberNote?.note) {
    score += 1;
    reviewCues.push({
      label: "Member note on file",
      detail: "A persistent moderation note already exists for this person.",
    });
  }

  return {
    severityScore: score,
    severityLevel: severityFromScore(score),
    reviewCues,
  };
}

function buildTrustHistory(
  reports: ModerationReportRecord[],
  memberNoteMap: Map<string, ModerationMemberNoteRecord>,
  escalationMap: Map<string, ModerationEscalationRecord[]>,
): TrustHistoryRecord[] {
  const summaries = new Map<string, TrustHistoryRecord>();

  for (const report of reports) {
    if (report.targetType === "professional") {
      continue;
    }

    const key = buildModerationSubjectKey(report.targetUserId, report.targetAuthor);
    const existing = summaries.get(key);

    if (existing) {
      existing.totalReports += 1;
      existing.openReports += report.status === "open" ? 1 : 0;
      existing.resolvedReports += report.status === "resolved" ? 1 : 0;
      existing.hiddenActions += report.actionTaken === "hidden" ? 1 : 0;
      existing.dismissedReports += report.status === "dismissed" ? 1 : 0;
      if (new Date(report.createdAt) > new Date(existing.lastReportedAt)) {
        existing.lastReportedAt = report.createdAt;
      }
      if (
        report.reviewedAt &&
        (!existing.lastReviewedAt ||
          new Date(report.reviewedAt) > new Date(existing.lastReviewedAt))
      ) {
        existing.lastReviewedAt = report.reviewedAt;
      }
      continue;
    }

    summaries.set(key, {
      key,
      targetUserId: report.targetUserId,
      targetAuthor: report.targetAuthor,
      totalReports: 1,
      openReports: report.status === "open" ? 1 : 0,
      resolvedReports: report.status === "resolved" ? 1 : 0,
      hiddenActions: report.actionTaken === "hidden" ? 1 : 0,
      dismissedReports: report.status === "dismissed" ? 1 : 0,
      lastReportedAt: report.createdAt,
      lastReviewedAt: report.reviewedAt,
      severityLevel: "low",
      severityScore: 0,
      reviewCues: [],
    });
  }

  return Array.from(summaries.values())
    .map((history) => {
      const priority = deriveTrustPriority(
        history,
        memberNoteMap.get(history.key),
        escalationMap.get(history.key) ?? [],
      );

      return {
        ...history,
        severityLevel: priority.severityLevel,
        severityScore: priority.severityScore,
        reviewCues: priority.reviewCues,
      };
    })
    .sort((left, right) => {
      if (right.severityScore !== left.severityScore) {
        return right.severityScore - left.severityScore;
      }

      if (right.openReports !== left.openReports) {
        return right.openReports - left.openReports;
      }

      return (
        new Date(right.lastReportedAt).getTime() -
        new Date(left.lastReportedAt).getTime()
      );
    });
}

function buildReportPriority(
  report: ModerationReportRecord,
  targetState: ModerationTargetState,
  history: TrustHistoryRecord | undefined,
  memberNote: ModerationMemberNoteRecord | undefined,
  historyEscalations: ModerationEscalationRecord[],
): PrioritizedReport {
  const reviewCues: PrioritizedReport["reviewCues"] = [];
  let score = scoreReason(report.reason);

  if (report.status === "open") {
    score += 1;
    reviewCues.push({
      label: "Still open",
      detail: "This report has not been fully resolved yet.",
    });
  }

  if (history) {
    score += Math.min(history.severityScore, 4);

    if (history.totalReports >= 3) {
      reviewCues.push({
        label: "Repeat concern pattern",
        detail: `${history.totalReports} total reports are tied to this member or author.`,
      });
    }

    if (history.hiddenActions > 0) {
      reviewCues.push({
        label: "Previously hidden content",
        detail: "At least one earlier moderation action already hid content from public view.",
      });
    }
  }

  if (memberNote?.note) {
    score += 1;
    reviewCues.push({
      label: "Member note on file",
      detail: "A persistent moderator note already exists for this person.",
    });
  }

  const recentEscalationCount = historyEscalations.filter((event) =>
    isRecent(event.createdAt, 14),
  ).length;

  if (recentEscalationCount >= 3) {
    score += 1;
    reviewCues.push({
      label: "Recent moderation activity",
      detail: `${recentEscalationCount} moderation events happened in the last two weeks.`,
    });
  }

  if (!targetState.exists) {
    reviewCues.push({
      label: "Original item is missing",
      detail: "The original content is gone, so review any context with extra care.",
    });
  } else if (targetState.hidden) {
    reviewCues.push({
      label: "Already hidden",
      detail: "The content is already hidden while this report stays on record.",
    });
  }

  return {
    report,
    targetState,
    severityScore: score,
    severityLevel: severityFromScore(score),
    reviewCues,
  };
}

function buildQueueSignals(
  prioritizedReports: PrioritizedReport[],
  trustHistory: TrustHistoryRecord[],
): QueueSignal[] {
  const signals: QueueSignal[] = [];
  const highestOpenReport = prioritizedReports.find(
    (entry) =>
      entry.report.status === "open" &&
      (entry.severityLevel === "critical" || entry.severityLevel === "high"),
  );

  if (highestOpenReport) {
    signals.push({
      title: `${formatSeverity(highestOpenReport.severityLevel)} report waiting`,
      detail: `${highestOpenReport.report.targetAuthor} was flagged for ${highestOpenReport.report.reason.toLowerCase()}.`,
      severityLevel: highestOpenReport.severityLevel,
    });
  }

  const highestRiskMember = trustHistory.find(
    (entry) =>
      entry.severityLevel === "critical" || entry.severityLevel === "high",
  );

  if (highestRiskMember) {
    signals.push({
      title: "Repeat pattern needs follow-up",
      detail: `${highestRiskMember.targetAuthor} has ${highestRiskMember.totalReports} total reports and ${highestRiskMember.openReports} still open.`,
      severityLevel: highestRiskMember.severityLevel,
    });
  }

  const hiddenPattern = trustHistory.find((entry) => entry.hiddenActions > 0);

  if (hiddenPattern) {
    signals.push({
      title: "Past hidden-content history",
      detail: `${hiddenPattern.targetAuthor} has ${hiddenPattern.hiddenActions} hidden-content action${
        hiddenPattern.hiddenActions === 1 ? "" : "s"
      } on record.`,
      severityLevel:
        hiddenPattern.hiddenActions > 1 ? "high" : "medium",
    });
  }

  return signals.slice(0, 3);
}

function buildAutomationSuggestions(
  prioritizedReports: PrioritizedReport[],
  trustHistory: TrustHistoryRecord[],
  memberNoteMap: Map<string, ModerationMemberNoteRecord>,
): AutomationSuggestion[] {
  const suggestions: AutomationSuggestion[] = [];
  const urgentWindowReports = prioritizedReports.filter(
    (entry) =>
      entry.report.status === "open" &&
      (entry.severityLevel === "critical" || entry.severityLevel === "high") &&
      isRecent(entry.report.createdAt, 3),
  );

  if (urgentWindowReports.length >= 2) {
    suggestions.push({
      id: "digest-cluster",
      title: "Moderator digest recommended",
      detail: `${urgentWindowReports.length} high-priority reports were filed in the last 72 hours, which is a strong signal to review them together.`,
      recommendedAction:
        "Start with the newest critical report, then review the other high-priority reports in the same session so no pattern gets missed.",
      severityLevel: "critical",
    });
  }

  const privacyOrSafetyReport = urgentWindowReports.find(
    (entry) =>
      entry.report.reason === "Privacy concern" ||
      entry.report.reason === "Misinformation or unsafe advice",
  );

  if (privacyOrSafetyReport) {
    suggestions.push({
      id: `priority-${privacyOrSafetyReport.report.id}`,
      title: "Immediate safety-style follow-up suggested",
      detail: `${privacyOrSafetyReport.report.targetAuthor} has an open ${privacyOrSafetyReport.report.reason.toLowerCase()} report that already scored ${formatSeverity(
        privacyOrSafetyReport.severityLevel,
      ).toLowerCase()}.`,
      recommendedAction:
        "Review the report details first, then decide whether the content should stay visible while the conversation is reviewed.",
      severityLevel: privacyOrSafetyReport.severityLevel,
    });
  }

  const followUpMember = trustHistory.find(
    (entry) =>
      (entry.severityLevel === "critical" || entry.severityLevel === "high") &&
      !memberNoteMap.get(entry.key)?.note,
  );

  if (followUpMember) {
    suggestions.push({
      id: `note-${followUpMember.key}`,
      title: "Save a member follow-up note",
      detail: `${followUpMember.targetAuthor} has repeat or high-risk concerns but no persistent member-level moderation note yet.`,
      recommendedAction:
        "Add a short member note after review so future moderators have context without re-reading the full history from scratch.",
      severityLevel: followUpMember.severityLevel,
    });
  }

  const unresolvedCluster = trustHistory.find(
    (entry) => entry.openReports >= 2 && isRecent(entry.lastReportedAt, 7),
  );

  if (unresolvedCluster) {
    suggestions.push({
      id: `cluster-${unresolvedCluster.key}`,
      title: "Repeat unresolved concerns need follow-up",
      detail: `${unresolvedCluster.targetAuthor} has ${unresolvedCluster.openReports} open reports and was reported again within the last week.`,
      recommendedAction:
        "Review the open reports together and decide whether one coordinated action or moderator note would make the pattern easier to manage going forward.",
      severityLevel: unresolvedCluster.severityLevel,
    });
  }

  return suggestions.slice(0, 4);
}

function describeTrustHistory(history: TrustHistoryRecord) {
  if (history.severityLevel === "critical") {
    return "Priority follow-up";
  }

  if (history.severityLevel === "high") {
    return "Needs close review";
  }

  if (history.openReports > 0) {
    return "Needs attention";
  }

  if (history.hiddenActions > 0) {
    return "Previously moderated";
  }

  return "Reviewed history";
}

function describeEscalationEvent(event: ModerationEscalationRecord) {
  switch (event.eventType) {
    case "report-filed":
      return "Community report filed";
    case "reviewed":
      return "Report reviewed";
    case "hidden":
      return "Content hidden";
    case "restored":
      return "Content restored";
    case "dismissed":
      return "Report dismissed";
    case "member-note-updated":
      return event.note ? "Member note updated" : "Member note cleared";
    default:
      return event.eventType;
  }
}

function describeEscalationContext(event: ModerationEscalationRecord) {
  if (event.eventType === "member-note-updated") {
    return event.note || "No persistent member note is on file right now.";
  }

  if (event.note) {
    return event.note;
  }

  if (event.reason) {
    return `Reason: ${event.reason}`;
  }

  return "No additional context was added.";
}

async function getTargetState(report: ModerationReportRecord): Promise<ModerationTargetState> {
  if (report.targetType === "community-post") {
    const target = await getCommunityPostById(report.targetId, true);
    return { exists: Boolean(target), hidden: Boolean(target?.isHidden) };
  }

  if (report.targetType === "community-reply") {
    const target = await getCommunityReplyById(report.targetId, true);
    return { exists: Boolean(target), hidden: Boolean(target?.isHidden) };
  }

  const target = await getProfessionalById(report.targetId, true);
  return { exists: Boolean(target), hidden: Boolean(target?.isHidden) };
}

export default async function ModerationPage({
  searchParams,
}: ModerationPageProps) {
  noStore();

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const isConfigured = isAdminLookupConfigured();
  const hasAccess = isConfigured ? await hasAdminLookupAccess() : false;
  const reports = hasAccess ? await listModerationReports() : [];
  const memberNotes = hasAccess ? await listModerationMemberNotes() : [];
  const escalations = hasAccess ? await listModerationEscalations() : [];
  const professionals = hasAccess ? await listProfessionals(true) : [];
  const memberNoteMap = new Map<string, ModerationMemberNoteRecord>(
    memberNotes.map((note) => [note.subjectKey, note]),
  );
  const escalationMap = groupEscalationsBySubject(escalations);
  const trustHistory = hasAccess
    ? buildTrustHistory(reports, memberNoteMap, escalationMap)
    : [];
  const reportsWithState = hasAccess
    ? await Promise.all(
        reports.map(async (report) => ({
          report,
          targetState: await getTargetState(report),
        })),
      )
    : [];
  const prioritizedReports = reportsWithState
    .map(({ report, targetState }) => {
      const subjectKey =
        report.targetType === "professional"
          ? null
          : buildModerationSubjectKey(report.targetUserId, report.targetAuthor);

      return buildReportPriority(
        report,
        targetState,
        subjectKey
          ? trustHistory.find((history) => history.key === subjectKey)
          : undefined,
        subjectKey ? memberNoteMap.get(subjectKey) : undefined,
        subjectKey ? escalationMap.get(subjectKey) ?? [] : [],
      );
    })
    .sort((left, right) => {
      if (left.report.status !== right.report.status) {
        if (left.report.status === "open") {
          return -1;
        }
        if (right.report.status === "open") {
          return 1;
        }
      }

      if (right.severityScore !== left.severityScore) {
        return right.severityScore - left.severityScore;
      }

      return (
        new Date(right.report.createdAt).getTime() -
        new Date(left.report.createdAt).getTime()
      );
    });
  const queueSignals = buildQueueSignals(prioritizedReports, trustHistory);
  const automationSuggestions = buildAutomationSuggestions(
    prioritizedReports,
    trustHistory,
    memberNoteMap,
  );
  const highPriorityReportCount = prioritizedReports.filter(
    (entry) =>
      entry.severityLevel === "critical" || entry.severityLevel === "high",
  ).length;
  const highRiskMemberCount = trustHistory.filter(
    (entry) =>
      entry.severityLevel === "critical" || entry.severityLevel === "high",
  ).length;
  const counts = reports.reduce(
    (summary, report) => {
      summary.total += 1;
      summary[report.status] += 1;
      return summary;
    },
    { total: 0, open: 0, reviewed: 0, resolved: 0, dismissed: 0 },
  );

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Private admin tool</p>
        <h1>Review community concerns, trust flags, and profile reports in one place.</h1>
        <p className="hero-lead">
          This moderation queue helps you review reports with care, hide content
          when needed, and restore items when context shows they are safe.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      {!isConfigured ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Not enabled yet"
              intro="This admin helper goes live once the private lookup key is connected in the environment."
              title="The moderation queue is not live yet."
            />
            <div className="feature-card">
              <p>
                Add <code>ADMIN_LOOKUP_KEY</code> in Vercel to unlock the private
                moderation queue.
              </p>
            </div>
          </div>
        </section>
      ) : !hasAccess ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Private access"
              intro="Use the same admin lookup key to open the moderation queue for this session."
              title="Unlock the moderation queue."
            />
            <form action={unlockAdminLookupAction} className="form-card">
              <input name="returnTo" type="hidden" value="/admin-tools/moderation" />
              <label className="field">
                <span>Lookup key</span>
                <input
                  autoComplete="off"
                  name="key"
                  placeholder="Enter the admin key"
                  required
                  type="password"
                />
              </label>
              <button className="button-primary" type="submit">
                Unlock moderation
              </button>
            </form>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="How this works"
              intro="Reports stay private, and every action is meant to balance safety, dignity, and context."
              title="What the moderation queue is for."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Review the concern</h3>
                  <p>See the reported reason, the original excerpt, and the person who flagged it.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Choose the least disruptive action</h3>
                  <p>Mark it reviewed, hide it from public view, restore it, or dismiss it.</p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Keep trust visible</h3>
                  <p>Reported items are reviewed privately so the public experience stays calmer and safer.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="section split-layout">
            <div className="section-panel">
              <SectionHeading
                eyebrow="Queue snapshot"
                intro="See what still needs attention and what has already been handled."
                title="A quick view of the moderation queue."
              />
              <div className="stats-grid">
                <article className="stat-card">
                  <strong>{counts.total}</strong>
                  <span>Total reports</span>
                </article>
                <article className="stat-card">
                  <strong>{counts.open}</strong>
                  <span>Open</span>
                </article>
                <article className="stat-card">
                  <strong>{counts.reviewed}</strong>
                  <span>Reviewed</span>
                </article>
                <article className="stat-card">
                  <strong>{counts.resolved}</strong>
                  <span>Resolved</span>
                </article>
                <article className="stat-card">
                  <strong>{highPriorityReportCount}</strong>
                  <span>High-priority reports</span>
                </article>
                <article className="stat-card">
                  <strong>{highRiskMemberCount}</strong>
                  <span>Members needing follow-up</span>
                </article>
              </div>
              <AdminToolLinks active="moderation" />
              <div className="button-row">
                <form action={lockAdminLookupAction}>
                  <input name="returnTo" type="hidden" value="/admin-tools/moderation" />
                  <button className="button-secondary" type="submit">
                    Lock tool
                  </button>
                </form>
              </div>
            </div>

            <div className="section-panel section-panel--accent">
              <SectionHeading
                eyebrow="Automatic review cues"
                intro="Severity and pattern matching now help the queue surface what is most urgent first."
                title="What needs your attention first."
              />
              {queueSignals.length > 0 ? (
                <div className="stack-list">
                  {queueSignals.map((signal) => (
                    <article className="feature-card feature-card--flat" key={signal.title}>
                      <div className="thread-card__meta">
                        <div>
                          <h3>{signal.title}</h3>
                        </div>
                        <span className={`status-chip status-chip--${signal.severityLevel}`}>
                          {formatSeverity(signal.severityLevel)}
                        </span>
                      </div>
                      <p>{signal.detail}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Automatic cues will appear here as reports and moderation events build over time.</p>
                </div>
              )}
            </div>
          </section>

          <section className="section">
            <SectionHeading
              eyebrow="Automation suggestions"
              intro="These are smart follow-up prompts based on recent clusters, repeat patterns, and higher-risk report reasons."
              title="Suggested moderator next steps."
            />
            {automationSuggestions.length > 0 ? (
              <div className="stack-list">
                {automationSuggestions.map((suggestion) => (
                  <article className="thread-card" key={suggestion.id}>
                    <div className="thread-card__meta">
                      <div>
                        <h3>{suggestion.title}</h3>
                      </div>
                      <span
                        className={`status-chip status-chip--${suggestion.severityLevel}`}
                      >
                        {formatSeverity(suggestion.severityLevel)}
                      </span>
                    </div>
                    <p>{suggestion.detail}</p>
                    <p className="meta-copy">
                      <strong>Suggested action:</strong> {suggestion.recommendedAction}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  Automation suggestions will show up here when the queue starts to
                  detect repeat patterns or urgent clusters.
                </p>
              </div>
            )}
          </section>

          <section className="section">
            <SectionHeading
              eyebrow="Reported items"
              intro="Each report includes the original excerpt and the action history so you can respond with context."
              title="Moderation decisions in one queue."
            />
            {reportsWithState.length > 0 ? (
              <div className="stack-list">
                {prioritizedReports.map((priority) => (
                  (() => {
                    const { report, targetState } = priority;
                    const subjectKey =
                      report.targetType === "professional"
                        ? null
                        : buildModerationSubjectKey(
                            report.targetUserId,
                            report.targetAuthor,
                          );
                    const memberNote = subjectKey
                      ? memberNoteMap.get(subjectKey)
                      : undefined;
                    const escalationCount = subjectKey
                      ? escalationMap.get(subjectKey)?.length ?? 0
                      : 0;

                    return (
                      <article className="thread-card" key={report.id}>
                        <div className="thread-card__meta">
                          <div>
                            <h3>{report.targetLabel}</h3>
                            <p>
                              {formatTargetType(report.targetType)} • {report.targetAuthor}
                            </p>
                          </div>
                          <div className="pill-list pill-list--compact">
                            <span className={`status-chip status-chip--${report.status}`}>
                              {formatStatus(report.status)}
                            </span>
                            <span
                              className={`status-chip status-chip--${priority.severityLevel}`}
                            >
                              {formatSeverity(priority.severityLevel)}
                            </span>
                          </div>
                        </div>
                        <p className="feature-label">
                          Reported by {report.reporterName} • {formatDateTime(report.createdAt)}
                        </p>
                        <p><strong>Reason:</strong> {report.reason}</p>
                        {report.details ? <p><strong>Context:</strong> {report.details}</p> : null}
                        {report.moderatorNote ? (
                          <p><strong>Moderator note:</strong> {report.moderatorNote}</p>
                        ) : null}
                        {memberNote ? (
                          <p>
                            <strong>Member note on file:</strong> {memberNote.note}
                          </p>
                        ) : null}
                        <p className="meta-copy">{report.targetExcerpt}</p>
                        <div className="pill-list pill-list--compact">
                          <span className="pill">
                            {targetState.exists
                              ? targetState.hidden
                                ? "Currently hidden"
                                : "Currently visible"
                              : "Original item missing"}
                          </span>
                          <span className="pill">{formatAction(report.actionTaken)}</span>
                          {escalationCount > 0 ? (
                            <span className="pill">
                              {escalationCount} escalation
                              {escalationCount === 1 ? "" : "s"}
                            </span>
                          ) : null}
                          {report.reviewedAt ? (
                            <span className="pill">
                              Reviewed {formatDateTime(report.reviewedAt)}
                            </span>
                          ) : null}
                        </div>
                        {priority.reviewCues.length > 0 ? (
                          <div className="pill-list pill-list--compact">
                            {priority.reviewCues.slice(0, 4).map((cue) => (
                              <span className="pill" key={cue.label}>
                                {cue.label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <form action={reviewModerationReportAction} className="form-card">
                          <input name="reportId" type="hidden" value={report.id} />
                          <input name="targetId" type="hidden" value={report.targetId} />
                          <input name="targetType" type="hidden" value={report.targetType} />
                          <input
                            name="targetUserId"
                            type="hidden"
                            value={report.targetUserId ?? ""}
                          />
                          <input
                            name="targetAuthor"
                            type="hidden"
                            value={report.targetAuthor}
                          />
                          <input
                            name="reportReason"
                            type="hidden"
                            value={report.reason}
                          />
                          <label className="field">
                            <span>Moderator note</span>
                            <textarea
                              defaultValue={report.moderatorNote}
                              name="moderatorNote"
                              placeholder="Add the context behind this decision."
                              rows={3}
                            />
                          </label>
                          <div className="button-row">
                            <button
                              className="button-secondary"
                              name="intent"
                              type="submit"
                              value="review"
                            >
                              Mark reviewed
                            </button>
                            {targetState.hidden ? (
                              <button
                                className="button-secondary"
                                name="intent"
                                type="submit"
                                value="restore"
                              >
                                Restore content
                              </button>
                            ) : (
                              <button
                                className="button-primary"
                                name="intent"
                                type="submit"
                                value="hide"
                              >
                                Hide from public view
                              </button>
                            )}
                            <button
                              className="button-secondary"
                              name="intent"
                              type="submit"
                              value="dismiss"
                            >
                              Dismiss report
                            </button>
                          </div>
                        </form>
                      </article>
                    );
                  })()
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No reports are waiting right now.</p>
              </div>
            )}
          </section>

          <section className="section split-layout">
            <div className="section-panel">
              <SectionHeading
                eyebrow="Trust history"
                intro="See whether a community member has previous reports, open concerns, or a history that has already been resolved."
                title="Community trust history at a glance."
              />
              {trustHistory.length > 0 ? (
                <div className="stack-list">
                  {trustHistory.map((history) => (
                    (() => {
                      const noteRecord = memberNoteMap.get(history.key);
                      const historyEscalations =
                        escalationMap.get(history.key)?.slice(0, 4) ?? [];

                      return (
                        <article className="thread-card" key={history.key}>
                          <div className="thread-card__meta">
                            <div>
                              <h3>{history.targetAuthor}</h3>
                              <p>
                                {history.targetUserId
                                  ? "Signed-in member"
                                  : "Name-only history from a seeded or legacy post"}
                              </p>
                            </div>
                            <div className="pill-list pill-list--compact">
                              <span
                                className={`status-chip status-chip--${
                                  history.openReports > 0 ? "open" : "reviewed"
                                }`}
                              >
                                {describeTrustHistory(history)}
                              </span>
                              <span
                                className={`status-chip status-chip--${history.severityLevel}`}
                              >
                                {formatSeverity(history.severityLevel)}
                              </span>
                            </div>
                          </div>
                          <div className="pill-list pill-list--compact">
                            <span className="pill">{history.totalReports} total reports</span>
                            <span className="pill">{history.openReports} open</span>
                            <span className="pill">{history.resolvedReports} resolved</span>
                            <span className="pill">{history.hiddenActions} hidden actions</span>
                            <span className="pill">
                              Severity score {history.severityScore}
                            </span>
                            <span className="pill">
                              {historyEscalations.length} recent event
                              {historyEscalations.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <p className="meta-copy">
                            Last reported {formatDateTime(history.lastReportedAt)}
                            {history.lastReviewedAt
                              ? ` • Last reviewed ${formatDateTime(history.lastReviewedAt)}`
                              : ""}
                          </p>
                          {history.reviewCues.length > 0 ? (
                            <div className="pill-list pill-list--compact">
                              {history.reviewCues.map((cue) => (
                                <span className="pill" key={cue.label}>
                                  {cue.label}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <form action={saveModerationMemberNoteAction} className="form-card">
                            <input name="subjectKey" type="hidden" value={history.key} />
                            <input
                              name="targetUserId"
                              type="hidden"
                              value={history.targetUserId ?? ""}
                            />
                            <input
                              name="targetAuthor"
                              type="hidden"
                              value={history.targetAuthor}
                            />
                            <label className="field">
                              <span>Member-level moderation note</span>
                              <textarea
                                defaultValue={noteRecord?.note ?? ""}
                                name="note"
                                placeholder="Save a persistent note about repeat concerns, context, or what should be watched next."
                                rows={3}
                              />
                            </label>
                            <div className="button-row">
                              <button className="button-secondary" type="submit">
                                Save member note
                              </button>
                            </div>
                          </form>
                          {noteRecord ? (
                            <p className="meta-copy">
                              Member note updated {formatDateTime(noteRecord.updatedAt)}
                            </p>
                          ) : (
                            <p className="meta-copy">
                              No persistent member note has been saved yet.
                            </p>
                          )}
                          {historyEscalations.length > 0 ? (
                            <div className="stack-list">
                              {historyEscalations.map((event) => (
                                <article
                                  className="feature-card feature-card--flat"
                                  key={event.id}
                                >
                                  <div className="thread-card__meta">
                                    <div>
                                      <h3>{describeEscalationEvent(event)}</h3>
                                      <p>{formatDateTime(event.createdAt)}</p>
                                    </div>
                                    {event.reason ? (
                                      <span className="pill">{event.reason}</span>
                                    ) : null}
                                  </div>
                                  <p>{describeEscalationContext(event)}</p>
                                </article>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      );
                    })()
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Trust history will appear here as community reports come in.</p>
                </div>
              )}
            </div>

            <div className="section-panel section-panel--accent">
              <SectionHeading
                eyebrow="Professional workflow"
                intro="Review each listing as verified, in progress, or community-shared, and leave a note that explains the current trust state."
                title="Manage professional verification."
              />
              {professionals.length > 0 ? (
                <div className="stack-list">
                  {professionals.map((professional) => (
                    <article className="thread-card" key={professional.id}>
                      <div className="thread-card__meta">
                        <div>
                          <h3>{professional.name}</h3>
                          <p>
                            {professional.title} • {professional.organization}
                          </p>
                        </div>
                        <span
                          className={`status-chip status-chip--${
                            professional.verificationStatus === "verified"
                              ? "resolved"
                              : professional.verificationStatus === "review-in-progress"
                                ? "reviewed"
                                : "dismissed"
                          }`}
                        >
                          {formatVerificationStatus(professional.verificationStatus)}
                        </span>
                      </div>
                      <p>{professional.summary}</p>
                      <p className="meta-copy">
                        {professional.location}
                        {professional.verificationUpdatedAt
                          ? ` • Updated ${formatDateTime(
                              professional.verificationUpdatedAt,
                            )}`
                          : ""}
                      </p>
                      <div className="pill-list pill-list--compact">
                        <span className="pill">
                          {professional.acceptingNewFamilies
                            ? "Accepting families"
                            : "Waitlist"}
                        </span>
                        <span className="pill">
                          {professional.isHidden ? "Hidden from public view" : "Visible publicly"}
                        </span>
                      </div>
                      <form
                        action={updateProfessionalVerificationAction}
                        className="form-card"
                      >
                        <input
                          name="professionalId"
                          type="hidden"
                          value={professional.id}
                        />
                        <label className="field">
                          <span>Verification note</span>
                          <textarea
                            defaultValue={professional.verificationNote}
                            name="verificationNote"
                            placeholder="Describe what has been reviewed or what is still pending."
                            rows={3}
                          />
                        </label>
                        <div className="button-row">
                          <button
                            className="button-secondary"
                            name="verificationStatus"
                            type="submit"
                            value="community-shared"
                          >
                            Keep community-shared
                          </button>
                          <button
                            className="button-secondary"
                            name="verificationStatus"
                            type="submit"
                            value="review-in-progress"
                          >
                            Mark review in progress
                          </button>
                          <button
                            className="button-primary"
                            name="verificationStatus"
                            type="submit"
                            value="verified"
                          >
                            Mark verified
                          </button>
                        </div>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Professional listings will appear here when they are available.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

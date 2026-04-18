import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import {
  lockAdminLookupAction,
  reviewModerationReportAction,
  saveModerationMemberNoteAction,
  updateProfessionalVerificationAction,
  unlockAdminLookupAction,
} from "@/app/actions";
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

function buildTrustHistory(reports: ModerationReportRecord[]): TrustHistoryRecord[] {
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
    });
  }

  return Array.from(summaries.values()).sort((left, right) => {
    if (right.openReports !== left.openReports) {
      return right.openReports - left.openReports;
    }

    return (
      new Date(right.lastReportedAt).getTime() -
      new Date(left.lastReportedAt).getTime()
    );
  });
}

function describeTrustHistory(history: TrustHistoryRecord) {
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
  const trustHistory = hasAccess ? buildTrustHistory(reports) : [];
  const memberNotes = hasAccess ? await listModerationMemberNotes() : [];
  const escalations = hasAccess ? await listModerationEscalations() : [];
  const professionals = hasAccess ? await listProfessionals(true) : [];
  const memberNoteMap = new Map<string, ModerationMemberNoteRecord>(
    memberNotes.map((note) => [note.subjectKey, note]),
  );
  const escalationMap = groupEscalationsBySubject(escalations);
  const reportsWithState = hasAccess
    ? await Promise.all(
        reports.map(async (report) => ({
          report,
          targetState: await getTargetState(report),
        })),
      )
    : [];
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
              </div>
              <div className="button-row">
                <Link className="button-secondary" href="/admin-tools/email-lookup">
                  Open email lookup
                </Link>
                <form action={lockAdminLookupAction}>
                  <button className="button-secondary" type="submit">
                    Lock tool
                  </button>
                </form>
              </div>
            </div>

            <div className="section-panel section-panel--accent">
              <SectionHeading
                eyebrow="Trust controls"
                intro="Every action here should be easy to understand later."
                title="Review with calm, visible judgment."
              />
              <div className="support-steps">
                <article className="support-step">
                  <span>01</span>
                  <div>
                    <h3>Open reports first</h3>
                    <p>Start with fresh concerns before revisiting already-reviewed items.</p>
                  </div>
                </article>
                <article className="support-step">
                  <span>02</span>
                  <div>
                    <h3>Use hidden only when needed</h3>
                    <p>Hide content when it risks harm, misinformation, or privacy problems.</p>
                  </div>
                </article>
                <article className="support-step">
                  <span>03</span>
                  <div>
                    <h3>Restore with confidence</h3>
                    <p>Bring content back when context shows it can stay up safely.</p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="section">
            <SectionHeading
              eyebrow="Reported items"
              intro="Each report includes the original excerpt and the action history so you can respond with context."
              title="Moderation decisions in one queue."
            />
            {reportsWithState.length > 0 ? (
              <div className="stack-list">
                {reportsWithState.map(({ report, targetState }) => (
                  (() => {
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
                          <span className={`status-chip status-chip--${report.status}`}>
                            {formatStatus(report.status)}
                          </span>
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
                            <span
                              className={`status-chip status-chip--${
                                history.openReports > 0 ? "open" : "reviewed"
                              }`}
                            >
                              {describeTrustHistory(history)}
                            </span>
                          </div>
                          <div className="pill-list pill-list--compact">
                            <span className="pill">{history.totalReports} total reports</span>
                            <span className="pill">{history.openReports} open</span>
                            <span className="pill">{history.resolvedReports} resolved</span>
                            <span className="pill">{history.hiddenActions} hidden actions</span>
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

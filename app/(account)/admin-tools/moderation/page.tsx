import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import {
  lockAdminLookupAction,
  reviewModerationReportAction,
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
  ModerationReportRecord,
  ModerationReportStatus,
} from "@/lib/app-types";
import {
  getCommunityPostById,
  getCommunityReplyById,
  getProfessionalById,
  listModerationReports,
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
                    </div>
                    <form action={reviewModerationReportAction} className="form-card">
                      <input name="reportId" type="hidden" value={report.id} />
                      <input name="targetId" type="hidden" value={report.targetId} />
                      <input name="targetType" type="hidden" value={report.targetType} />
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
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No reports are waiting right now.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

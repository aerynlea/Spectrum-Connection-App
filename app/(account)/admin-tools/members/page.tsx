import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import {
  lockAdminLookupAction,
  sendNewsletterAction,
  unlockAdminLookupAction,
} from "@/app/actions";
import { AdminToolLinks } from "@/components/admin-tool-links";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import {
  hasAdminLookupAccess,
  isAdminLookupConfigured,
} from "@/lib/admin-access";
import { listMemberRoster } from "@/lib/data";
import { isNewsletterEmailConfigured } from "@/lib/email";
import { getNewsletterPostalAddress } from "@/lib/newsletter";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type MemberRosterPageProps = {
  searchParams?: PageSearchParams;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function countRecentSignups(
  entries: Array<{ createdAt: string }>,
  days: number,
) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;

  return entries.filter(
    (entry) => new Date(entry.createdAt).getTime() >= threshold,
  ).length;
}

export default async function MemberRosterPage({
  searchParams,
}: MemberRosterPageProps) {
  noStore();

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const isConfigured = isAdminLookupConfigured();
  const hasAccess = isConfigured ? await hasAdminLookupAccess() : false;
  const roster = hasAccess ? await listMemberRoster() : [];
  const newsletterSubscribers = roster.filter(
    (entry) => entry.newsletterSubscribed,
  );
  const recentSignupCount = countRecentSignups(roster, 30);
  const newestSignupDate = roster[0]?.createdAt ?? null;
  const newsletterSendingReady =
    isNewsletterEmailConfigured() && Boolean(getNewsletterPostalAddress());

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Private admin tool</p>
        <h1>Track new member registrations in one roster.</h1>
        <p className="hero-lead">
          This page keeps a clean, newest-first list of member names and emails,
          plus a separate export for people who explicitly opted into updates.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      {!isConfigured ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Not enabled yet"
              intro="This private roster uses the same admin key as the other admin tools."
              title="The member roster is not live yet."
            />
            <div className="feature-card">
              <p>
                Add <code>ADMIN_LOOKUP_KEY</code> in Vercel to unlock the member
                roster, export tools, and newsletter subscriber list.
              </p>
            </div>
          </div>
        </section>
      ) : !hasAccess ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Private access"
              intro="Enter the admin lookup key to open the roster for this session."
              title="Unlock the member roster."
            />
            <form action={unlockAdminLookupAction} className="form-card">
              <input name="returnTo" type="hidden" value="/admin-tools/members" />
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
                Unlock roster
              </button>
            </form>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="What this includes"
              intro="The roster stays intentionally lean so it is useful for admin tracking without exposing extra profile details."
              title="Minimal by design."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Name and email only</h3>
                  <p>The roster view stays focused on the essentials for outreach and reporting.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Newsletter list stays separate</h3>
                  <p>Only people who explicitly opted in should receive update emails.</p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Exports are ready for grants</h3>
                  <p>Download a CSV when you need a roster snapshot for internal planning or reporting.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      ) : (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Member roster"
              intro="Newest signups appear first so it is easy to track fresh registrations."
              title="Your registration list."
            />
            <AdminToolLinks active="members" />
            <div className="button-row">
              <Link className="button-secondary" href="/admin-tools/members/export">
                Export roster CSV
              </Link>
              <Link
                className="button-secondary"
                href="/admin-tools/members/export?scope=newsletter"
              >
                Export newsletter CSV
              </Link>
              <form action={lockAdminLookupAction}>
                <input name="returnTo" type="hidden" value="/admin-tools/members" />
                <button className="button-secondary" type="submit">
                  Lock tool
                </button>
              </form>
            </div>

            {roster.length > 0 ? (
              <div className="roster-table-wrap">
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>
                          <a className="roster-email" href={`mailto:${member.email}`}>
                            {member.email}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No member signups have been recorded yet.</p>
              </div>
            )}
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Roster summary"
              intro="Use the roster CSV for internal tracking and the newsletter CSV only for opted-in contacts."
              title="A few numbers to keep nearby."
            />
            <div className="stats-grid">
              <article className="stat-card stat-card--wide">
                <strong>{roster.length}</strong>
                <span>Total members</span>
              </article>
              <article className="stat-card stat-card--wide">
                <strong>{newsletterSubscribers.length}</strong>
                <span>Newsletter opt-ins</span>
              </article>
              <article className="stat-card stat-card--wide">
                <strong>{recentSignupCount}</strong>
                <span>Joined in the last 30 days</span>
              </article>
              <article className="stat-card stat-card--wide">
                <strong>{formatDate(newestSignupDate)}</strong>
                <span>Most recent signup</span>
              </article>
            </div>

            <div className="feature-card">
              <h3>Newsletter note</h3>
              <p>
                The newsletter export only includes members who checked the email
                updates box during sign-up, onboarding, or profile updates.
              </p>
            </div>

            <div className="feature-card">
              <h3>Grant-friendly reporting</h3>
              <p>
                Because this roster is timestamped and newest-first, it gives
                you a simple way to show growth over time without exposing full
                member profiles.
              </p>
            </div>

            <SectionHeading
              eyebrow="Newsletter send"
              intro="This sends immediately to the members who explicitly opted in."
              title="Email your subscribed members."
            />

            {newsletterSendingReady ? (
              <form action={sendNewsletterAction} className="form-card">
                <label className="field">
                  <span>Subject</span>
                  <input
                    maxLength={120}
                    name="subject"
                    placeholder="Upcoming events and Guiding Light updates"
                    required
                    type="text"
                  />
                </label>
                <label className="field">
                  <span>Message</span>
                  <textarea
                    maxLength={8000}
                    name="body"
                    placeholder="Write the update you want subscribed members to receive."
                    required
                  />
                </label>
                <p className="field-help">
                  This email automatically includes your unsubscribe link and
                  postal footer. Current recipients: {newsletterSubscribers.length}.
                </p>
                <button
                  className="button-primary"
                  disabled={newsletterSubscribers.length === 0}
                  type="submit"
                >
                  Send newsletter
                </button>
              </form>
            ) : (
              <div className="feature-card">
                <h3>Finish email setup first</h3>
                <p>
                  Add <code>RESEND_API_KEY</code>, <code>EMAIL_FROM</code>, and
                  <code> NEWSLETTER_POSTAL_ADDRESS</code> before sending
                  newsletter emails from this page.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import {
  lockAdminLookupAction,
  unlockAdminLookupAction,
} from "@/app/actions";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import {
  hasAdminLookupAccess,
  isAdminLookupConfigured,
} from "@/lib/admin-access";
import { getUserAuthByEmail, getUserByEmail } from "@/lib/data";
import { formatRole } from "@/lib/formatters";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type EmailLookupPageProps = {
  searchParams?: PageSearchParams;
};

function normalizeLookupEmail(value: string | null) {
  return value?.trim().toLowerCase() || null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function EmailLookupPage({
  searchParams,
}: EmailLookupPageProps) {
  noStore();

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const email = normalizeLookupEmail(await getQueryMessage(searchParams, "email"));
  const isConfigured = isAdminLookupConfigured();
  const hasAccess = isConfigured ? await hasAdminLookupAccess() : false;

  const user = hasAccess && email ? await getUserByEmail(email) : null;
  const authRecord = hasAccess && email ? await getUserAuthByEmail(email) : undefined;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Private admin tool</p>
        <h1>Look up whether an email is actually in Guiding Light.</h1>
        <p className="hero-lead">
          This tool is only for confirming whether an account profile and a local
          password record exist for a specific email address.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      {!isConfigured ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Not enabled yet"
              intro="This admin helper is available once an access key is connected in the environment."
              title="The lookup tool is not live yet."
            />
            <div className="feature-card">
              <p>
                Add <code>ADMIN_LOOKUP_KEY</code> in Vercel to turn this tool on
                for private use.
              </p>
            </div>
          </div>
        </section>
      ) : !hasAccess ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Private access"
              intro="Enter the admin lookup key to unlock this page for a short session."
              title="Open the email lookup tool."
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
                Unlock lookup
              </button>
            </form>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="What this checks"
              intro="This page does not reset passwords or reveal passwords."
              title="It only answers the account-exists question."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Profile record</h3>
                  <p>Whether the email exists as a user in the app.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Local password auth</h3>
                  <p>Whether the email has a built-in Guiding Light password record.</p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Helpful account details</h3>
                  <p>Role, membership tier, onboarding state, and account creation date.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      ) : (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Email lookup"
              intro="Search the live app data for a single email address."
              title="Check one email at a time."
            />
            <form action="/admin-tools/email-lookup" className="form-card" method="get">
              <label className="field">
                <span>Email to check</span>
                <input
                  defaultValue={email ?? ""}
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </label>
              <div className="button-row">
                <button className="button-primary" type="submit">
                  Check email
                </button>
                <Link className="button-secondary" href="/">
                  Back home
                </Link>
              </div>
            </form>

            <form action={lockAdminLookupAction} className="form-card">
              <button className="button-secondary" type="submit">
                Lock tool
              </button>
            </form>

            {email ? (
              <div className="feature-card">
                <h3>Lookup result for {email}</h3>
                <p>
                  {user || authRecord
                    ? "Something matched this email in Guiding Light."
                    : "No profile or local password record matched this email."}
                </p>
              </div>
            ) : null}
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Result details"
              intro="These results only appear after a private lookup is unlocked."
              title={email ? "Here’s what the app knows." : "Run a lookup to see results."}
            />

            {email ? (
              <div className="stats-grid">
                <article className="stat-card">
                  <strong>{user ? "Yes" : "No"}</strong>
                  <span>Profile exists</span>
                </article>
                <article className="stat-card">
                  <strong>{authRecord ? "Yes" : "No"}</strong>
                  <span>Local password auth exists</span>
                </article>
                <article className="stat-card">
                  <strong>{user?.authProvider ?? "None"}</strong>
                  <span>Primary auth provider</span>
                </article>
                <article className="stat-card">
                  <strong>{user?.membershipTier ?? "None"}</strong>
                  <span>Membership tier</span>
                </article>
              </div>
            ) : null}

            {user ? (
              <div className="support-steps">
                <article className="support-step">
                  <span>01</span>
                  <div>
                    <h3>{user.name}</h3>
                    <p>{formatRole(user.role)} account</p>
                  </div>
                </article>
                <article className="support-step">
                  <span>02</span>
                  <div>
                    <h3>Onboarding</h3>
                    <p>{user.onboardingCompleted ? "Completed" : "Not completed yet"}</p>
                  </div>
                </article>
                <article className="support-step">
                  <span>03</span>
                  <div>
                    <h3>Created</h3>
                    <p>{formatDate(user.createdAt)}</p>
                  </div>
                </article>
              </div>
            ) : email ? (
              <div className="empty-state">
                <p>
                  If this email should have an account, the next best step is
                  creating one again through <Link href="/auth">the sign-up page</Link>.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

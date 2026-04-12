import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { signInAction, signUpAction } from "@/app/actions";
import { GoalCheckboxes } from "@/components/goal-checkboxes";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { ageGroupOptions, roleOptions } from "@/lib/catalog";
import { isClerkConfigured } from "@/lib/platform";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type AuthPageProps = {
  searchParams?: PageSearchParams;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  noStore();

  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Account access</p>
        <h1>Create your Guiding Light profile and start shaping the experience.</h1>
        <p className="hero-lead">
          {isClerkConfigured
            ? "Clerk is enabled for this app, so account creation and sign-in can run through managed authentication while the app keeps syncing profile data into Guiding Light."
            : "This first authentication flow is fully server-side and backed by the local SQLite app database, so sign-up, sign-in, and personalized recommendations are already working end to end."}
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      {isClerkConfigured ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Managed sign in"
              intro="Clerk handles identity, session management, and secure sign-in flows for deployment."
              title="Use the hosted sign-in flow."
            />
            <div className="empty-state">
              <p>
                The app is configured to use Clerk for authentication in this
                environment. Continue into the hosted auth screens, then finish
                your Guiding Light profile from the dashboard.
              </p>
              <div className="button-row">
                <Link className="button-primary" href="/sign-in">
                  Go to sign in
                </Link>
                <Link className="button-secondary" href="/sign-up">
                  Create account
                </Link>
              </div>
            </div>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Profile sync"
              intro="Clerk stores the identity layer while Guiding Light keeps app-specific profile and recommendation data."
              title="How the hosted flow works."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Authenticate with Clerk</h3>
                  <p>Sign in or sign up through managed hosted auth pages.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Auto-create your app profile</h3>
                  <p>
                    On first login, Guiding Light creates a matching user record
                    in the app database.
                  </p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Finish personalization in the dashboard</h3>
                  <p>
                    Set age focus, location, and support goals to improve
                    recommendations.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      ) : (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Sign in"
              intro="Use an existing account to access your saved resources, profile settings, and dashboard."
              title="Welcome back."
            />
            <form action={signInAction} className="form-card">
              <label className="field">
                <span>Email</span>
                <input name="email" placeholder="you@example.com" required type="email" />
              </label>
              <label className="field">
                <span>Password</span>
                <input name="password" placeholder="Enter your password" required type="password" />
              </label>
              <button className="button-primary" type="submit">
                Sign in
              </button>
            </form>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Create account"
              intro="Build a profile with just enough detail to drive useful, age-aware recommendations."
              title="Join the circle."
            />
            <form action={signUpAction} className="form-card">
              <div className="field-grid">
                <label className="field">
                  <span>Name</span>
                  <input name="name" placeholder="Your name" required type="text" />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input name="email" placeholder="you@example.com" required type="email" />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Password</span>
                  <input
                    minLength={8}
                    name="password"
                    placeholder="At least 8 characters"
                    required
                    type="password"
                  />
                </label>
                <label className="field">
                  <span>Location</span>
                  <input name="location" placeholder="City, state, or region" required type="text" />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Your role</span>
                  <select defaultValue="" name="role" required>
                    <option disabled value="">
                      Select a role
                    </option>
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Current age focus</span>
                  <select defaultValue="" name="ageGroup" required>
                    <option disabled value="">
                      Select an age focus
                    </option>
                    {ageGroupOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field">
                <span>Priority goals</span>
                <p className="field-help">
                  Choose the areas you want Guiding Light to prioritize first.
                </p>
                <GoalCheckboxes />
              </div>

              <button className="button-primary" type="submit">
                Create account
              </button>
            </form>
          </div>
        </section>
      )}

      <section className="cta-banner">
        <div>
          <p className="eyebrow">What happens next</p>
          <h2>Once you sign in, you can save resources and post directly in the forum.</h2>
          <p>
            Your profile will also shape dashboard recommendations across
            resources and upcoming events.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-secondary" href="/resources">
            Browse first
          </Link>
          <Link className="button-secondary" href="/community">
            Read community posts
          </Link>
        </div>
      </section>
    </div>
  );
}

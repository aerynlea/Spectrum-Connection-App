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
        <p className="eyebrow">Join Guiding Light</p>
        <h1>Create your profile and make this space your own.</h1>
        <p className="hero-lead">
          Create a profile to save resources, join conversations, and start
          seeing support that fits your life a little more closely.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      {isClerkConfigured ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Sign in"
              intro="Head to the sign-in page to open your Guiding Light account."
              title="Welcome back."
            />
            <div className="empty-state">
              <p>
                Continue to sign in, then finish your profile so support feels
                more personal each time you come back.
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
              eyebrow="Getting started"
              intro="A few quick steps help turn your account into a more personal support space."
              title="Here&apos;s what happens next."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Sign in or create your account</h3>
                  <p>Use the secure account screens to get started.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Tell us a little about you</h3>
                  <p>Share your role, age focus, location, and goals.</p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Start exploring your support space</h3>
                  <p>
                    Save resources, join the community, and discover helpful
                    next steps.
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
              intro="Use your account to open your saved resources, profile details, and personal space."
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
              intro="Share a few details so Guiding Light can surface support that fits your life."
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
          <h2>Once you sign in, you can save resources and join the conversation.</h2>
          <p>
            Your profile can also bring forward resources and events that feel
            closer to your season of life.
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

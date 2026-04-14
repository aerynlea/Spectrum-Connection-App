import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { requestPasswordResetAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { isClerkConfigured } from "@/lib/platform";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type ForgotPasswordPageProps = {
  searchParams?: PageSearchParams;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
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
        <p className="eyebrow">Password help</p>
        <h1>Let&apos;s help you get back into your account.</h1>
        <p className="hero-lead">
          Enter the email connected to your account and we&apos;ll help you reset
          your password safely.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      {isClerkConfigured ? (
        <section className="section split-layout">
          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Clerk recovery"
              intro="Use the secure recovery tools built into the sign-in screen."
              title="Reset your password from sign in."
            />
            <div className="button-row">
              <Link className="button-primary" href="/sign-in">
                Go to sign in
              </Link>
              <Link className="button-secondary" href="/auth">
                Back to account page
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Reset link"
              intro="We&apos;ll send a secure link if that email is connected to a local Guiding Light account."
              title="Request a password reset."
            />
            <form action={requestPasswordResetAction} className="form-card">
              <label className="field">
                <span>Email</span>
                <input name="email" placeholder="you@example.com" required type="email" />
              </label>
              <FormSubmitButton
                idleLabel="Send reset link"
                pendingLabel="Sending reset link..."
              />
            </form>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Good to know"
              intro="For privacy, the message stays the same whether or not an email is in the app."
              title="A safer recovery flow."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Enter your account email</h3>
                  <p>Use the same email you normally sign in with.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Open the secure reset link</h3>
                  <p>The link expires automatically so your account stays protected.</p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Choose a new password</h3>
                  <p>Once you save it, you can sign in again right away.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

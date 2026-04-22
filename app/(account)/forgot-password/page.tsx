import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import {
  getPasswordRecoverySupportEmail,
  isPasswordResetEmailConfigured,
} from "@/lib/email";
import { isClerkConfigured } from "@/lib/platform";
import { isLocalDevelopment } from "@/lib/platform";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type ForgotPasswordPageProps = {
  searchParams?: PageSearchParams;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const isEmailResetReady = isPasswordResetEmailConfigured();
  const supportEmail = getPasswordRecoverySupportEmail();
  const supportHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent("Guiding Light account help")}`
    : null;

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
      ) : !isEmailResetReady && !isLocalDevelopment ? (
        <section className="section split-layout">
          <div className="section-panel">
            <SectionHeading
              eyebrow="Reset email update"
              intro="Password reset email is still being connected, so this part of the account flow is paused for the moment."
              title="We&apos;re finishing the email connection."
            />
            <div className="feature-card">
              <p>
                You can still return to sign in, and this page will be ready as
                soon as email delivery is fully connected.
              </p>
            </div>
            <div className="button-row">
              <Link className="button-primary" href="/auth">
                Back to sign in
              </Link>
              <Link className="button-secondary" href="/">
                Go home
              </Link>
            </div>
          </div>

          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="What&apos;s happening"
              intro="This pause helps us avoid sending you into an error page or a reset loop while the email service is still being finalized."
              title="A calmer hold for now."
            />
            <div className="support-steps">
              <article className="support-step">
                <span>01</span>
                <div>
                  <h3>Email delivery is being finished</h3>
                  <p>We&apos;re holding the form until secure reset messages are ready to send.</p>
                </div>
              </article>
              <article className="support-step">
                <span>02</span>
                <div>
                  <h3>Your account is still safe</h3>
                  <p>No password changes happen until a real reset link is available.</p>
                </div>
              </article>
              <article className="support-step">
                <span>03</span>
                <div>
                  <h3>Come back shortly</h3>
                  <p>This section can be reopened as soon as the mail service is fully connected.</p>
                </div>
              </article>
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
              <button className="button-primary" type="submit">
                Send reset link
              </button>
            </form>

            {supportHref ? (
              <div className="feature-card">
                <h3>Still waiting?</h3>
                <p>
                  If you do not see the email after a few minutes, check spam or
                  promotions first, then reach out and we can help you keep moving.
                </p>
                <div className="button-row">
                  <a className="button-secondary" href={supportHref}>
                    Email support
                  </a>
                </div>
              </div>
            ) : null}
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
              <article className="support-step">
                <span>04</span>
                <div>
                  <h3>Pause before requesting another</h3>
                  <p>
                    If you already asked for a reset, give that message a few
                    minutes before sending another request.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

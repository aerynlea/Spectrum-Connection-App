import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { resetPasswordAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser, hashPasswordResetToken } from "@/lib/auth";
import { deleteExpiredPasswordResetTokens, getPasswordResetToken } from "@/lib/data";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type ResetPasswordPageProps = {
  searchParams?: PageSearchParams;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  noStore();

  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect("/dashboard");
  }

  await deleteExpiredPasswordResetTokens();

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const token = await getQueryMessage(searchParams, "token");
  const resetRecord = token
    ? await getPasswordResetToken(hashPasswordResetToken(token))
    : null;

  const isExpired =
    !resetRecord || Boolean(resetRecord.used_at) || new Date(resetRecord.expires_at) <= new Date();

  if (isExpired) {
    return (
      <div className="page">
        <section className="page-intro">
          <p className="eyebrow">Password help</p>
          <h1>This reset link is no longer available.</h1>
          <p className="hero-lead">
            Request a new password reset link so you can keep going safely.
          </p>
        </section>

        <StatusBanner message={error} tone="error" />

        <section className="cta-banner">
          <div>
            <p className="eyebrow">Next step</p>
            <h2>Start a new reset request.</h2>
            <p>
              Reset links expire automatically after a short time to help keep
              your account protected.
            </p>
          </div>
          <div className="button-row">
            <Link className="button-primary" href="/forgot-password">
              Request a new link
            </Link>
            <Link className="button-secondary" href="/auth">
              Back to sign in
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Choose a new password</p>
        <h1>Reset your password and sign back in.</h1>
        <p className="hero-lead">
          Pick a new password you can return to with confidence.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="New password"
            intro="Use at least 8 characters so your account stays protected."
            title="Save your new sign-in."
          />
          <form action={resetPasswordAction} className="form-card">
            <input name="token" type="hidden" value={token ?? ""} />
            <label className="field">
              <span>New password</span>
              <input minLength={8} name="password" required type="password" />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input minLength={8} name="confirmPassword" required type="password" />
            </label>
            <FormSubmitButton
              idleLabel="Reset password"
              pendingLabel="Saving new password..."
            />
          </form>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="After you reset"
            intro="Once this is saved, head back to sign in with the password you just chose."
            title="You&apos;ll be ready to sign in again."
          />
          <div className="button-row">
            <Link className="button-secondary" href="/auth">
              Back to sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

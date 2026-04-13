import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { hasPremiumAccess } from "@/lib/membership";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type MembershipSuccessPageProps = {
  searchParams?: PageSearchParams;
};

export default async function MembershipSuccessPage({
  searchParams,
}: MembershipSuccessPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const sessionId = await getQueryMessage(searchParams, "session_id");

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Membership</p>
        <h1>Thank you for supporting Guiding Light.</h1>
        <p className="hero-lead">
          Your membership helps keep this space calmer, more thoughtful, and
          more useful for families and self-advocates.
        </p>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What happens next"
            intro="Stripe usually confirms everything quickly. Your membership should show up in your account shortly."
            title="You are almost there."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Stripe finishes checkout</h3>
                <p>Your secure payment confirmation is already on its way.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>Guiding Light updates your membership</h3>
                <p>Your premium access should appear in your account as soon as Stripe confirms it.</p>
              </div>
            </article>
            <article className="support-step">
              <span>03</span>
              <div>
                <h3>Return to your dashboard</h3>
                <p>Your saved support and guided planning tools will be waiting there.</p>
              </div>
            </article>
          </div>
          {sessionId ? (
            <p className="meta-copy">Confirmation reference: {sessionId}</p>
          ) : null}
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Go back in"
            intro={
              currentUser && hasPremiumAccess(currentUser)
                ? "Your premium membership is already showing as active."
                : "If your membership badge does not appear right away, give it a moment and refresh once."
            }
            title="Continue with your support space."
          />
          <div className="button-row">
            <Link className="button-primary" href="/dashboard">
              Open dashboard
            </Link>
            <Link className="button-secondary" href="/membership">
              Back to membership
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

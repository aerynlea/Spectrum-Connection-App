import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { MembershipActions } from "@/components/membership-actions";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/platform";
import {
  buildPremiumRoadmap,
  getMembershipDescription,
  getMembershipLabel,
  getSubscriptionStatusLabel,
  hasPremiumAccess,
  membershipHighlights,
} from "@/lib/membership";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import { getPremiumPriceSummary } from "@/lib/stripe";

type MembershipPageProps = {
  searchParams?: PageSearchParams;
};

export default async function MembershipPage({
  searchParams,
}: MembershipPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const priceSummary = await getPremiumPriceSummary().catch(() => null);
  const premiumRoadmap = currentUser ? buildPremiumRoadmap(currentUser) : [];
  const premiumAccess = hasPremiumAccess(currentUser);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Membership</p>
        <h1>Premium planning for families and self-advocates who want a steadier rhythm.</h1>
        <p className="hero-lead">
          Premium membership is designed to make support feel easier to return
          to, easier to act on, and less overwhelming to hold together.
        </p>
        {currentUser ? (
          <div className="pill-list">
            <span className="pill">{getMembershipLabel(currentUser.membershipTier)}</span>
            <span className="pill">
              {getSubscriptionStatusLabel(currentUser.subscriptionStatus)}
            </span>
          </div>
        ) : null}
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What premium includes"
            intro="Everything here is shaped to reduce searching and help support feel easier to hold onto."
            title="A calmer premium layer."
          />
          <div className="card-grid card-grid--three">
            {membershipHighlights.map((highlight) => (
              <article className="feature-card feature-card--premium" key={highlight.title}>
                <p className="feature-label">{highlight.eyebrow}</p>
                <h3>{highlight.title}</h3>
                <p>{highlight.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Your membership"
            intro={
              currentUser
                ? getMembershipDescription(currentUser)
                : "Sign in to start premium membership or manage billing."
            }
            title={
              priceSummary
                ? `${priceSummary.amount} per ${priceSummary.interval}`
                : "Monthly membership"
            }
          />

          <article className="membership-card">
            <p className="feature-label">Premium member access</p>
            <h3>Make your support plan easier to come back to.</h3>
            <p>
              Premium membership keeps your planning flow calmer with a more guided,
              more personal experience built around the goals you already care about.
            </p>

            {currentUser ? (
              <MembershipActions
                canManage={premiumAccess && Boolean(currentUser.stripeCustomerId)}
                checkoutDisabled={!isStripeConfigured}
              />
            ) : (
              <div className="button-row">
                <Link className="button-primary" href="/auth">
                  Sign in to continue
                </Link>
              </div>
            )}

            {!isStripeConfigured ? (
              <p className="meta-copy">
                Premium checkout is being connected right now.
              </p>
            ) : null}
          </article>
        </div>
      </section>

      {currentUser ? (
        <section className="section">
          <SectionHeading
            eyebrow="Premium preview"
            intro="Here is the kind of guided plan premium membership can keep closer at hand."
            title="A sample roadmap shaped around your goals."
          />
          <div className="card-grid card-grid--three">
            {premiumRoadmap.map((item) => (
              <article className="feature-card" key={item.goal}>
                <p className="feature-label">{item.goal.replace("-", " ")}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

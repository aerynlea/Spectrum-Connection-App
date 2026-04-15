import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { requireCurrentUser } from "@/lib/auth";
import { formatGoal } from "@/lib/formatters";
import { membershipHighlights } from "@/lib/membership";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type OnboardingPageProps = {
  searchParams?: PageSearchParams;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  noStore();

  const currentUser = await requireCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");

  if (currentUser.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Welcome</p>
        <h1>Let&apos;s shape your support space around real life.</h1>
        <p className="hero-lead">
          A few details help Guiding Light bring forward the resources,
          conversations, and next steps that feel most helpful right now.
        </p>
        <div className="pill-list">
          {currentUser.goals.map((goal) => (
            <span className="pill" key={goal}>
              {formatGoal(goal)}
            </span>
          ))}
        </div>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What onboarding does"
            intro="This helps the app feel calmer, more personal, and easier to come back to."
            title="A gentler starting point."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Bring your priorities into focus</h3>
                <p>Tell Guiding Light what kind of support matters most first.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>Find support that feels more relevant</h3>
                <p>Resources and event ideas can start reflecting your daily life.</p>
              </div>
            </article>
            <article className="support-step">
              <span>03</span>
              <div>
                <h3>Return to a space that remembers you</h3>
                <p>Saved links, community support, and planning tools stay easier to reach.</p>
              </div>
            </article>
          </div>
          <div className="card-grid card-grid--three">
            {membershipHighlights.map((highlight) => (
              <article className="feature-card feature-card--flat" key={highlight.title}>
                <p className="feature-label">{highlight.eyebrow}</p>
                <h3>{highlight.title}</h3>
                <p>{highlight.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Your details"
            intro="You can update these again anytime from your dashboard."
            title="Finish setting up your profile."
          />
          <OnboardingForm currentUser={currentUser} />
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Prefer to explore first?</p>
          <h2>You can still look around before finishing everything.</h2>
          <p>
            If you want a quick look first, browse support and come back when
            you are ready.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-secondary" href="/resources">
            Browse support
          </Link>
          <Link className="button-secondary" href="/community">
            Read community conversations
          </Link>
        </div>
      </section>
    </div>
  );
}

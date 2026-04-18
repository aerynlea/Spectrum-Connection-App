import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { ReportConcernForm } from "@/components/report-concern-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { listProfessionals } from "@/lib/data";
import { partitionByLocation } from "@/lib/location";
import { isClerkConfigured } from "@/lib/platform";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import { verificationSteps } from "@/lib/site-data";

type ProfessionalsPageProps = {
  searchParams?: PageSearchParams;
};

export default async function ProfessionalsPage({
  searchParams,
}: ProfessionalsPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const professionals = await listProfessionals();
  const providerSections = partitionByLocation(professionals, currentUser?.location);
  const featuredProfessionals =
    currentUser && providerSections.nearby.length > 0
      ? providerSections.nearby
      : professionals;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Trusted Professionals</p>
        <h1>Meet therapists, educators, and providers families can explore with more confidence.</h1>
        <p className="hero-lead">
          Families can discover trusted providers, understand how they help,
          and decide who may be a good fit for their needs.
        </p>
        {!currentUser ? (
          <div className="button-row">
            <Link
              className="button-primary"
              href={isClerkConfigured ? "/sign-up" : "/auth"}
            >
              Create your profile
            </Link>
          </div>
        ) : null}
      </section>

      <StatusBanner message={message} />

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Meet the professionals"
            intro="Explore therapists, educators, and support teams who help with communication, regulation, learning, and everyday life."
            title="Professionals families can feel good about exploring."
          />
          <div className="stack-list">
            {featuredProfessionals.map((professional) => (
              <article className="thread-card" id={professional.id} key={professional.id}>
                <div className="thread-card__meta">
                  <div>
                    <h3>{professional.name}</h3>
                    <p>
                      {professional.title} • {professional.organization}
                    </p>
                  </div>
                  <span className="tag-chip">
                    {professional.acceptingNewFamilies
                      ? "Accepting families"
                      : "Waitlist"}
                  </span>
                </div>
                <h4>{professional.focus}</h4>
                <p className="feature-label">
                  {professional.verified
                    ? "Verified professional"
                    : "Community-sourced listing"}
                </p>
                <p>{professional.summary}</p>
                <p className="meta-copy">{professional.location}</p>
                <p className="meta-copy">
                  {professional.verified
                    ? "Credential review and public profile check completed."
                    : "Shared for exploration while the trust review is still pending."}
                </p>
                <Link
                  className="text-link"
                  href={professional.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Visit their site
                </Link>
                <ReportConcernForm
                  canReport={Boolean(currentUser)}
                  returnTo={`/professionals#${professional.id}`}
                  targetId={professional.id}
                  targetType="professional"
                />
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="How trust is earned"
            intro="Families deserve clarity about who they are hearing from, how profiles are reviewed, and how to flag anything that feels off."
            title="How professionals are reviewed."
          />
          <div className="support-steps">
            {verificationSteps.map((step, index) => (
              <article className="support-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p>{step}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {currentUser && providerSections.broader.length > 0 ? (
        <section className="section">
          <SectionHeading
            eyebrow="Broader support"
            intro="These trusted organizations can still help even if they are not closest to your area."
            title="More trusted options to explore."
          />
          <div className="stack-list">
            {providerSections.broader.map((professional) => (
              <article className="sub-card" key={professional.id}>
                <h3>{professional.name}</h3>
                <p>{professional.summary}</p>
                <p className="meta-copy">{professional.location}</p>
                <Link
                  className="text-link"
                  href={professional.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Learn more
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

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
        <p className="eyebrow">Verified Professionals</p>
        <h1>Trusted experts can participate in ways that strengthen the whole community.</h1>
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
              Create a member profile
            </Link>
          </div>
        ) : null}
      </section>

      <StatusBanner message={message} />

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Directory"
            intro="Meet professionals who support communication, regulation, learning, and everyday life."
            title="Verified voices in the network."
          />
          <div className="stack-list">
            {featuredProfessionals.map((professional) => (
              <article className="thread-card" key={professional.id}>
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
                <p>{professional.summary}</p>
                <p className="meta-copy">{professional.location}</p>
                <Link
                  className="text-link"
                  href={professional.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Visit organization
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Verification flow"
            intro="Families deserve clarity about who they are hearing from and why that voice can be trusted."
            title="How Guiding Light builds trust."
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
            title="National and statewide options."
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
                  Open provider page
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

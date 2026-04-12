import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { listProfessionals } from "@/lib/data";
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

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Verified Professionals</p>
        <h1>Trusted experts can participate in ways that strengthen the whole community.</h1>
        <p className="hero-lead">
          The verified network is now backed by stored provider records, giving
          the app a real foundation for future discovery, filters, and local
          outreach partnerships.
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
            intro="These sample provider records are persisted in the same app data layer as the rest of Guiding Light."
            title="Verified voices in the network."
          />
          <div className="stack-list">
            {professionals.map((professional) => (
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
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Verification flow"
            intro="A clear process helps families trust who they are hearing from and helps professionals represent themselves responsibly."
            title="Badges should mean something concrete."
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
    </div>
  );
}

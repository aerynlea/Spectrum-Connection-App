import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { ResourceCard } from "@/components/resources/resource-card";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { listResources } from "@/lib/data";

type ListedResource = Awaited<ReturnType<typeof listResources>>[number];

const SCHOOL_PATH_RESOURCE_IDS = [
  "cde-reasons-for-concern",
  "cde-parents-rights-special-education",
  "cde-independent-educational-evaluations",
  "autism-speaks-iep-guide",
  "family-focus-resource-center",
];

const COVERAGE_PATH_RESOURCE_IDS = [
  "autism-speaks-first-concern-to-action",
  "california-dds-early-start",
  "california-autism-insurance-coverage",
  "california-dmhc-behavioral-health-care",
  "easterseals-southern-california-autism-services",
];

const FAMILY_SUPPORT_RESOURCE_IDS = [
  "california-ihss-program",
  "california-paid-family-leave",
  "ssa-ssi-for-children",
  "autism-in-black",
  "autism-speaks-resource-guide",
];

function pickResources(resources: ListedResource[], ids: string[]) {
  return ids
    .map((id) => resources.find((resource) => resource.id === id))
    .filter((resource): resource is ListedResource => Boolean(resource));
}

export default async function CaliforniaGuidePage() {
  noStore();

  const currentUser = await getCurrentUser();
  const resources = await listResources(currentUser?.id);
  const schoolPathResources = pickResources(resources, SCHOOL_PATH_RESOURCE_IDS);
  const coveragePathResources = pickResources(resources, COVERAGE_PATH_RESOURCE_IDS);
  const familySupportResources = pickResources(resources, FAMILY_SUPPORT_RESOURCE_IDS);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">California parent guide</p>
        <h1>A calmer way to move through school, insurance, and family support in California.</h1>
        <p className="hero-lead">
          This page brings the biggest California questions into one place so
          families can understand what belongs with the school district, what
          belongs with medical or insurance support, and where at-home help may
          fit in.
        </p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Start with the big picture"
            intro="Many families are asked for the same paperwork and the same story more than once. It helps to know which system you are talking to."
            title="In California, families often move through more than one support path."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>1</span>
              <div>
                <h3>School district path</h3>
                <p>
                  This path helps determine special education eligibility, IEP
                  services, and school-based supports.
                </p>
              </div>
            </article>
            <article className="support-step">
              <span>2</span>
              <div>
                <h3>Medical and insurance path</h3>
                <p>
                  This path is usually where diagnosis, treatment
                  recommendations, and insurance coverage decisions happen.
                </p>
              </div>
            </article>
            <article className="support-step">
              <span>3</span>
              <div>
                <h3>Family support path</h3>
                <p>
                  This can include regional center or early support guidance,
                  caregiver benefits, wage-replacement support, and community
                  help.
                </p>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Helpful to remember"
            intro="This is a practical family guide, not legal advice, but it can make the first few conversations feel clearer."
            title="What many California families wish they knew sooner."
          />
          <ul className="bullet-list bullet-list--wide">
            <li>An IEP evaluation and a medical diagnosis are not the same thing.</li>
            <li>You can ask the school district for written timelines, meeting notes, and copies of evaluations.</li>
            <li>Insurance questions may need a separate call, referral, or appeal even after school support is in motion.</li>
            <li>Family support often gets easier when paperwork, names, and dates are kept in one place from the beginning.</li>
          </ul>
          <p className="meta-copy">
            If you want personal advice alongside the official links, the
            community page is a good next stop.
          </p>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="School-based support"
          intro="These links can help you prepare for school meetings, understand rights, and ask better questions before signing paperwork."
          title="Resources for evaluation, consent, IEPs, and school advocacy."
        />
        <div className="stack-list">
          {schoolPathResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              returnTo="/california-guide"
              showSaveAction={Boolean(currentUser)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Medical and insurance support"
          intro="These resources are helpful when you are trying to understand treatment access, diagnosis steps, health-plan rules, or how to push back after a denial."
          title="Resources for coverage, early support, and treatment access."
        />
        <div className="stack-list">
          {coveragePathResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              returnTo="/california-guide"
              showSaveAction={Boolean(currentUser)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Family support at home"
          intro="These links can help when the bigger question is how your family keeps going day to day while support gets put in place."
          title="Benefits, community support, and next-step help for caregivers."
        />
        <div className="stack-list">
          {familySupportResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              returnTo="/california-guide"
              showSaveAction={Boolean(currentUser)}
            />
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Keep going</p>
          <h2>Move from California steps into everyday support and lived advice.</h2>
          <p>
            Save what matters, keep reading, or ask the community how other
            families handled the same stage.
          </p>
        </div>
        <div className="button-row">
          <Link
            className="button-primary"
            href={{
              pathname: "/resources",
              query: { collection: "California School and Insurance Help" },
            }}
          >
            Browse California support
          </Link>
          <Link className="button-secondary" href="/community">
            Ask the community
          </Link>
        </div>
      </section>
    </div>
  );
}

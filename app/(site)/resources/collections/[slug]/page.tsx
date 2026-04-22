import Link from "next/link";
import { notFound } from "next/navigation";

import { ResourceCard } from "@/components/resources/resource-card";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { listResources } from "@/lib/data";
import {
  buildResourceCollectionPath,
  getResourceQuickStartBySlug,
} from "@/lib/resources";

type ResourceCollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ResourceCollectionPage({
  params,
}: ResourceCollectionPageProps) {
  const [currentUser, { slug }] = await Promise.all([
    getCurrentUser(),
    params,
  ]);
  const quickStart = getResourceQuickStartBySlug(slug);

  if (!quickStart) {
    notFound();
  }

  const resources = await listResources(currentUser?.id);
  const collectionResources = resources.filter(
    (resource) => resource.collectionName === quickStart.collectionName,
  );

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">{quickStart.eyebrow}</p>
        <h1>{quickStart.title}</h1>
        <p className="hero-lead">{quickStart.description}</p>
        <div className="pill-list pill-list--compact">
          <span className="pill">{quickStart.collectionName}</span>
          <span className="pill">
            {collectionResources.length} link{collectionResources.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="This support page"
            intro="Everything here stays grouped around one need so families do not have to dig back through the full library."
            title="A calmer page for one kind of support."
          />
          <ul className="bullet-list bullet-list--wide">
            <li>Tap the main part of any card to open the official site right away.</li>
            <li>Use Guiding Light details if you want a little more context before leaving the app.</li>
            <li>Save useful options if you want to come back to them later.</li>
          </ul>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Keep exploring"
            intro="You can stay in this focused page or head back to the full support library anytime."
            title="Choose what feels easiest next."
          />
          <div className="button-row">
            <Link className="button-primary" href="/resources">
              Open full support library
            </Link>
            <Link className="button-secondary" href="/community">
              Ask the community
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Support links"
          intro={`Showing ${collectionResources.length} option${collectionResources.length === 1 ? "" : "s"} grouped under ${quickStart.collectionName}.`}
          title="Open the official links from here."
        />

        {collectionResources.length > 0 ? (
          <div className="stack-list">
            {collectionResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                returnTo={buildResourceCollectionPath(quickStart.slug)}
                showSaveAction={Boolean(currentUser)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              This page is ready, but there are not any matching links in this collection yet.
            </p>
            <Link className="button-secondary" href="/resources">
              Back to all resources
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

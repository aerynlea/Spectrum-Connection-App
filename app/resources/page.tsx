import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { SaveResourceForm } from "@/components/save-resource-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import type { ResourceRecord } from "@/lib/app-types";
import { getCurrentUser } from "@/lib/auth";
import { listEvents, listResources } from "@/lib/data";
import { isClerkConfigured } from "@/lib/platform";
import { buildRecommendations } from "@/lib/recommendations";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type ResourcesPageProps = {
  searchParams?: PageSearchParams;
};

function groupResourcesByCollection(resources: ResourceRecord[]) {
  return resources.reduce<Map<string, typeof resources>>((groups, resource) => {
    const next = groups.get(resource.collectionName) ?? [];
    next.push(resource);
    groups.set(resource.collectionName, next);
    return groups;
  }, new Map());
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const resources = await listResources(currentUser?.id);
  const groupedResources = groupResourcesByCollection(resources);
  const recommendations = currentUser
    ? buildRecommendations(currentUser, resources, await listEvents())
    : null;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Resource Center</p>
        <h1>Support that can now be saved, revisited, and tailored to your profile.</h1>
        <p className="hero-lead">
          The resource hub is backed by the app database, so saved resources
          persist across sessions and recommendation scores can respond to real
          user profiles instead of static mock content.
        </p>
        {!currentUser ? (
          <div className="button-row">
            <Link
              className="button-primary"
              href={isClerkConfigured ? "/sign-in" : "/auth"}
            >
              Sign in to personalize this page
            </Link>
            <Link className="button-secondary" href="/community">
              Pair resources with community support
            </Link>
          </div>
        ) : null}
      </section>

      <StatusBanner message={message} />

      {recommendations ? (
        <section className="section split-layout">
          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Recommended for you"
              intro="These results are ranked from your age focus, support goals, and role."
              title="A personalized shortlist."
            />
            <div className="stack-list">
              {recommendations.resources.map((resource) => (
                <article className="sub-card" key={resource.id}>
                  <div className="stack-row">
                    <div>
                      <h3>{resource.title}</h3>
                      <p>{resource.summary}</p>
                    </div>
                    <SaveResourceForm
                      isSaved={resource.isSaved}
                      resourceId={resource.id}
                      returnTo="/resources"
                    />
                  </div>
                  <div className="pill-list pill-list--compact">
                    {resource.reasons.map((reason) => (
                      <span className="pill pill--soft" key={reason}>
                        {reason}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="section-panel">
            <SectionHeading
              eyebrow="Why it matters"
              intro="Families and autistic adults often lose time to fragmented systems and repeated searching."
              title="Guiding Light turns scattered information into a clearer path."
            />
            <p className="panel-copy">
              The app now keeps your profile, bookmarks, and feed activity
              together so the platform gets more helpful the more you use it.
            </p>
            <Link className="button-secondary" href="/dashboard">
              Open your dashboard
            </Link>
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeading
          eyebrow="Collections"
          intro="Each collection is now a live, saveable list instead of a static concept block."
          title="Resource pathways for every phase of the journey."
        />
        <div className="resource-grid">
          {Array.from(groupedResources.entries()).map(([collectionName, collectionResources]) => (
            <article className="resource-card" key={collectionName}>
              <div className="resource-card__header">
                <div>
                  <h2>{collectionName}</h2>
                  <p>
                    {collectionResources.length} resources in this pathway
                  </p>
                </div>
              </div>
              <div className="stack-list">
                {collectionResources.map((resource) => (
                  <article className="sub-card" key={resource.id}>
                    <div className="stack-row">
                      <div>
                        <h3>{resource.title}</h3>
                        <p>{resource.summary}</p>
                      </div>
                      {currentUser ? (
                        <SaveResourceForm
                          isSaved={resource.isSaved}
                          resourceId={resource.id}
                          returnTo="/resources"
                        />
                      ) : null}
                    </div>
                    <div className="pill-list pill-list--compact">
                      <span className="pill pill--soft">{resource.category}</span>
                      <span className="pill pill--soft">{resource.audience}</span>
                      <span className="pill pill--soft">{resource.locationScope}</span>
                      {resource.verified ? (
                        <span className="pill pill--soft">Verified guidance</span>
                      ) : null}
                    </div>
                    <div className="resource-meta">
                      <span>{resource.organization}</span>
                      <Link className="text-link" href={resource.href}>
                        Open related area
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

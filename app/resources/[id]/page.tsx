import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

import { ResourceCard } from "@/components/resources/resource-card";
import { SaveResourceForm } from "@/components/save-resource-form";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { listCommunityPosts, listResources } from "@/lib/data";
import { formatAgeGroup, formatGoal } from "@/lib/formatters";
import { getResourceById } from "@/lib/resources";

type ResourceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeLabel(value: string) {
  return value.trim().toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWholePhrase(text: string, phrase: string) {
  if (!phrase) {
    return false;
  }

  const pattern = new RegExp(`(^|\\b)${escapeRegExp(phrase)}(\\b|$)`, "i");
  return pattern.test(text);
}

export default async function ResourceDetailPage({
  params,
}: ResourceDetailPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const resources = await listResources(currentUser?.id);
  const { id } = await params;
  const resource = getResourceById(resources, id);

  if (!resource) {
    notFound();
  }

  const relatedResources = resources
    .filter((item) => item.id !== resource.id)
    .map((item) => {
      let score = 0;

      if (item.collectionName === resource.collectionName) {
        score += 4;
      }

      if (item.category === resource.category) {
        score += 3;
      }

      if (item.tags.some((tag) => resource.tags.includes(tag))) {
        score += 2;
      }

      if (item.ageGroup === resource.ageGroup || item.ageGroup === "all") {
        score += 1;
      }

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((entry) => entry.item);

  const topicAliases = Array.from(
    new Set(
      [
        resource.category,
        resource.collectionName,
        resource.organization,
        ...resource.tags.map(formatGoal),
      ].map(normalizeLabel),
    ),
  );

  const relatedPosts = (await listCommunityPosts(20))
    .map((post) => {
      const topic = normalizeLabel(post.topic);
      const tag = normalizeLabel(post.tag);
      const title = normalizeLabel(post.title);
      const body = normalizeLabel(post.body);

      let score = 0;

      for (const alias of topicAliases) {
        if (topic === alias) {
          score += 5;
        }

        if (tag === alias) {
          score += 4;
        } else if (containsWholePhrase(tag, alias)) {
          score += 3;
        }

        if (containsWholePhrase(title, alias)) {
          score += 2;
        }

        if (containsWholePhrase(body, alias)) {
          score += 1;
        }
      }

      return {
        post,
        score,
      };
    })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.post);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Resource Detail</p>
        <h1>{resource.title}</h1>
        <p className="hero-lead">{resource.summary}</p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Resource overview"
            title="Helpful details before you click away."
            intro="This page is meant to give you enough context to decide whether this support feels worth exploring next."
          />

          <article className="feature-card">
            <div className="thread-card__meta">
              <div>
                <h3>{resource.title}</h3>
                <p>
                  {resource.collectionName} • {resource.organization}
                </p>
              </div>
              <span className="tag-chip">
                {resource.verified ? "Verified" : "Community Shared"}
              </span>
            </div>

            <p>{resource.summary}</p>

            <div className="pill-list pill-list--compact">
              <span className="pill pill--soft">{resource.category}</span>
              <span className="pill pill--soft">
                {resource.ageGroup === "all"
                  ? "All ages"
                  : formatAgeGroup(resource.ageGroup)}
              </span>
              <span className="pill pill--soft">{resource.audience}</span>
            </div>

            <div className="stack-list" style={{ marginTop: "1rem" }}>
              <p className="meta-copy">
                <strong>Where it fits:</strong> {resource.locationScope}
              </p>
              <p className="meta-copy">
                <strong>Good for:</strong>{" "}
                {resource.tags.map((tag) => formatGoal(tag)).join(", ")}
              </p>
              <p className="meta-copy">
                <strong>Organization:</strong> {resource.organization}
              </p>
            </div>

            <div className="resource-actions" style={{ marginTop: "1rem" }}>
              <Link
                className="button-primary"
                href={resource.href}
                rel="noreferrer"
                target="_blank"
              >
                Open official resource
              </Link>
              <Link
                className="button-secondary"
                href={{
                  pathname: "/resources",
                  query: { collection: resource.collectionName },
                }}
              >
                More in this collection
              </Link>
              {currentUser ? (
                <SaveResourceForm
                  isSaved={resource.isSaved}
                  resourceId={resource.id}
                  returnTo={`/resources/${resource.id}`}
                />
              ) : null}
            </div>
          </article>

          <div className="form-card" style={{ marginTop: "1.5rem" }}>
            <h3>What to consider</h3>
            <ul className="bullet-list bullet-list--wide">
              <li>Check the audience and age focus before spending time on the full site.</li>
              <li>Look for waitlist, enrollment, county, or insurance details on the official page.</li>
              <li>Use the community page if you want lived-experience advice before taking the next step.</li>
            </ul>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Related discussions"
            title="Community conversations connected to this topic."
            intro="Support is often easier to use when practical links and lived experience can sit side by side."
          />

          {relatedPosts.length > 0 ? (
            <div className="stack-list">
              {relatedPosts.map((post) => (
                <article className="thread-card" key={post.id}>
                  <div className="thread-card__meta">
                    <div>
                      <h3>{post.authorName}</h3>
                      <p>{post.authorRole}</p>
                    </div>
                    <span className="tag-chip">{post.tag}</span>
                  </div>
                  <h4>{post.title}</h4>
                  <p>{post.body}</p>
                  <p className="meta-copy">{post.topic}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                No related discussions have been posted yet. This could be a
                good place to ask how other families or self-advocates used it.
              </p>
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <Link className="button-primary" href="/community">
              Go to community
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Keep exploring"
          title="More support in the same neighborhood."
          intro="These are strong next clicks if this resource feels close, but not quite the full answer."
        />

        {relatedResources.length > 0 ? (
          <div className="stack-list">
            {relatedResources.map((relatedResource) => (
              <ResourceCard
                key={relatedResource.id}
                resource={relatedResource}
                returnTo={`/resources/${resource.id}`}
                showSaveAction={Boolean(currentUser)}
              />
            ))}
          </div>
        ) : (
          <div className="card-grid card-grid--two">
            <Link className="feature-card" href="/resources">
              <h3>Browse more resources</h3>
              <p>Return to the directory and compare more support options.</p>
            </Link>

            <Link className="feature-card" href="/community">
              <h3>Ask the community</h3>
              <p>See what others have shared about similar questions and experiences.</p>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

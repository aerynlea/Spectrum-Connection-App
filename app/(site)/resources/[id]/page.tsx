import Link from "next/link";
import { notFound } from "next/navigation";

import { ResourceCard } from "@/components/resources/resource-card";
import { SaveResourceForm } from "@/components/save-resource-form";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { listCommunityPosts, listResources } from "@/lib/data";
import { formatAgeGroup, formatGoal } from "@/lib/formatters";
import {
  buildResourceCollectionPath,
  getResourceById,
  getResourceQuickStartByCollectionName,
} from "@/lib/resources";

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
  const [currentUser, { id }] = await Promise.all([
    getCurrentUser(),
    params,
  ]);
  const resources = await listResources(currentUser?.id);
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
  const matchingQuickStart = getResourceQuickStartByCollectionName(resource.collectionName);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Support details</p>
        <h1>{resource.title}</h1>
        <p className="hero-lead">{resource.summary}</p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Before you click through"
            title="Helpful details at a glance."
            intro="This page gives you a quick feel for who it is for, where it fits, and whether it seems worth your time."
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
                <strong>From:</strong> {resource.organization}
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
                href={
                  matchingQuickStart
                    ? buildResourceCollectionPath(matchingQuickStart.slug)
                    : `/resources?collection=${encodeURIComponent(resource.collectionName)}`
                }
              >
                More support like this
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
              <li>Visit the community page if you want real-life advice before you decide.</li>
            </ul>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Community wisdom"
            title="Conversations that can add lived experience."
            intro="Support often feels easier to use when practical links and real stories can sit side by side."
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
                No one has posted about this yet. This would be a good place to
                ask how other families or self-advocates have used it.
              </p>
            </div>
          )}

          <div style={{ marginTop: "1rem" }}>
            <Link className="button-primary" href="/community">
              Ask the community
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
              <p>Go back to the support library and compare more options.</p>
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

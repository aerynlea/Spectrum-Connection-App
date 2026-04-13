import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/section-heading";
import { listCommunityPosts } from "@/lib/db";
import { getResourceById, listResources } from "@/lib/resources";

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

export function generateStaticParams() {
  return listResources().map((resource) => ({
    id: resource.id,
  }));
}

export default async function ResourceDetailPage({
  params,
}: ResourceDetailPageProps) {
  const { id } = await params;
  const resource = getResourceById(id);

  if (!resource) {
    notFound();
  }

  const topicAliases = Array.from(
    new Set([resource.category, ...(resource.communityTopics ?? [])].map(normalizeLabel)),
  );

  const relatedPosts = listCommunityPosts(20)
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
    .map((item) => item.post);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Resource Detail</p>
        <h1>{resource.title}</h1>
        <p className="hero-lead">{resource.description}</p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Resource overview"
            title="Helpful details at a glance."
            intro="This page is designed to make support options easier to understand and revisit."
          />

          <article className="feature-card">
            <div className="thread-card__meta">
              <div>
                <h3>{resource.title}</h3>
                <p>{resource.location}</p>
              </div>
              <span className="tag-chip">
                {resource.verified ? "Verified" : "Community Shared"}
              </span>
            </div>

            <p>{resource.description}</p>

            <div className="stack-list">
              <p className="meta-copy">
                <strong>Category:</strong> {resource.category}
              </p>
              <p className="meta-copy">
                <strong>Age group:</strong> {resource.ageGroup}
              </p>
              <p className="meta-copy">
                <strong>Location:</strong> {resource.location}
              </p>
              {resource.communityTopics?.length ? (
                <p className="meta-copy">
                  <strong>Related topics:</strong> {resource.communityTopics.join(", ")}
                </p>
              ) : null}
            </div>

            {resource.link ? (
              <div style={{ marginTop: "1rem" }}>
                <a
                  className="button-primary"
                  href={resource.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit resource
                </a>
              </div>
            ) : null}
          </article>

          <div className="form-card" style={{ marginTop: "1.5rem" }}>
            <h3>What to consider</h3>
            <ul className="bullet-list bullet-list--wide">
              <li>
                Check whether this resource fits your current life stage and support goals.
              </li>
              <li>
                Confirm availability, pricing, and intake requirements before relying on it.
              </li>
              <li>
                Use lived experience and professional guidance together when making decisions.
              </li>
            </ul>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Related discussions"
            title="Community conversations connected to this resource."
            intro="Support becomes more useful when practical resources and lived experience can work together."
          />

          {relatedPosts.length > 0 ? (
            <div className="stack-list">
              {relatedPosts.slice(0, 4).map((post) => (
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
                No related discussions have been posted yet for this topic. This could be a meaningful place to start the conversation.
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
        <div className="section-panel">
          <SectionHeading
            eyebrow="Keep exploring"
            title="More ways to find the right fit."
            intro="Support works best when people can compare options without feeling overwhelmed."
          />

          <div className="card-grid card-grid--two">
            <Link className="feature-card" href="/resources">
              <h3>Browse more resources</h3>
              <p>Return to the directory and compare other support options.</p>
            </Link>

            <Link className="feature-card" href="/community">
              <h3>Ask the community</h3>
              <p>See what others have shared about similar questions and experiences.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
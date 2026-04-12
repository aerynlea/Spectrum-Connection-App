import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { createCommunityPostAction } from "@/app/actions";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { communityTopicOptions } from "@/lib/catalog";
import { listCommunityPosts } from "@/lib/data";
import { formatDateTime } from "@/lib/formatters";
import { isClerkConfigured } from "@/lib/platform";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import { communityTopics, safetyCommitments } from "@/lib/site-data";

type CommunityPageProps = {
  searchParams?: PageSearchParams;
};

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const posts = await listCommunityPosts(12);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Community Space</p>
        <h1>A live support network for questions, encouragement, and shared wisdom.</h1>
        <p className="hero-lead">
          Community is now more than a preview. Signed-in members can post new
          threads directly into the shared feed while still benefiting from
          safety guidance and clear topic areas.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Support circles"
            intro="Forums stay useful when they are small enough to feel personal and specific enough to stay relevant."
            title="Topic-based groups help users find the right room."
          />
          <div className="card-grid card-grid--two">
            {communityTopics.map((topic) => (
              <article className="feature-card" key={topic.title}>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                <p className="feature-label">{topic.moderators}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Post to the forum"
            intro="This form writes directly into the app-backed community feed."
            title={
              currentUser
                ? "Share a question, win, or practical tip."
                : "Sign in to join the conversation."
            }
          />
          {currentUser ? (
            <form action={createCommunityPostAction} className="form-card">
              <div className="field-grid">
                <label className="field">
                  <span>Topic</span>
                  <select defaultValue={communityTopicOptions[0]} name="topic" required>
                    {communityTopicOptions.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Tag</span>
                  <input
                    maxLength={40}
                    name="tag"
                    placeholder="Helpful Tips"
                    required
                    type="text"
                  />
                </label>
              </div>
              <label className="field">
                <span>Title</span>
                <input
                  maxLength={100}
                  name="title"
                  placeholder="What would you like support with?"
                  required
                  type="text"
                />
              </label>
              <label className="field">
                <span>Post body</span>
                <textarea
                  name="body"
                  placeholder="Share your context, question, or encouragement here."
                  required
                  rows={6}
                />
              </label>
              <button className="button-primary" type="submit">
                Publish post
              </button>
            </form>
          ) : (
            <div className="empty-state">
              <p>
                Account access is required for posting so conversations stay tied
                to real profiles and the support feed can remain more accountable.
              </p>
              <Link
                className="button-primary"
                href={isClerkConfigured ? "/sign-in" : "/auth"}
              >
                Sign in to post
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Live forum feed"
            intro="The posts below are coming from the database and update as new members contribute."
            title="Helpful conversations that move people forward."
          />
          <div className="stack-list">
            {posts.map((thread) => (
              <article className="thread-card" key={thread.id}>
                <div className="thread-card__meta">
                  <div>
                    <h3>{thread.authorName}</h3>
                    <p>
                      {thread.authorRole} • {formatDateTime(thread.createdAt)}
                    </p>
                  </div>
                  <span className="tag-chip">{thread.tag}</span>
                </div>
                <h4>{thread.title}</h4>
                <p>{thread.body}</p>
                <p className="meta-copy">{thread.topic}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Safety"
            intro="A strong support platform needs clear expectations, consistent moderation, and flexible privacy settings."
            title="Trust is designed into the experience."
          />
          <ul className="bullet-list bullet-list--wide">
            {safetyCommitments.map((commitment) => (
              <li key={commitment}>{commitment}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

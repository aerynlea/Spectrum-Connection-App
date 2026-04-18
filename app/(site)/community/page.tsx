import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import {
  createCommunityPostAction,
  createCommunityReplyAction,
} from "@/app/actions";
import { ReportConcernForm } from "@/components/report-concern-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { communityTopicOptions } from "@/lib/catalog";
import { listCommunityPosts, listCommunityReplies } from "@/lib/data";
import { formatDateTime } from "@/lib/formatters";
import { isClerkConfigured } from "@/lib/platform";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import { communityTopics, safetyCommitments } from "@/lib/site-data";

type CommunityPageProps = {
  searchParams?: PageSearchParams;
};

function getTrustLabel(authorRole: string) {
  return authorRole.toLowerCase().includes("professional")
    ? "Professional insight"
    : "Community voice";
}

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const posts = await listCommunityPosts(12);
  const replies = await listCommunityReplies();
  const repliesByPost = replies.reduce<Map<string, typeof replies>>((groups, reply) => {
    const next = groups.get(reply.postId) ?? [];
    next.push(reply);
    groups.set(reply.postId, next);
    return groups;
  }, new Map());

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Community</p>
        <h1>A live support network for questions, encouragement, and shared wisdom.</h1>
        <p className="hero-lead">
          Ask questions, share what is working, and hear from people who
          understand both the practical details and the emotions behind them.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Support circles"
            intro="Smaller, clearly named spaces make it easier to find the right conversation without feeling lost."
            title="Find the room that fits your question."
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
            eyebrow="Start a conversation"
            intro="Start a conversation when you need ideas, encouragement, or a place to share progress."
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
                Share with the community
              </button>
            </form>
          ) : (
            <div className="empty-state">
              <p>
                Signing in keeps conversations welcoming and helps everyone get
                to know the people they are learning from.
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
            eyebrow="Recent conversations"
            intro="See what families, self-advocates, and professionals are talking about right now."
            title="Questions, encouragement, and answers in one place."
          />
          <div className="stack-list">
            {posts.map((thread) => (
              <article className="thread-card" id={thread.id} key={thread.id}>
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
                <p className="feature-label">{getTrustLabel(thread.authorRole)}</p>
                <p>{thread.body}</p>
                <p className="meta-copy">{thread.topic}</p>
                <ReportConcernForm
                  canReport={Boolean(currentUser)}
                  returnTo={`/community#${thread.id}`}
                  targetId={thread.id}
                  targetType="community-post"
                />
                <div className="reply-list">
                  {(repliesByPost.get(thread.id) ?? []).map((reply) => (
                    <article className="reply-card" id={reply.id} key={reply.id}>
                      <p className="feature-label">
                        {reply.authorName} • {reply.authorRole} •{" "}
                        {formatDateTime(reply.createdAt)}
                      </p>
                      <p>{reply.body}</p>
                      <p className="meta-copy">{getTrustLabel(reply.authorRole)}</p>
                      <ReportConcernForm
                        canReport={Boolean(currentUser)}
                        compact
                        returnTo={`/community#${reply.id}`}
                        targetId={reply.id}
                        targetType="community-reply"
                      />
                    </article>
                  ))}
                </div>
                {currentUser ? (
                  <form action={createCommunityReplyAction} className="reply-form">
                    <input name="postId" type="hidden" value={thread.id} />
                    <textarea
                      name="body"
                      placeholder="Reply with encouragement, a helpful idea, or a resource that worked for you."
                      required
                      rows={3}
                    />
                    <button className="button-secondary" type="submit">
                      Reply to this post
                    </button>
                  </form>
                ) : (
                  <p className="meta-copy">
                    Sign in to reply and stay part of the conversation.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Safety"
            intro="Clear expectations, private reporting, and gentle moderation help people share openly and return with confidence."
            title="Safety, trust, and kindness come first."
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

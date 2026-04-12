import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { BrandMark } from "@/components/brand-mark";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { getStats, listCommunityPosts, listEvents, listResources } from "@/lib/data";
import { formatMonthDay } from "@/lib/formatters";
import { isClerkConfigured } from "@/lib/platform";
import { buildRecommendations } from "@/lib/recommendations";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import {
  ageTracks,
  audienceGroups,
  featureCards,
  professionalRoles,
} from "@/lib/site-data";

type HomePageProps = {
  searchParams?: PageSearchParams;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const stats = await getStats();
  const posts = await listCommunityPosts(3);
  const events = await listEvents();
  const resources = await listResources(currentUser?.id);
  const recommendations = currentUser
    ? buildRecommendations(currentUser, resources, events)
    : null;

  return (
    <div className="page">
      <StatusBanner message={message} />

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Autism-focused community and resource hub</p>
          <h1>Where every family, self-advocate, and support team can find direction.</h1>
          <p className="hero-lead">
            Guiding Light now includes working account flows, saved resources,
            community posting, and profile-based recommendations so support can
            begin to feel personal instead of generic.
          </p>
          <div className="button-row">
            <Link
              className="button-primary"
              href={
                currentUser
                  ? "/dashboard"
                  : isClerkConfigured
                    ? "/sign-up"
                    : "/auth"
              }
            >
              {currentUser ? "Open your dashboard" : "Create an account"}
            </Link>
            <Link className="button-secondary" href="/resources">
              Explore live resources
            </Link>
          </div>
          <div className="pill-list" aria-label="Audience groups">
            {audienceGroups.map((group) => (
              <span className="pill" key={group}>
                {group}
              </span>
            ))}
          </div>
          <div className="stats-grid">
            <article className="stat-card">
              <strong>{stats.resourcesCount}</strong>
              <span>Seeded resources</span>
            </article>
            <article className="stat-card">
              <strong>{stats.postsCount}</strong>
              <span>Community threads</span>
            </article>
            <article className="stat-card">
              <strong>{stats.usersCount}</strong>
              <span>Registered members</span>
            </article>
            <article className="stat-card">
              <strong>{stats.savedCount}</strong>
              <span>Resources saved</span>
            </article>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel__header">
            <div>
              <p className="panel-kicker">
                {currentUser ? `Welcome back, ${currentUser.name}` : "Guiding Light"}
              </p>
              <h2>
                {currentUser
                  ? "Your profile now shapes what the platform shows first."
                  : "Support + empowerment, designed as a daily companion."}
              </h2>
            </div>
            <div className="hero-mark">
              <BrandMark size={104} />
            </div>
          </div>

          <div className="action-pill-row">
            <span className="action-pill action-pill--blue">Connect</span>
            <span className="action-pill action-pill--purple">Save</span>
            <span className="action-pill action-pill--coral">Support</span>
          </div>

          <div className="mini-grid">
            {recommendations ? (
              <>
                {recommendations.resources.slice(0, 2).map((resource) => (
                  <article className="mini-card mini-card--highlight" key={resource.id}>
                    <p className="mini-card__label">Recommended for you</p>
                    <h3>{resource.title}</h3>
                    <p>{resource.reasons[0] ?? resource.summary}</p>
                  </article>
                ))}
                {recommendations.events.slice(0, 1).map((event) => {
                  const { month, day } = formatMonthDay(event.eventDate);

                  return (
                    <article className="mini-card" key={event.id}>
                      <p className="mini-card__label">Next matched event</p>
                      <h3>{event.title}</h3>
                      <p>
                        {month} {day} • {event.format} • {event.location}
                      </p>
                    </article>
                  );
                })}
              </>
            ) : (
              <>
                <article className="mini-card">
                  <p className="mini-card__label">Personalized pathways</p>
                  <h3>Age, goals, and location shape what users see first.</h3>
                  <p>
                    Sign in to save resources, tailor your profile, and get
                    recommendations matched to your stage and support goals.
                  </p>
                </article>
                <article className="mini-card">
                  <p className="mini-card__label">Live support circle</p>
                  <h3>Community conversations stay practical and encouraging.</h3>
                  <p>
                    Topic-based groups help members ask questions, share wins,
                    and learn from people who understand the day-to-day reality.
                  </p>
                </article>
                <article className="mini-card mini-card--highlight">
                  <p className="mini-card__label">Verified guidance</p>
                  <h3>Professionals can add credible input without replacing lived experience.</h3>
                  <p>
                    Therapists, educators, and advocates share workshops,
                    answers, and curated resources alongside peer voices.
                  </p>
                </article>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Built for every stage"
          intro="The product is organized around real-life transitions so support stays relevant from first questions through adulthood."
          title="One platform, different paths for different seasons."
        />
        <div className="card-grid card-grid--five">
          {ageTracks.map((track) => (
            <article className="feature-card age-card" key={track.title}>
              <p className="feature-label">{track.subtitle}</p>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
              <ul className="bullet-list">
                {track.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="What is working now"
          intro="This first functional slice moves the project beyond static concept pages into a usable experience."
          title="The MVP now supports core day-to-day product flows."
        />
        <div className="card-grid card-grid--three">
          {featureCards.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <p className="feature-label">{feature.label}</p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Community preview"
            intro="The community feed is now backed by stored threads, and signed-in users can post directly from the app."
            title="Helpful conversations that keep growing."
          />
          <div className="stack-list">
            {posts.map((thread) => (
              <article className="thread-card" key={thread.id}>
                <div className="thread-card__meta">
                  <div>
                    <h3>{thread.authorName}</h3>
                    <p>
                      {thread.authorRole} • {thread.topic}
                    </p>
                  </div>
                  <span className="tag-chip">{thread.tag}</span>
                </div>
                <h4>{thread.title}</h4>
                <p>{thread.body}</p>
              </article>
            ))}
          </div>
          <Link className="text-link" href="/community">
            Visit the community feed
          </Link>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Professional access"
            intro="Verified professionals remain distinct from peer voices while still contributing trusted guidance and local opportunities."
            title="A directory that respects both expertise and lived experience."
          />
          <div className="card-grid card-grid--two">
            {professionalRoles.slice(0, 2).map((role) => (
              <article className="feature-card feature-card--flat" key={role.title}>
                <p className="feature-label">{role.focus}</p>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </article>
            ))}
          </div>
          <Link className="text-link" href="/professionals">
            Explore the verified network
          </Link>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Next best step</p>
          <h2>
            {currentUser
              ? "Keep shaping your recommendations from the dashboard."
              : "Create a profile to unlock saved resources and tailored support."}
          </h2>
          <p>
            The app now persists profiles, bookmarks, and community posts
            through a deployment-ready data layer with local fallback and
            hosted-mode support for Neon and Clerk.
          </p>
        </div>
        <div className="button-row">
          <Link
            className="button-primary"
            href={
              currentUser
                ? "/dashboard"
                : isClerkConfigured
                  ? "/sign-up"
                  : "/auth"
            }
          >
            {currentUser ? "Go to dashboard" : "Get started"}
          </Link>
          <Link className="button-secondary" href="/community">
            See live discussions
          </Link>
        </div>
      </section>
    </div>
  );
}

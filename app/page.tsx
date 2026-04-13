import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { BrandMark } from "@/components/brand-mark";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { getStats, listCommunityPosts, listEvents, listResources } from "@/lib/data";
import { formatMonthDay } from "@/lib/formatters";
import { homeGlobalHighlights } from "@/lib/global-voices";
import { isClerkConfigured } from "@/lib/platform";
import { buildRecommendations } from "@/lib/recommendations";
import { getResourceQuickStartSummaries } from "@/lib/resources";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import {
  ageTracks,
  audienceGroups,
  featureCards,
  founderStoryHighlights,
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
  const digitalQuickStarts = getResourceQuickStartSummaries(resources);

  return (
    <div className="page">
      <StatusBanner message={message} />

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Autism-focused support, community, and trusted resources</p>
          <h1>Where every family, self-advocate, and support team can find direction.</h1>
          <p className="hero-lead">
            Create a profile, save the resources that matter most, and discover
            support that feels more relevant to your stage of life, goals, and
            day-to-day needs.
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
              {currentUser ? "Open your space" : "Create your profile"}
            </Link>
            <Link className="button-secondary" href="/resources">
              Browse support
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
              <span>Helpful resources</span>
            </article>
            <article className="stat-card">
              <strong>{stats.postsCount}</strong>
              <span>Community conversations</span>
            </article>
            <article className="stat-card">
              <strong>{stats.usersCount}</strong>
              <span>Community members</span>
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
                  ? "Your space is ready with support that fits your priorities."
                  : "A calm place to connect, explore, and feel supported."}
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
                    <p className="mini-card__label">Picked for you</p>
                    <h3>{resource.title}</h3>
                    <p>{resource.reasons[0] ?? resource.summary}</p>
                  </article>
                ))}
                {recommendations.events.slice(0, 1).map((event) => {
                  const { month, day } = formatMonthDay(event.eventDate);

                  return (
                    <article className="mini-card" key={event.id}>
                      <p className="mini-card__label">Upcoming event for you</p>
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
                  <p className="mini-card__label">Support made personal</p>
                  <h3>Start with what matters most to you.</h3>
                  <p>
                    Create a profile to save resources and surface options that
                    fit your stage of life, location, and current goals.
                  </p>
                </article>
                <article className="mini-card">
                  <p className="mini-card__label">Community conversations</p>
                  <h3>Questions, wins, and honest advice all have a place here.</h3>
                  <p>
                    Topic-based groups help members ask for support, celebrate
                    progress, and learn from people who understand real life.
                  </p>
                </article>
                <article className="mini-card mini-card--highlight">
                  <p className="mini-card__label">Trusted guidance</p>
                  <h3>Professional insight sits alongside lived experience.</h3>
                  <p>
                    Therapists, educators, and advocates can share workshops,
                    answers, and resources while community voices stay central.
                  </p>
                </article>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section founder-story">
        <div className="founder-story__copy">
          <p className="eyebrow">Why Guiding Light Exists</p>
          <h2>Built from one mother&apos;s lived experience and the power of a village that shows up.</h2>
          <p className="hero-lead">
            Motherhood is a blessing, and it can also be deeply challenging to
            navigate. You want the world to see your little one the way you do:
            loving, special, and full of possibility. In the hardest moments,
            hope becomes its own kind of strength, helping you keep going and
            trust that things can turn out okay.
          </p>
          <p className="founder-story__text">
            My son was diagnosed at the age of two and a half. We are
            homeschooling right now, and we were fortunate to receive ABA
            services as quickly as we did. Even with that support, I learned
            early on that I would not have made it without community.
          </p>
          <p className="founder-story__text">
            As a 32-year-old single mother navigating co-parenting, I have been
            deeply blessed by a village that showed up for us, especially the
            wonderful, intentional therapists who have walked beside our family
            over the last four years. Guiding Light is the space I wanted to
            create for other families and autistic people who need connection,
            encouragement, and real-life support.
          </p>
          <div className="pill-list" aria-label="Founder story highlights">
            {founderStoryHighlights.map((highlight) => (
              <span className="pill" key={highlight}>
                {highlight}
              </span>
            ))}
          </div>
        </div>

        <div className="founder-gallery">
          <article className="founder-gallery__hero">
            <Image
              alt="A joyful portrait of the app founder and her six-year-old son together."
              className="founder-photo"
              height={1600}
              priority
              src="/family/founder-mother-son-1.jpeg"
              width={1200}
            />
          </article>
          <article className="founder-gallery__card founder-gallery__card--warm">
            <Image
              alt="The founder and her son smiling together on a blue chair."
              className="founder-photo"
              height={1400}
              src="/family/founder-mother-son-2.jpeg"
              width={1200}
            />
          </article>
          <article className="founder-gallery__card">
            <Image
              alt="A portrait of the founder's son smiling in glasses."
              className="founder-photo"
              height={1400}
              src="/family/founder-son-portrait-1.jpeg"
              width={1200}
            />
          </article>
          <article className="founder-gallery__card founder-gallery__card--accent">
            <Image
              alt="A portrait of the founder's son sitting proudly in a Cars jacket."
              className="founder-photo"
              height={1400}
              src="/family/founder-son-portrait-2.jpeg"
              width={1200}
            />
          </article>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Global voices"
          intro="Families across the world use different words, but many of the hopes sound familiar: belonging, dignity, support, and being seen sooner and more fully."
          title="See how the spectrum is talked about beyond one place."
        />
        <div className="card-grid card-grid--three">
          {homeGlobalHighlights.map((highlight) => (
            <article className="feature-card" key={highlight.title}>
              <p className="feature-label">{highlight.label}</p>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </article>
          ))}
        </div>
        <div className="button-row">
          <Link className="button-secondary" href="/global-voices">
            Explore global voices
          </Link>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Helpful places to start"
          intro="These starting points bring together the kinds of support families often end up searching for across multiple tabs."
          title="Open the kind of help your family needs today."
        />
        <div className="card-grid card-grid--five">
          {digitalQuickStarts.map((quickStart) => (
            <Link
              className="feature-card"
              href={{
                pathname: "/resources",
                query: { collection: quickStart.collectionName },
              }}
              key={quickStart.slug}
            >
              <p className="feature-label">
                {quickStart.eyebrow} • {quickStart.count} links
              </p>
              <h3>{quickStart.title}</h3>
              <p>{quickStart.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Built for every stage"
          intro="Support is grouped around real-life transitions so it stays relevant from first questions through adulthood."
          title="Support for every season of life."
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
          eyebrow="How Guiding Light helps"
          intro="Every part of Guiding Light is meant to make support feel clearer, calmer, and easier to act on."
          title="Helpful support for everyday life."
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
            eyebrow="Community voices"
            intro="Browse real conversations, find reassurance, and join in when you are ready."
            title="Conversations that meet you where you are."
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
            eyebrow="Trusted professionals"
            intro="Families can hear from trusted professionals while keeping the warmth and honesty of peer support close by."
            title="Professional guidance alongside lived experience."
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
            Meet trusted professionals
          </Link>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">When you&apos;re ready</p>
          <h2>
            {currentUser
              ? "Keep shaping a support space that fits your needs."
              : "Create a profile so the support you need is easier to return to."}
          </h2>
          <p>
            Keep your priorities, saved resources, and helpful conversations in
            one place so each visit feels a little easier than the last.
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
            {currentUser ? "Go to your space" : "Get started"}
          </Link>
          <Link className="button-secondary" href="/community">
            See community conversations
          </Link>
        </div>
      </section>
    </div>
  );
}

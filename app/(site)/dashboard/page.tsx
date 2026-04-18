import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { SaveResourceForm } from "@/components/save-resource-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { requireCurrentUser } from "@/lib/auth";
import {
  listCommunityPosts,
  listEvents,
  listResources,
  listSavedResources,
} from "@/lib/data";
import {
  formatAgeGroup,
  formatDateTime,
  formatGoal,
  formatMonthDay,
  formatRole,
} from "@/lib/formatters";
import { partitionByLocation } from "@/lib/location";
import { buildPremiumRoadmap } from "@/lib/membership";
import { buildRecommendations } from "@/lib/recommendations";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import { profileQuotes } from "@/lib/site-data";

type DashboardPageProps = {
  searchParams?: PageSearchParams;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  noStore();

  const currentUser = await requireCurrentUser();
  if (!currentUser.onboardingCompleted) {
    redirect("/onboarding");
  }

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const resources = await listResources(currentUser.id);
  const savedResources = await listSavedResources(currentUser.id);
  const events = await listEvents();
  const recentPosts = await listCommunityPosts(3);
  const recommendations = buildRecommendations(currentUser, resources, events);
  const eventSections = partitionByLocation(recommendations.events, currentUser.location);
  const goalRoadmap = buildPremiumRoadmap(currentUser);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Your Space</p>
        <h1>Your support space reflects what matters most to you.</h1>
        <p className="hero-lead">
          Save what matters, keep your profile current, and move easily between
          resources, events, and community support.
        </p>
        <div className="pill-list">
          {currentUser.goals.map((goal) => (
            <span className="pill" key={goal}>
              {formatGoal(goal)}
            </span>
          ))}
        </div>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="stats-grid">
        <article className="stat-card stat-card--wide">
          <strong>{savedResources.length}</strong>
          <span>Saved resources</span>
        </article>
        <article className="stat-card stat-card--wide">
          <strong>{recommendations.resources.length}</strong>
          <span>Support picks for you</span>
        </article>
        <article className="stat-card stat-card--wide">
          <strong>{recommendations.events.length}</strong>
          <span>Upcoming events</span>
        </article>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Free access"
            intro="Guiding Light is staying focused on access, guidance, and connection without locking support behind a paid layer."
            title="Your guide stays open and free."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Resources stay open</h3>
                <p>Families can keep opening real links, event pages, and practical tools without a paywall.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>Community stays reachable</h3>
                <p>Message-board support, shared experiences, and encouragement remain part of the main experience.</p>
              </div>
            </article>
            <article className="support-step">
              <span>03</span>
              <div>
                <h3>Your saved space still matters</h3>
                <p>Profiles, saved links, and your next-step view keep helping you return to what matters most.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Your next steps"
            intro="These are still shaped around the goals you chose, without asking you to upgrade to keep the basics close."
            title="A simple roadmap to keep nearby."
          />
          <div className="stack-list">
            {goalRoadmap.map((item) => (
              <article className="sub-card" key={item.goal}>
                <p className="feature-label">{formatGoal(item.goal)}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Your profile"
            intro="A few details help Guiding Light bring forward support that feels more relevant to you."
            title="Keep your information up to date."
          />
          <ProfileForm currentUser={currentUser} />
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Profile snapshot"
            intro="This is the information Guiding Light is using right now."
            title="Your current profile at a glance."
          />
          <article className="sub-card">
            <h3>{currentUser.name}</h3>
            <p>{currentUser.location}</p>
            <div className="pill-list pill-list--compact">
              <span className="pill pill--soft">{formatRole(currentUser.role)}</span>
              <span className="pill pill--soft">{formatAgeGroup(currentUser.ageGroup)}</span>
            </div>
            <div className="pill-list pill-list--compact">
              {currentUser.goals.map((goal) => (
                <span className="pill pill--soft" key={goal}>
                  {formatGoal(goal)}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Picked for you"
            intro="Based on your role, age focus, goals, and what you have already saved."
            title="A helpful place to start today."
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
                    returnTo="/dashboard"
                  />
                </div>
                <div className="pill-list pill-list--compact">
                  {resource.reasons.map((reason) => (
                    <span className="pill pill--soft" key={reason}>
                      {reason}
                    </span>
                  ))}
                </div>
                <div className="resource-meta">
                  <span>{resource.organization}</span>
                  <Link className="text-link" href={resource.href} rel="noreferrer" target="_blank">
                    Visit resource
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Saved resources"
            intro="Keep your most useful finds in one place so they are easy to return to."
            title="What you want to come back to."
          />
          {savedResources.length > 0 ? (
            <div className="stack-list">
              {savedResources.map((resource) => (
                <article className="thread-card" key={resource.id}>
                  <div className="thread-card__meta">
                    <div>
                      <h3>{resource.title}</h3>
                      <p>
                        {resource.collectionName} • {resource.organization}
                      </p>
                    </div>
                    <SaveResourceForm
                      isSaved={resource.isSaved}
                      resourceId={resource.id}
                      returnTo="/dashboard"
                    />
                  </div>
                  <p>{resource.summary}</p>
                  <Link className="text-link" href={resource.href} rel="noreferrer" target="_blank">
                    Visit resource
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                You have not saved any resources yet. Start in the support
                library and save the options that feel useful.
              </p>
              <Link className="button-secondary" href="/resources">
                Explore resources
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Upcoming events"
            intro="A few upcoming events that may feel especially relevant right now."
            title="Events you may want to keep an eye on."
          />
          <div className="stack-list">
            {eventSections.nearby.length > 0
              ? eventSections.nearby.map((event) => {
                  const { month, day } = formatMonthDay(event.eventDate);

                  return (
                    <article className="event-card" key={event.id}>
                      <Link
                        className="event-card__content-link"
                        href={event.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <div className="event-date">
                          <span>{month}</span>
                          <strong>{day}</strong>
                        </div>
                        <div className="event-card__body">
                          <p className="feature-label">
                            Near {currentUser.location} • {event.format}
                          </p>
                          <h3>{event.title}</h3>
                          <p>{event.detail}</p>
                          <p className="event-meta">
                            {formatDateTime(event.eventDate)} • {event.location}
                          </p>
                          <span className="event-card__cta">Open official event page</span>
                        </div>
                      </Link>
                    </article>
                  );
                })
              : recommendations.events.map((event) => {
              const { month, day } = formatMonthDay(event.eventDate);

              return (
                <article className="event-card" key={event.id}>
                  <Link
                    className="event-card__content-link"
                    href={event.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="event-date">
                      <span>{month}</span>
                      <strong>{day}</strong>
                    </div>
                    <div className="event-card__body">
                      <p className="feature-label">
                        {event.format} • {event.audience}
                      </p>
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                      <p className="event-meta">
                        {formatDateTime(event.eventDate)} • {event.location}
                      </p>
                      <span className="event-card__cta">Open official event page</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="More ways to stay connected"
            intro="A wider mix of virtual and national events helps you stay connected even when nothing local fits yet."
            title="National and online options."
          />
          <div className="stack-list">
            {eventSections.broader.slice(0, 3).map((event) => (
              <article className="sub-card" key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
                <p className="meta-copy">
                  {formatDateTime(event.eventDate)} • {event.location}
                </p>
                <Link
                  className="text-link"
                  href={event.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open event page
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Message board"
          intro="Drop into encouraging conversations whenever you want ideas, reassurance, or practical tips."
          title="Support happening in the community today."
        />
        <div className="card-grid card-grid--three">
          {recentPosts.map((post) => (
            <article className="feature-card" key={post.id}>
              <p className="feature-label">{post.topic}</p>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <p className="meta-copy">
                {post.authorName} • {formatDateTime(post.createdAt)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Real voices"
          intro="A few words from autistic advocates and leaders who have helped shape the conversation."
          title="Words worth carrying with you."
        />
        <div className="card-grid card-grid--three">
          {profileQuotes.map((quote) => (
            <article className="feature-card" key={quote.author}>
              <p>{quote.quote}</p>
              <p className="feature-label">
                {quote.author} • {quote.role}
              </p>
              <Link className="text-link" href={quote.href} rel="noreferrer" target="_blank">
                {quote.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

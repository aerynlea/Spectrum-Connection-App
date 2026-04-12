import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { listEvents, listResources } from "@/lib/data";
import { formatDateTime, formatMonthDay } from "@/lib/formatters";
import { buildRecommendations } from "@/lib/recommendations";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type EventsPageProps = {
  searchParams?: PageSearchParams;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const events = await listEvents();
  const recommendations = currentUser
    ? buildRecommendations(currentUser, await listResources(currentUser.id), events)
    : null;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Events and Workshops</p>
        <h1>Bring support into the real world with workshops, meetups, and inclusive gatherings.</h1>
        <p className="hero-lead">
          Event listings are now coming from the app database, and signed-in
          users get a simple fit score based on the same profile signals that
          shape their resource recommendations.
        </p>
      </section>

      <StatusBanner message={message} />

      {recommendations ? (
        <section className="section split-layout">
          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Best fits"
              intro="These are the strongest event matches for your current profile."
              title="Recommended events."
            />
            <div className="stack-list">
              {recommendations.events.map((event) => {
                const { month, day } = formatMonthDay(event.eventDate);

                return (
                  <article className="event-card" key={event.id}>
                    <div className="event-date">
                      <span>{month}</span>
                      <strong>{day}</strong>
                    </div>
                    <div className="event-card__body">
                      <p className="feature-label">
                        Fit score {event.fitScore ?? 0} • {event.format}
                      </p>
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="section-panel">
            <SectionHeading
              eyebrow="Why this matters"
              intro="Events turn information into action, relationships, and routines that last beyond a single browse session."
              title="Support becomes more powerful when people can show up together."
            />
            <p className="panel-copy">
              Events are one of the easiest ways to connect resources,
              professionals, and community support in a single flow.
            </p>
            <Link className="button-secondary" href="/community">
              Continue into community
            </Link>
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeading
          eyebrow="Upcoming listings"
          intro="Every listing below is stored in the app data layer so future scheduling, bookmarks, and reminders can build on real records."
          title="Events tailored to different age groups and roles."
        />
        <div className="stack-list">
          {events.map((event) => {
            const { month, day } = formatMonthDay(event.eventDate);

            return (
              <article className="event-card event-card--full" key={event.id}>
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
                    {formatDateTime(event.eventDate)} • {event.location} • Hosted by{" "}
                    {event.hostName}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

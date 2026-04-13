import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { listEvents, listResources } from "@/lib/data";
import { formatDateTime, formatMonthDay } from "@/lib/formatters";
import { partitionByLocation } from "@/lib/location";
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
  const eventSections = partitionByLocation(events, currentUser?.location);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Events and Workshops</p>
        <h1>Bring support into the real world with workshops, meetups, and inclusive gatherings.</h1>
        <p className="hero-lead">
          Find workshops, gatherings, and virtual sessions that turn helpful
          information into real connection, encouragement, and follow-through.
        </p>
      </section>

      <StatusBanner message={message} />

      {recommendations ? (
        <section className="section split-layout">
          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Best fits"
              intro="These events line up especially well with your interests and stage of life."
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
                        Recommended • {event.format}
                      </p>
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                      <p className="event-meta">
                        {formatDateTime(event.eventDate)} • {event.location}
                      </p>
                      <Link className="text-link" href={event.href} rel="noreferrer" target="_blank">
                        View event details
                      </Link>
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
              Showing up together can turn information into reassurance,
              routine, and a stronger sense of belonging.
            </p>
            <Link className="button-secondary" href="/community">
              Continue into community
            </Link>
          </div>
        </section>
      ) : null}

      {currentUser && eventSections.nearby.length > 0 ? (
        <section className="section">
          <SectionHeading
            eyebrow="Near you"
            intro={`These official listings are the closest match for ${currentUser.location}.`}
            title="Regional events worth watching."
          />
          <div className="stack-list">
            {eventSections.nearby.map((event) => {
              const { month, day } = formatMonthDay(event.eventDate);

              return (
                <article className="event-card event-card--full" key={event.id}>
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
                      {formatDateTime(event.eventDate)} • {event.location} • Hosted by{" "}
                      {event.hostName}
                    </p>
                    <Link
                      className="text-link"
                      href={event.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open official event page
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeading
          eyebrow="National and virtual listings"
          intro="Browse broader opportunities for connection, learning, and practical support."
          title="Official events you can click into right away."
        />
        <div className="stack-list">
          {(currentUser ? eventSections.broader : events).map((event) => {
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
                  <Link className="text-link" href={event.href} rel="noreferrer" target="_blank">
                    Open official event page
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

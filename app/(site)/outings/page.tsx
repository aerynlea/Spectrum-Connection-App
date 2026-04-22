import Link from "next/link";

import { ResourceCard } from "@/components/resources/resource-card";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { listEvents, listResources } from "@/lib/data";
import { formatDateTime, formatMonthDay } from "@/lib/formatters";
import { partitionByLocation } from "@/lib/location";
import { buildResourceCollectionPath } from "@/lib/resources";

type ListedResource = Awaited<ReturnType<typeof listResources>>[number];

const TRAVEL_SUPPORT_RESOURCE_IDS = [
  "autism-speaks-visual-supports",
  "autism-speaks-sensory-issues",
  "tangle-braintools",
  "proloquo2go",
  "td-snap",
  "boardmaker",
];

function pickResources(resources: ListedResource[], ids: string[]) {
  return ids
    .map((id) => resources.find((resource) => resource.id === id))
    .filter((resource): resource is ListedResource => Boolean(resource));
}

export default async function OutingsPage() {
  const [currentUser, events] = await Promise.all([
    getCurrentUser(),
    listEvents(),
  ]);
  const resources = await listResources(currentUser?.id);

  const outingResources = resources.filter(
    (resource) => resource.collectionName === "Theme Parks and Outings",
  );
  const playplaceResources = resources.filter(
    (resource) => resource.collectionName === "Spectrum-Friendly Playplaces",
  );
  const travelSupportResources = pickResources(resources, TRAVEL_SUPPORT_RESOURCE_IDS);
  const inPersonEvents = events.filter((event) => event.format.toLowerCase().includes("person"));

  const outingSections = partitionByLocation(outingResources, currentUser?.location);
  const playplaceSections = partitionByLocation(playplaceResources, currentUser?.location);
  const nearbyFirstStops = [...outingSections.nearby, ...playplaceSections.nearby].slice(0, 6);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Outings guide</p>
        <h1>Plan outings with more predictability, calmer support, and fewer surprises.</h1>
        <p className="hero-lead">
          Use this page to plan theme park days, find lower-pressure playplaces,
          and pack support that can make outings feel easier for the whole
          family.
        </p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Before you leave home"
            intro="A little planning can make a bigger day feel more manageable."
            title="Helpful things to check before an outing."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>1</span>
              <div>
                <h3>Look for access support first</h3>
                <p>
                  Check whether the venue offers DAS, autism support, sensory
                  accommodations, or a guest-services process before you go.
                </p>
              </div>
            </article>
            <article className="support-step">
              <span>2</span>
              <div>
                <h3>Find maps and quieter care spaces</h3>
                <p>
                  Knowing where restrooms, nursing rooms, first aid, and calmer
                  spaces are located can help the day feel less rushed.
                </p>
              </div>
            </article>
            <article className="support-step">
              <span>3</span>
              <div>
                <h3>Bring support that travels well</h3>
                <p>
                  Visuals, fidgets, AAC tools, and familiar regulation supports
                  can help keep transitions from feeling overwhelming.
                </p>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What this page helps with"
            intro="These links are here to make real days out feel more approachable."
            title="A calmer way to plan family time outside the house."
          />
          <ul className="bullet-list bullet-list--wide">
            <li>Official theme park access pages for Disneyland, LEGOLAND, Universal, and SeaWorld.</li>
            <li>Sensory-friendly places to jump, play, and explore with less pressure.</li>
            <li>Maps, baby care, and visit-planning pages you can open before the day begins.</li>
            <li>Support tools you can keep nearby for communication, regulation, and transitions.</li>
          </ul>
        </div>
      </section>

      {currentUser && nearbyFirstStops.length > 0 ? (
        <section className="section">
          <SectionHeading
            eyebrow="Closer to you"
            intro={`These look like the best nearby matches for ${currentUser.location}.`}
            title="Places and planning links that may feel easiest to try first."
          />
          <div className="stack-list">
            {nearbyFirstStops.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                returnTo="/outings"
                showSaveAction={Boolean(currentUser)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionHeading
          eyebrow="Plan a bigger day out"
          intro="Start with the official access pages, planning tools, and support details for larger outings."
          title="Theme parks and destination outings."
        />
        <div className="stack-list">
          {(currentUser ? outingSections.broader : outingResources).map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              returnTo="/outings"
              showSaveAction={Boolean(currentUser)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Playplaces"
          intro="These are good options for families who want to try something active without committing to a huge day."
          title="Places to play, move, and explore with less pressure."
        />
        <div className="stack-list">
          {(currentUser ? playplaceSections.broader : playplaceResources).map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              returnTo="/outings"
              showSaveAction={Boolean(currentUser)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Bring support with you"
          intro="These tools can help with speaking, transitions, stimming, focus, and regulation when you are on the move."
          title="Travel-friendly supports to keep nearby."
        />
        <div className="stack-list">
          {travelSupportResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              returnTo="/outings"
              showSaveAction={Boolean(currentUser)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="More ways to show up"
          intro="If you want connection in real life, these gatherings can be another gentle starting point."
          title="Upcoming in-person events to keep an eye on."
        />
        <div className="stack-list">
          {inPersonEvents.slice(0, 3).map((event) => {
            const { month, day } = formatMonthDay(event.eventDate);

            return (
              <article className="event-card event-card--full" key={event.id}>
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
                      {event.audience} • {event.format}
                    </p>
                    <h3>{event.title}</h3>
                    <p>{event.detail}</p>
                    <p className="event-meta">
                      {formatDateTime(event.eventDate)} • {event.location} • Hosted by{" "}
                      {event.hostName}
                    </p>
                    <span className="event-card__cta">Open official event page</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Keep planning</p>
          <h2>Save your favorite outing ideas and keep the conversation going.</h2>
          <p>
            If you find a place that worked well, the community page is a great
            place to share what helped and what you would do again.
          </p>
        </div>
        <div className="button-row">
          <Link
            className="button-primary"
            href={buildResourceCollectionPath("theme-park-outings")}
          >
            Browse outing links
          </Link>
          <Link className="button-secondary" href="/community">
            Share with the community
          </Link>
        </div>
      </section>
    </div>
  );
}

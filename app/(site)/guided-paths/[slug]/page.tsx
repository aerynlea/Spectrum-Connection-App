import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import {
  listCommunityPosts,
  listEvents,
  listProfessionals,
  listResources,
} from "@/lib/data";
import {
  buildGuidedPathwayAudienceSummary,
  buildGuidedPathwayMatches,
  getGuidedPathwayBySlug,
  getFeaturedGuidedPathways,
} from "@/lib/guided-pathways";
import { isClerkConfigured } from "@/lib/platform";

type GuidedPathwayDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export default async function GuidedPathwayDetailPage({
  params,
}: GuidedPathwayDetailPageProps) {
  const { slug } = await params;
  const pathway = getGuidedPathwayBySlug(slug);

  if (!pathway) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const [resources, events, professionals, communityPosts] = await Promise.all([
    listResources(currentUser?.id),
    listEvents(),
    listProfessionals(),
    listCommunityPosts(10),
  ]);

  const matches = buildGuidedPathwayMatches(pathway, {
    communityPosts,
    events,
    professionals,
    resources,
    user: currentUser,
  });
  const audienceSummary = buildGuidedPathwayAudienceSummary(pathway);
  const relatedPathways = getFeaturedGuidedPathways(currentUser, 4).filter(
    (item) => item.slug !== pathway.slug,
  );
  const accountHref = currentUser ? "/dashboard" : isClerkConfigured ? "/sign-up" : "/auth";

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">{pathway.eyebrow}</p>
        <h1>{pathway.title}</h1>
        <p className="hero-lead">{pathway.intro}</p>
        <div className="pill-list">
          {audienceSummary.goals.map((goal) => (
            <span className="pill" key={`${pathway.slug}-${goal}`}>
              {goal}
            </span>
          ))}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Who this helps"
            intro={pathway.audienceLabel}
            title="Use this path when these moments feel familiar."
          />
          <div className="stack-list">
            <article className="sub-card">
              <h3>Helpful when</h3>
              <ul className="bullet-list bullet-list--wide">
                {pathway.helpfulWhen.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="sub-card">
              <h3>Most connected to</h3>
              <div className="pill-list pill-list--compact">
                {audienceSummary.roles.map((role) => (
                  <span className="pill pill--soft" key={`${pathway.slug}-${role}`}>
                    {role}
                  </span>
                ))}
                {audienceSummary.ageGroups.map((ageGroup) => (
                  <span className="pill pill--soft" key={`${pathway.slug}-${ageGroup}`}>
                    {ageGroup}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="What to do now"
            intro="This is the calmer order of action Guiding Light recommends first."
            title="Your first three steps."
          />
          <div className="support-steps support-steps--column">
            {pathway.steps.map((step, index) => (
              <article className="support-step" key={step.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Bring these with you"
            intro="You do not need every document before taking action. This list is just meant to lower the scramble."
            title="What to prepare."
          />
          <ul className="bullet-list bullet-list--wide">
            {pathway.whatToPrepare.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Questions worth asking"
            intro="You can screenshot these, jot them down, or bring them into meetings and calls."
            title="Keep your questions close."
          />
          <ul className="bullet-list bullet-list--wide">
            {pathway.questionsToAsk.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Trusted next links"
          intro="These matches are pulled from the support already inside Guiding Light and moved closer to the top for this path."
          title="Open the most relevant help first."
        />
        <div className="card-grid card-grid--two">
          {matches.resources.map((resource) => (
            <article className="feature-card pathway-card" key={resource.id}>
              <p className="feature-label">
                {resource.collectionName} • {resource.organization}
              </p>
              <h3>{resource.title}</h3>
              <p>{resource.summary}</p>
              <div className="button-row button-row--compact">
                <Link
                  className="button-primary"
                  href={resource.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open official site
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="People and providers"
            intro="These are the professionals and programs that feel most connected to this path right now."
            title="Professional support to keep nearby."
          />
          <div className="stack-list">
            {matches.professionals.length > 0 ? (
              matches.professionals.map((professional) => (
                <article className="sub-card" key={professional.id}>
                  <p className="feature-label">
                    {professional.organization} • {professional.location}
                  </p>
                  <h3>{professional.name}</h3>
                  <p>{professional.summary}</p>
                  <div className="button-row button-row--compact">
                    <Link
                      className="button-secondary"
                      href={professional.href}
                      rel={isExternalHref(professional.href) ? "noreferrer" : undefined}
                      target={isExternalHref(professional.href) ? "_blank" : undefined}
                    >
                      Open support page
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <p>
                  More professional matches will keep appearing here as Guiding
                  Light grows. You can still browse the full professionals page
                  anytime.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Community and events"
            intro="Sometimes the most helpful next step is hearing from people who recognize this stage right away."
            title="Support that feels human, not only informational."
          />
          <div className="stack-list">
            {matches.communityPosts.slice(0, 1).map((post) => (
              <article className="sub-card" key={post.id}>
                <p className="feature-label">
                  Community • {post.authorName}
                </p>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <Link className="text-link" href="/community">
                  Read more community conversations
                </Link>
              </article>
            ))}

            {matches.events.slice(0, 2).map((event) => (
              <article className="sub-card" key={event.title}>
                <p className="feature-label">
                  {event.hostName} • {event.format}
                </p>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
                <div className="button-row button-row--compact">
                  <Link
                    className="button-secondary"
                    href={event.href}
                    rel={isExternalHref(event.href) ? "noreferrer" : undefined}
                    target={isExternalHref(event.href) ? "_blank" : undefined}
                  >
                    Open event details
                  </Link>
                </div>
              </article>
            ))}

            {matches.communityPosts.length === 0 && matches.events.length === 0 ? (
              <div className="empty-state">
                <p>
                  More community and event matches will land here over time.
                  You can still browse the main community and events pages now.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {relatedPathways.length > 0 ? (
        <section className="section">
          <SectionHeading
            eyebrow="If this is close, but not quite it"
            intro="You may need a different kind of next-step path depending on where your week is headed."
            title="Related support paths."
          />
          <div className="card-grid card-grid--three">
            {relatedPathways.slice(0, 3).map((item) => (
              <article className="feature-card pathway-card" key={item.slug}>
                <p className="feature-label">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link className="button-secondary" href={`/guided-paths/${item.slug}`}>
                  Open this path
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Keep moving forward</p>
          <h2>Use the path, save what helps, and come back when you need the next step.</h2>
          <p>
            Guided pathways are meant to reduce overwhelm, not add more of it.
            Start with one step, open one trusted link, and let the rest wait
            until it is needed.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-primary" href={accountHref}>
            {currentUser ? "Go to my dashboard" : "Create my profile"}
          </Link>
          <Link className="button-secondary" href="/resources">
            Browse all resources
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import {
  buildGuidedPathwayAudienceSummary,
  getFeaturedGuidedPathways,
  listGuidedPathways,
} from "@/lib/guided-pathways";

export default async function GuidedPathsPage() {
  const currentUser = await getCurrentUser();
  const pathways = listGuidedPathways();
  const featuredPathways = getFeaturedGuidedPathways(currentUser, 2);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Guided pathways</p>
        <h1>Calmer step-by-step support for the questions families ask first.</h1>
        <p className="hero-lead">
          Choose a real-life situation and let Guiding Light gather a clearer
          starting point: what to do now, what to prepare, what to ask, and
          which trusted links matter most first.
        </p>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What this solves"
            intro="Guided pathways help turn support from a big search into a calmer next step."
            title="A support guide that answers, “What do I do first?”"
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Start from a real-life moment</h3>
                <p>Pick the situation that feels most urgent right now instead of searching everything at once.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>See a calmer order of action</h3>
                <p>Each path lays out what to prepare, what to ask, and which supports are worth opening first.</p>
              </div>
            </article>
            <article className="support-step">
              <span>03</span>
              <div>
                <h3>Move forward without starting over</h3>
                <p>Use the matching resources, events, professionals, and community support to keep momentum going.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow={currentUser ? "A personalized start" : "Popular first steps"}
            intro={
              currentUser
                ? "Based on your profile, these pathways are likely to feel most useful first."
                : "These are the four highest-need starting points Guiding Light is opening with."
            }
            title={currentUser ? "Most relevant for your profile." : "Choose the path that feels closest to your life."}
          />
          <div className="stack-list">
            {featuredPathways.map((pathway) => (
              <article className="sub-card" key={`featured-${pathway.slug}`}>
                <p className="feature-label">{pathway.eyebrow}</p>
                <h3>{pathway.title}</h3>
                <p>{pathway.summary}</p>
                <Link className="button-secondary" href={`/guided-paths/${pathway.slug}`}>
                  Open this path
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Four ways to begin"
          intro="These starter pathways are shaped around the most common support crossroads families and self-advocates face first."
          title="Choose the kind of support path you need today."
        />
        <div className="card-grid card-grid--two">
          {pathways.map((pathway) => {
            const audienceSummary = buildGuidedPathwayAudienceSummary(pathway);

            return (
              <article className="feature-card pathway-card" key={pathway.slug}>
                <p className="feature-label">{pathway.eyebrow}</p>
                <h3>{pathway.title}</h3>
                <p>{pathway.summary}</p>
                <div className="pill-list pill-list--compact">
                  {audienceSummary.goals.slice(0, 2).map((goal) => (
                    <span className="pill pill--soft" key={`${pathway.slug}-${goal}`}>
                      {goal}
                    </span>
                  ))}
                </div>
                <ul className="bullet-list bullet-list--wide">
                  {pathway.helpfulWhen.slice(0, 2).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="button-row button-row--compact">
                  <Link className="button-primary" href={`/guided-paths/${pathway.slug}`}>
                    Open this path
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Keep this close</p>
          <h2>Use a pathway when the next step feels bigger than the search.</h2>
          <p>
            Guiding Light can still help you browse freely, but guided pathways
            are here for the moments when you want support to feel more ordered,
            calmer, and easier to act on.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-primary" href={`/guided-paths/${pathways[0].slug}`}>
            Start with a pathway
          </Link>
          <Link className="button-secondary" href="/resources">
            Browse resources instead
          </Link>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import {
  autismTerms,
  communityCreatorReferences,
  globalPerspectives,
  identitySupportHighlights,
  publicVoices,
  representationHighlights,
} from "@/lib/global-voices";

export default function GlobalVoicesPage() {
  const creatorAvatarUrl = (handle: string) =>
    `/global-voices/creators/${handle.replace(/^@/, "")}.jpg`;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Global Voices</p>
        <h1>See how autism is named, understood, and spoken about around the world.</h1>
        <p className="hero-lead">
          This page gathers a few official terms, community perspectives, and
          public stories from different countries so families and self-advocates
          can feel less alone, more connected, and better able to recognize how
          culture, access, and representation shape support.
        </p>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="A gentle note"
            intro="Language around autism changes across countries, communities, and even from one person to another."
            title="Different words can still point toward the same hope."
          />
          <p className="panel-copy">
            Some people prefer autistic, some prefer person with autism, and
            some switch depending on context. The goal here is not to force one
            style. It is to show how different places talk about the spectrum
            and what kinds of support they center.
          </p>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What repeats across borders"
            intro="Even when the wording changes, a few themes show up again and again."
            title="Support feels strongest when it is personal, practical, and respectful."
          />
          <ul className="bullet-list bullet-list--wide">
            <li>Families do better when support fits the person instead of forcing one path.</li>
            <li>Community access matters alongside therapy, diagnosis, and school support.</li>
            <li>Quality of life, belonging, and meaningful routines matter in every stage of life.</li>
            <li>Hope grows when people are seen for strengths, not only challenges.</li>
          </ul>
        </div>
      </section>

      <section className="section" id="identity-support">
        <SectionHeading
          eyebrow="Autism in many languages"
          intro="These are representative examples of official or organization-used terms from different countries and regions."
          title="A few of the names families may see across the world."
        />
        <div className="term-grid">
          {autismTerms.map((term) => (
            <article className="feature-card term-card" key={`${term.country}-${term.language}`}>
              <p className="feature-label">
                {term.country} • {term.language}
              </p>
              <h3>{term.localName}</h3>
              <p>{term.translation}</p>
              <p className="meta-copy">{term.note}</p>
              <Link
                className="text-link"
                href={term.sourceHref}
                rel="noreferrer"
                target="_blank"
              >
                Visit source: {term.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Instagram creators and influencers"
          intro="These references come from the public profile descriptions of creators, advocates, and public figures helping autistic and autism-connected communities feel more visible online."
          title="More voices worth knowing."
        />
        <div className="card-grid card-grid--three">
          {communityCreatorReferences.map((creator) => (
            <article className="feature-card creator-card" key={creator.handle}>
              <div className="creator-card__header">
                <div aria-hidden="true" className="creator-card__avatar">
                  <Image
                    alt=""
                    className="creator-card__avatar-image"
                    height={64}
                    src={creatorAvatarUrl(creator.handle)}
                    width={64}
                  />
                </div>
                <div className="creator-card__header-copy">
                  <p className="feature-label">{creator.handle}</p>
                  <h3>{creator.name}</h3>
                  <p className="meta-copy creator-card__role">{creator.role}</p>
                </div>
              </div>
              <p>{creator.summary}</p>
              <Link
                className="text-link"
                href={creator.sourceHref}
                rel="noreferrer"
                target="_blank"
              >
                Visit {creator.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="creator-references">
        <SectionHeading
          eyebrow="How support is described"
          intro="These sources do not all say the exact same thing, but they often point in a shared direction."
          title="What communities around the world keep coming back to."
        />
        <div className="card-grid card-grid--three">
          {globalPerspectives.map((perspective) => (
            <article className="feature-card" key={perspective.title}>
              <p className="feature-label">{perspective.region}</p>
              <h3>{perspective.title}</h3>
              <p>{perspective.summary}</p>
              <p className="meta-copy">{perspective.takeaway}</p>
              <Link
                className="text-link"
                href={perspective.sourceHref}
                rel="noreferrer"
                target="_blank"
              >
                Read the source: {perspective.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Representation and access"
          intro="Families of color deserve to be seen, believed, and supported earlier. The picture is changing, but many families still describe delays, stereotypes, and harder paths into care."
          title="Why visibility and culturally responsive support matter."
        />
        <p className="meta-copy" style={{ marginBottom: "1rem" }}>
          This section is a synthesis of current public-health data, research,
          and community-led advocacy sources rather than one single definition.
        </p>
        <div className="card-grid card-grid--three">
          {representationHighlights.map((highlight) => (
            <article className="feature-card" key={highlight.title}>
              <p className="feature-label">{highlight.label}</p>
              <h3>{highlight.title}</h3>
              <p>{highlight.summary}</p>
              <p className="meta-copy">{highlight.takeaway}</p>
              <Link
                className="text-link"
                href={highlight.sourceHref}
                rel="noreferrer"
                target="_blank"
              >
                Read the source: {highlight.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Queer and LGBTQIA+ autistic communities"
          intro="Queer, trans, nonbinary, and otherwise LGBTQIA+ autistic people deserve to see their lives recognized here too. Support should make room for identity, safety, joy, and belonging all at once."
          title="Autistic support should make room for the full person."
        />
        <p className="meta-copy" style={{ marginBottom: "1rem" }}>
          This section brings together current research and affirming community
          resources so families, self-advocates, and allies can find support
          that respects both neurodivergence and LGBTQIA+ identity.
        </p>
        <div className="card-grid card-grid--three">
          {identitySupportHighlights.map((highlight) => (
            <article className="feature-card" key={highlight.title}>
              <p className="feature-label">{highlight.label}</p>
              <h3>{highlight.title}</h3>
              <p>{highlight.summary}</p>
              <p className="meta-copy">{highlight.takeaway}</p>
              <Link
                className="text-link"
                href={highlight.sourceHref}
                rel="noreferrer"
                target="_blank"
              >
                Open the source: {highlight.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Public voices"
          intro="These public figures and parent advocates have spoken openly about autism in their own lives or families."
          title="Real faces and stories that help people feel seen."
        />
        <div className="voice-grid">
          {publicVoices.map((voice) => (
            <article className="voice-card" key={voice.name}>
              <Image
                alt={voice.imageAlt}
                className="voice-card__image"
                height={voice.imageHeight}
                src={voice.imageSrc}
                width={voice.imageWidth}
              />
              <div className="voice-card__body">
                <p className="feature-label">
                  {voice.country} • {voice.connection}
                </p>
                <h3>{voice.name}</h3>
                <p className="voice-card__role">{voice.role}</p>
                <blockquote className="voice-card__quote">&ldquo;{voice.quote}&rdquo;</blockquote>
                <p>{voice.story}</p>
                <div className="voice-card__footer">
                  <span className="meta-copy">{voice.imageCredit}</span>
                  <Link
                    className="text-link"
                    href={voice.articleHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {voice.articleLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Keep exploring</p>
          <h2>Use these stories as a bridge into real-world support and conversation.</h2>
          <p>
            Move from inspiration into practical help with trusted resources,
            events, and community conversations inside Guiding Light.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-primary" href="/resources">
            Explore resources
          </Link>
          <Link className="button-secondary" href="/community">
            Visit the community
          </Link>
        </div>
      </section>
    </div>
  );
}

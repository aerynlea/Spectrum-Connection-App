import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";

export default function MembershipPage() {
  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Access</p>
        <h1>Guiding Light is staying centered on free access.</h1>
        <p className="hero-lead">
          The point of this space is to help families and people on the spectrum
          reach real support, real information, and real connection without
          adding another barrier.
        </p>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="What this means"
            intro="Guiding Light is being shaped as a guide first, with the focus staying on access."
            title="Support stays open."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Resources stay reachable</h3>
                <p>Official links, support tools, and real-world services remain open to families and self-advocates.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>Community stays part of the core</h3>
                <p>Message-board support, lived experience, and practical encouragement remain part of the main experience.</p>
              </div>
            </article>
            <article className="support-step">
              <span>03</span>
              <div>
                <h3>Guidance stays grounded</h3>
                <p>The goal is to help people get where they need to go next, not to gate the path behind a paid tier.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Keep going"
            intro="You can move straight into the parts of the app that help you most."
            title="Choose where to head next."
          />
          <div className="button-row">
            <Link className="button-primary" href="/resources">
              Open resources
            </Link>
            <Link className="button-secondary" href="/community">
              Visit community
            </Link>
            <Link className="button-secondary" href="/events">
              See events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

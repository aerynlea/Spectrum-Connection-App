import Link from "next/link";

export default function MembershipCancelPage() {
  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Membership</p>
        <h1>No problem. Your membership checkout was not completed.</h1>
        <p className="hero-lead">
          You can come back anytime when the timing feels right.
        </p>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Whenever you&apos;re ready</p>
          <h2>Your free support space is still here.</h2>
          <p>
            You can keep exploring resources, community support, and events
            without losing your place.
          </p>
        </div>
        <div className="button-row">
          <Link className="button-primary" href="/membership">
            Back to membership
          </Link>
          <Link className="button-secondary" href="/dashboard">
            Open dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

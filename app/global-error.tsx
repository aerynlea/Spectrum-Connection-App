'use client';

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html>
      <body>
        <div className="page">
          <section className="section split-layout">
            <div className="section-panel">
              <p className="eyebrow">Something went wrong</p>
              <h1>Guiding Light hit a snag loading this page.</h1>
              <p className="hero-lead">
                Nothing needs to be fixed on your side right away. Try the page
                again, or head back to a calmer starting point.
              </p>
              <div className="button-row">
                <button className="button-primary" onClick={() => reset()} type="button">
                  Try again
                </button>
                <Link className="button-secondary" href="/">
                  Go home
                </Link>
                <Link className="button-secondary" href="/resources">
                  Browse resources
                </Link>
              </div>
            </div>

            <div className="section-panel section-panel--accent">
              <p className="feature-label">Helpful note</p>
              <h2>Most temporary errors clear on a refresh.</h2>
              <p className="panel-copy">
                If the page keeps failing, this error reference can help track
                it down faster.
              </p>
              {error.digest ? (
                <p className="meta-copy">
                  Error reference: <code>{error.digest}</code>
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </body>
    </html>
  );
}

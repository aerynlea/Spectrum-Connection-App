"use client";

import { useEffect } from "react";

import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="page-backdrop" />
        <main className="app-shell error-app-shell">
          <div className="page">
            <section className="page-intro error-shell">
              <div className="error-shell__mark" aria-hidden="true">
                <BrandMark size={108} />
              </div>
              <p className="eyebrow">Let&apos;s get you back</p>
              <h1>This page lost its place for a moment.</h1>
              <p className="hero-lead">
                Sometimes this happens when the site has just updated or your
                browser is still holding onto an older version of the page.
                Refreshing usually brings everything back.
              </p>
              <div className="button-row">
                <button
                  className="button-primary"
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Refresh page
                </button>
                <button
                  className="button-secondary"
                  onClick={() => reset()}
                  type="button"
                >
                  Try again
                </button>
                <Link className="button-secondary" href="/">
                  Go home
                </Link>
              </div>
              <div className="feature-card error-shell__card">
                <p className="feature-label">Helpful note</p>
                <h3>You did not break anything.</h3>
                <p>
                  If the page still will not open after a refresh, go back home
                  and try the link again. If it keeps happening, I can keep
                  digging from the deployment side.
                </p>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  );
}

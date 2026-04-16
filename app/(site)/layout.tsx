import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="page-backdrop" />
      <SiteHeader />
      <main className="app-shell">{children}</main>
      <footer className="site-footer">
        <div>
          <p className="footer-title">Guiding Light</p>
          <p className="footer-copy">
            A calm, connected home for autism-focused resources, support, and
            community.
          </p>
        </div>
        <p className="footer-copy">
          Built around the belief that every journey deserves trustworthy
          guidance, belonging, and room to grow.
        </p>
      </footer>
    </>
  );
}

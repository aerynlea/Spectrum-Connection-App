import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";

import { SiteHeader } from "@/components/site-header";
import { getAppearanceBootstrapScript } from "@/lib/appearance";
import { isClerkConfigured } from "@/lib/platform";

import "./globals.css";

export const metadata: Metadata = {
  title: "Guiding Light | Autism Support and Resource Community",
  description:
    "Guiding Light helps autistic people, parents, caregivers, and trusted professionals find support, resources, and community at every stage of life.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const appBody = (
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="guiding-light-appearance" strategy="beforeInteractive">
          {getAppearanceBootstrapScript()}
        </Script>
        {isClerkConfigured ? <ClerkProvider>{appBody}</ClerkProvider> : appBody}
      </body>
    </html>
  );
}

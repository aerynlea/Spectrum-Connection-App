import type { ReactNode } from "react";

import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export default function AccountLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="page-backdrop" />
      <header className="auth-header">
        <div className="auth-header__inner">
          <Link className="brand-lockup" href="/">
            <span className="brand-mark-wrap">
              <BrandMark size={54} />
            </span>
            <span>
              <span className="brand-name">Guiding Light</span>
              <span className="brand-tagline">Where Every Journey Connects</span>
            </span>
          </Link>
          <Link className="nav-secondary auth-header__link" href="/">
            Back home
          </Link>
        </div>
      </header>
      <main className="app-shell app-shell--account">{children}</main>
      <footer className="site-footer site-footer--account">
        <p className="footer-copy">
          Account support should feel simple, calm, and easy to return to.
        </p>
      </footer>
    </>
  );
}

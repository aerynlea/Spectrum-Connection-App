import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { AppearanceControls } from "@/components/appearance-controls";
import { BrandMark } from "@/components/brand-mark";
import { ClerkUserButton } from "@/components/clerk-user-button";
import { SignOutForm } from "@/components/sign-out-form";
import { getCurrentUser } from "@/lib/auth";
import { isClerkConfigured } from "@/lib/platform";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/resources", label: "Resources" },
  { href: "/membership", label: "Membership" },
  { href: "/community", label: "Community" },
  { href: "/global-voices", label: "Global Voices" },
  { href: "/events", label: "Events" },
  { href: "/professionals", label: "Professionals" },
];

export async function SiteHeader() {
  noStore();
  const currentUser = await getCurrentUser();
  const signInHref = isClerkConfigured ? "/sign-in" : "/auth";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__top">
          <Link className="brand-lockup" href="/">
            <span className="brand-mark-wrap">
              <BrandMark size={54} />
            </span>
            <span>
              <span className="brand-name">Guiding Light</span>
              <span className="brand-tagline">Where Every Journey Connects</span>
            </span>
          </Link>

          <details className="mobile-nav">
            <summary className="mobile-nav__toggle">
              <span className="mobile-nav__toggle-label">Menu</span>
              <span aria-hidden="true" className="mobile-nav__icon">
                <span />
                <span />
                <span />
              </span>
            </summary>

            <nav aria-label="Mobile" className="mobile-nav__panel">
              <div className="mobile-nav__group">
                {navItems.map((item) => (
                  <Link className="mobile-nav__link" href={item.href} key={`mobile-${item.href}`}>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mobile-nav__divider" />

              <AppearanceControls variant="inline" />

              <div className="mobile-nav__divider" />

              <div className="mobile-nav__group mobile-nav__group--actions">
                {currentUser ? (
                  <>
                    <Link className="mobile-nav__link mobile-nav__link--account" href="/dashboard">
                      {isClerkConfigured ? "Dashboard" : currentUser.name}
                    </Link>
                    <div className="mobile-nav__account-control">
                      {isClerkConfigured ? <ClerkUserButton /> : <SignOutForm />}
                    </div>
                  </>
                ) : (
                  <>
                    <Link className="nav-secondary mobile-nav__action" href={signInHref}>
                      Sign in
                    </Link>
                    <Link className="nav-cta mobile-nav__action" href="/resources">
                      Browse support
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </details>
        </div>

        <nav aria-label="Primary" className="site-nav site-nav--desktop">
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <AppearanceControls variant="popover" />
          {currentUser ? (
            <>
              <Link className="nav-link nav-link--account" href="/dashboard">
                {isClerkConfigured ? "Dashboard" : currentUser.name}
              </Link>
              {isClerkConfigured ? <ClerkUserButton /> : <SignOutForm />}
            </>
          ) : (
            <>
              <Link className="nav-secondary" href={signInHref}>
                Sign in
              </Link>
              <Link className="nav-cta" href="/resources">
                Browse support
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

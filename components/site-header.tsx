import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { BrandMark } from "@/components/brand-mark";
import { ClerkUserButton } from "@/components/clerk-user-button";
import { SignOutForm } from "@/components/sign-out-form";
import { getCurrentUser } from "@/lib/auth";
import { isClerkConfigured } from "@/lib/platform";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/resources", label: "Resources" },
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
  { href: "/professionals", label: "Professionals" },
];

export async function SiteHeader() {
  noStore();
  const currentUser = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark-wrap">
            <BrandMark size={54} />
          </span>
          <span>
            <span className="brand-name">Guiding Light</span>
            <span className="brand-tagline">Where Every Journey Connects</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="site-nav">
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          {currentUser ? (
            <>
              <Link className="nav-link nav-link--account" href="/dashboard">
                {isClerkConfigured ? "Dashboard" : currentUser.name}
              </Link>
              {isClerkConfigured ? <ClerkUserButton /> : <SignOutForm />}
            </>
          ) : (
            <>
              <Link className="nav-secondary" href={isClerkConfigured ? "/sign-in" : "/auth"}>
                Sign in
              </Link>
              <Link className="nav-cta" href={isClerkConfigured ? "/sign-up" : "/auth"}>
                Join the Circle
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

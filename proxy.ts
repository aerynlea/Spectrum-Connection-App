import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

import { isClerkConfigured } from "@/lib/platform";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
]);

const clerkProtectedProxy = clerkMiddleware(async (auth, req) => {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // Local auth uses the app's own session cookie. Skip Clerk protection in that mode
  // so /dashboard and /onboarding can fall back to the built-in auth flow.
  if (!isClerkConfigured) {
    return NextResponse.next();
  }

  return clerkProtectedProxy(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

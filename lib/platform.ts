const clerkSecretKey = process.env.CLERK_SECRET_KEY ?? "";
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

const hasClerkKeys = Boolean(clerkSecretKey && clerkPublishableKey);
const isClerkDevelopmentInstance =
  clerkSecretKey.startsWith("sk_test_") ||
  clerkPublishableKey.startsWith("pk_test_");
const isProductionDeployment =
  process.env.VERCEL_ENV === "production" ||
  (process.env.NODE_ENV === "production" && Boolean(process.env.VERCEL_URL));

// Keep development Clerk instances off the public site until production keys
// are connected, then allow hosted auth to switch back on automatically.
export const isClerkConfigured =
  hasClerkKeys && !(isProductionDeployment && isClerkDevelopmentInstance);

export const isNeonConfigured = Boolean(process.env.DATABASE_URL);

export const isHostedMode = isClerkConfigured || isNeonConfigured;

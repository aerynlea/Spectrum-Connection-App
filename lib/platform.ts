const clerkSecretKey = process.env.CLERK_SECRET_KEY ?? "";
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const clerkAuthorizedParties = process.env.CLERK_AUTHORIZED_PARTIES ?? "";

const hasClerkKeys = Boolean(clerkSecretKey && clerkPublishableKey);
export const isClerkDevelopmentInstance =
  clerkSecretKey.startsWith("sk_test_") ||
  clerkPublishableKey.startsWith("pk_test_");
export const isProductionDeployment =
  process.env.VERCEL_ENV === "production" ||
  (process.env.NODE_ENV === "production" && Boolean(process.env.VERCEL_URL));

export const isLocalDevelopment =
  process.env.NODE_ENV === "development" && !Boolean(process.env.VERCEL_URL);

// Keep development Clerk instances off the public site until production keys
// are connected, then allow hosted auth to switch back on automatically.
export const isClerkConfigured =
  hasClerkKeys && !(isProductionDeployment && isClerkDevelopmentInstance);

export const isNeonConfigured = Boolean(process.env.DATABASE_URL);

export const isHostedMode = isClerkConfigured || isNeonConfigured;

export const isStripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_PREMIUM,
);

export const isStripeWebhookConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
);

function toOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    try {
      return new URL(`https://${value}`).origin;
    } catch {
      return null;
    }
  }
}

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getClerkAuthorizedParties() {
  const authorizedParties = new Set<string>();

  for (const value of clerkAuthorizedParties.split(/[,\n]/)) {
    const origin = toOrigin(value.trim());

    if (origin) {
      authorizedParties.add(origin);
    }
  }

  const appOrigin = toOrigin(getAppUrl());

  if (appOrigin) {
    authorizedParties.add(appOrigin);
  }

  const productionOrigin = toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (productionOrigin) {
    authorizedParties.add(productionOrigin);
  }

  const previewOrigin = toOrigin(process.env.VERCEL_URL);

  if (previewOrigin) {
    authorizedParties.add(previewOrigin);
  }

  if (!isProductionDeployment) {
    authorizedParties.add("http://localhost:3000");
    authorizedParties.add("http://127.0.0.1:3000");
  }

  return Array.from(authorizedParties);
}

export const isClerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export const isNeonConfigured = Boolean(process.env.DATABASE_URL);

export const isHostedMode = isClerkConfigured || isNeonConfigured;

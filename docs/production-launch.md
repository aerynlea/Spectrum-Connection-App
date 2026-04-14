# Production Launch Guide

This guide covers the remaining live setup for Guiding Light on:

- `https://www.the-guidinglight.com`
- `https://the-guidinglight.com`

## 1. Vercel production environment variables

Open the Vercel project settings for `spectrum-connection-app` and add or confirm these production values:

### Core

- `NEXT_PUBLIC_APP_URL=https://www.the-guidinglight.com`
- `DATABASE_URL=<Neon production connection string>`

### Clerk

- `CLERK_SECRET_KEY=<live production secret key>`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<live production publishable key>`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `CLERK_AUTHORIZED_PARTIES=https://www.the-guidinglight.com,https://the-guidinglight.com`

### Stripe

- `STRIPE_SECRET_KEY=<live Stripe secret key>`
- `STRIPE_WEBHOOK_SECRET=<Stripe webhook signing secret>`
- `STRIPE_PRICE_ID_PREMIUM=<monthly recurring price id>`

Redeploy after saving environment variables. Existing deployments do not automatically pick up new values.

## 2. Clerk production setup

In Clerk:

1. Open the production instance, not the development instance.
2. Add the production domains for Guiding Light.
3. Copy the live API keys into the Vercel production environment variables above.
4. Keep the app routes on `/sign-in` and `/sign-up`.

Guiding Light is already coded to:

- send sign-up into `/onboarding`
- send sign-in into `/dashboard`
- sync onboarding and membership state into Clerk public metadata
- fall back to `/auth` if live Clerk keys are not connected yet

## 3. Stripe product and subscription setup

In Stripe:

1. Create a product for the premium plan.
2. Create a recurring monthly price for that product.
3. Copy the new price id into `STRIPE_PRICE_ID_PREMIUM`.
4. Create a webhook endpoint at:

   `https://www.the-guidinglight.com/api/stripe/webhook`

5. Subscribe the webhook to these events:

   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

6. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

The app already uses Stripe Checkout and the billing portal through server actions, so no additional client billing UI setup is required for the current flow.

## 4. Recommended live verification

After redeploying:

1. Visit `/sign-in` and confirm the hosted Clerk form appears instead of the local auth page.
2. Create or sign in to a test account.
3. Complete onboarding.
4. Open `/membership` and start Checkout.
5. Complete a Stripe test purchase in the correct Stripe mode for the keys you connected.
6. Confirm the dashboard shows premium access after the webhook updates the subscription state.
7. Open the billing portal from the membership page and confirm it returns to Guiding Light.

## 5. Current code paths that support launch

- `proxy.ts`
- `lib/platform.ts`
- `lib/clerk-metadata.ts`
- `lib/stripe.ts`
- `app/actions.ts`
- `app/api/stripe/webhook/route.ts`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`

## 6. If something still falls back to local auth

Check these first:

- live Clerk keys are in the Vercel production environment, not test keys
- `NEXT_PUBLIC_APP_URL` matches `https://www.the-guidinglight.com`
- `CLERK_AUTHORIZED_PARTIES` includes both `https://www.the-guidinglight.com` and `https://the-guidinglight.com`
- the project was redeployed after the env changes

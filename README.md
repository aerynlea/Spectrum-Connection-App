# Guiding Light

Guiding Light is a calm, community-centered support app for autistic people, parents, caregivers, and trusted professionals. It brings together real resources, supportive conversation, guided planning, and regional event discovery in one place.

## What is in the app

- profile-based onboarding
- community message board
- resource and event discovery
- guided California and outings support pages
- global voices and representation content
- local auth fallback plus Clerk-ready hosted auth
- premium membership UI with Stripe checkout and webhook support

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Copy the example environment file and fill in the values you want to use.

```bash
cp .env.example .env.local
```

3. Start the app.

```bash
npm run dev
```

The local app runs at `http://localhost:3000`.

## Environment variables

### Core

- `DATABASE_URL`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Clerk

- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `CLERK_AUTHORIZED_PARTIES`

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PREMIUM`

### Password recovery email

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO` (optional)
- `ADMIN_LOOKUP_KEY` (optional, for the private email lookup tool)

If Clerk keys are missing, the app uses the built-in local auth flow. If Stripe values are missing, the membership page stays visible but checkout is disabled gracefully.
If the email values are missing, the local forgot-password pages still exist but reset emails cannot be delivered in production. `EMAIL_REPLY_TO` is optional and can point replies to a monitored inbox while sending from a branded address like `support@the-guidinglight.com`.

## Production launch checklist

For the live site on `https://www.the-guidinglight.com`, set these production values in Vercel before launching public auth and billing:

### Core production values

- `NEXT_PUBLIC_APP_URL=https://www.the-guidinglight.com`
- `DATABASE_URL=<your Neon production connection string>`

### Clerk production values

- `CLERK_SECRET_KEY=<live Clerk secret key>`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<live Clerk publishable key>`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `CLERK_AUTHORIZED_PARTIES=https://www.the-guidinglight.com,https://the-guidinglight.com`

### Stripe production values

- `STRIPE_SECRET_KEY=<live Stripe secret key>`
- `STRIPE_WEBHOOK_SECRET=<webhook signing secret>`
- `STRIPE_PRICE_ID_PREMIUM=<recurring monthly price id>`

After changing any production environment variable in Vercel, redeploy the project so the new values apply to the live deployment.

See [docs/production-launch.md](docs/production-launch.md) for the full step-by-step launch guide.

## Stripe webhook

Point Stripe webhooks to:

```text
/api/stripe/webhook
```

Recommended events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Clerk notes

For a production Clerk launch, use production Clerk keys and connect the real production domain in Clerk. The app is already set up to:

- send new Clerk sign-ups into onboarding
- send returning Clerk sign-ins to the dashboard
- sync onboarding and membership status into Clerk public metadata
- restrict Clerk auth to approved origins through `CLERK_AUTHORIZED_PARTIES`

## Premium membership flow

The premium membership flow currently includes:

- a dedicated membership page
- Stripe Checkout for subscriptions
- Stripe billing portal access
- saved premium membership state in the app database
- dashboard membership status and premium roadmap UI

## Verification

Run:

```bash
npm run lint
npm run build
```

If you are working in a dirty local workspace, existing unrelated local edits may need to be resolved before full-project lint and build pass cleanly.


import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { syncClerkMetadataForUser } from "@/lib/clerk-metadata";
import { updateUserMembership } from "@/lib/data";
import { getStripeObjectId, getStripeWebhookSecret, mapStripeSubscriptionStatus, stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function hasPremiumStatus(status: ReturnType<typeof mapStripeSubscriptionStatus>) {
  return status === "trialing" || status === "active" || status === "past_due";
}

async function syncMembershipFromSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  const nextStatus = mapStripeSubscriptionStatus(subscription.status);
  const updatedUser = await updateUserMembership(userId, {
    membershipTier: hasPremiumStatus(nextStatus) ? "premium" : "free",
    subscriptionStatus: nextStatus,
    stripeCustomerId: getStripeObjectId(subscription.customer),
    stripeSubscriptionId:
      nextStatus === "canceled" ? null : getStripeObjectId(subscription),
  });

  if (updatedUser?.externalAuthId) {
    await syncClerkMetadataForUser(updatedUser.externalAuthId, {
      membershipTier: updatedUser.membershipTier,
      subscriptionStatus: updatedUser.subscriptionStatus,
    });
  }
}

async function syncMembershipCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return;
  }

  const updatedUser = await updateUserMembership(userId, {
    membershipTier: "free",
    subscriptionStatus: "canceled",
    stripeCustomerId: getStripeObjectId(subscription.customer),
    stripeSubscriptionId: null,
  });

  if (updatedUser?.externalAuthId) {
    await syncClerkMetadataForUser(updatedUser.externalAuthId, {
      membershipTier: updatedUser.membershipTier,
      subscriptionStatus: updatedUser.subscriptionStatus,
    });
  }
}

async function syncMembershipFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    return;
  }

  const subscriptionId = getStripeObjectId(session.subscription);

  if (!subscriptionId || !stripe) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const nextStatus = mapStripeSubscriptionStatus(subscription.status);
  const updatedUser = await updateUserMembership(userId, {
    membershipTier: hasPremiumStatus(nextStatus) ? "premium" : "free",
    subscriptionStatus: nextStatus,
    stripeCustomerId: getStripeObjectId(session.customer),
    stripeSubscriptionId: getStripeObjectId(subscription),
  });

  if (updatedUser?.externalAuthId) {
    await syncClerkMetadataForUser(updatedUser.externalAuthId, {
      membershipTier: updatedUser.membershipTier,
      subscriptionStatus: updatedUser.subscriptionStatus,
    });
  }
}

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Stripe signature verification failed." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await syncMembershipFromCheckoutSession(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await syncMembershipFromSubscription(
        event.data.object as Stripe.Subscription,
      );
      break;
    case "customer.subscription.deleted":
      await syncMembershipCancellation(
        event.data.object as Stripe.Subscription,
      );
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

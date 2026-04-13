import Stripe from "stripe";

import type { SubscriptionStatus } from "@/lib/app-types";
import { getAppUrl } from "@/lib/platform";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    })
  : null;

export function getStripePriceId() {
  return process.env.STRIPE_PRICE_ID_PREMIUM ?? null;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

export function getStripeReturnUrl(path = "/membership") {
  return `${getAppUrl()}${path}`;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status | null | undefined,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
    case "paused":
      return status;
    default:
      return "inactive";
  }
}

export function getStripeObjectId(
  value:
    | string
    | Stripe.Customer
    | Stripe.DeletedCustomer
    | Stripe.Subscription
    | null
    | undefined,
) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

export async function getPremiumPriceSummary() {
  if (!stripe) {
    return null;
  }

  const priceId = getStripePriceId();

  if (!priceId) {
    return null;
  }

  const price = await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  });

  if (!price.unit_amount || price.type !== "recurring" || !price.recurring) {
    return null;
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(price.unit_amount / 100);
  const productName =
    typeof price.product === "string"
      ? "Premium"
      : "name" in price.product
        ? price.product.name
        : "Premium";

  return {
    amount: formattedAmount,
    interval: price.recurring.interval,
    nickname: price.nickname || productName,
  };
}

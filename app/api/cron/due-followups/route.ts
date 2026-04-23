import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getUserById, listMemberRoster } from "@/lib/data";
import { isNewsletterEmailConfigured } from "@/lib/email";
import {
  ensureCurrentSupportPlanForUser,
  getSupportPlanDueReminderCandidates,
  sendSupportPlanDueReminderEmail,
  wasSupportPlanRecapSentOnDate,
} from "@/lib/support-plans";

export const runtime = "nodejs";

function authorizeCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  const hasCronSecret = Boolean(process.env.CRON_SECRET?.trim());

  if (!authorizeCronRequest(request)) {
    return NextResponse.json(
      {
        error: hasCronSecret
          ? "Unauthorized cron request."
          : "CRON_SECRET must be configured before due follow-up reminders can run in production.",
      },
      { status: hasCronSecret ? 401 : 503 },
    );
  }

  if (!isNewsletterEmailConfigured()) {
    return NextResponse.json({
      failed: 0,
      ok: false,
      reason: "Newsletter email is not configured yet.",
      sent: 0,
      skipped: 0,
      stepReminders: 0,
    });
  }

  const recipients = (await listMemberRoster()).filter(
    (member) => member.newsletterSubscribed,
  );
  let failed = 0;
  let sent = 0;
  let skipped = 0;
  let stepReminders = 0;

  for (const recipient of recipients) {
    const user = await getUserById(recipient.id);

    if (!user || !user.onboardingCompleted || !user.newsletterSubscribed) {
      skipped += 1;
      continue;
    }

    const plan = await ensureCurrentSupportPlanForUser(user);

    if (!plan || wasSupportPlanRecapSentOnDate(plan)) {
      skipped += 1;
      continue;
    }

    const dueReminderSteps = getSupportPlanDueReminderCandidates(plan);

    if (dueReminderSteps.length === 0) {
      skipped += 1;
      continue;
    }

    const delivered = await sendSupportPlanDueReminderEmail(
      user,
      plan,
      dueReminderSteps,
    );

    if (delivered) {
      sent += 1;
      stepReminders += dueReminderSteps.length;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    failed,
    ok: failed === 0,
    sent,
    skipped,
    stepReminders,
    subscribedRecipients: recipients.length,
  });
}

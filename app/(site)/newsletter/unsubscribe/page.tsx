import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { SectionHeading } from "@/components/section-heading";
import { getUserById, updateUserNewsletterSubscription } from "@/lib/data";
import { verifyNewsletterUnsubscribeToken } from "@/lib/newsletter";
import { type PageSearchParams, getQueryMessage } from "@/lib/search-params";

type NewsletterUnsubscribePageProps = {
  searchParams?: PageSearchParams;
};

export default async function NewsletterUnsubscribePage({
  searchParams,
}: NewsletterUnsubscribePageProps) {
  noStore();

  const userId = await getQueryMessage(searchParams, "user");
  const token = await getQueryMessage(searchParams, "token");

  let title = "That unsubscribe link is not valid.";
  let detail =
    "This link may be incomplete or expired. If you still want to stop getting updates, please contact Guiding Light directly.";

  if (userId && token) {
    const user = await getUserById(userId);

    if (
      user &&
      verifyNewsletterUnsubscribeToken({
        userId: user.id,
        email: user.email,
        token,
      })
    ) {
      if (user.newsletterSubscribed) {
        await updateUserNewsletterSubscription(user.id, {
          newsletterSubscribed: false,
        });
      }

      title = "You have been unsubscribed from Guiding Light emails.";
      detail =
        "You will not receive future newsletter updates unless you opt in again from your profile or a future signup form.";
    }
  }

  return (
    <div className="page">
      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Newsletter preferences"
            intro="Email updates should always stay easy to leave."
            title={title}
          />
          <p className="hero-lead">{detail}</p>
          <div className="button-row">
            <Link className="button-primary" href="/resources">
              Explore resources
            </Link>
            <Link className="button-secondary" href="/">
              Back home
            </Link>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Need updates again later?"
            intro="You can always rejoin later if email updates become useful again."
            title="Opting back in stays simple."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Sign in when ready</h3>
                <p>Your profile still lets you manage your email preferences later on.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>Turn updates back on</h3>
                <p>Check the newsletter box again from onboarding or your profile form.</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

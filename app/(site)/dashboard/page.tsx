import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { SaveResourceForm } from "@/components/save-resource-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { SupportPlanProgressForm } from "@/components/support-plan-progress-form";
import { requireCurrentUser } from "@/lib/auth";
import {
  listCommunityPosts,
  listEvents,
  listProfessionals,
  listResources,
  listSavedResources,
} from "@/lib/data";
import {
  formatAgeGroup,
  formatCalendarDate,
  formatDateTime,
  formatGoal,
  formatMonthDay,
  formatRole,
  formatSupportStepStatus,
} from "@/lib/formatters";
import { partitionByLocation } from "@/lib/location";
import { buildPremiumRoadmap } from "@/lib/membership";
import { buildRecommendations } from "@/lib/recommendations";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";
import {
  ensureCurrentSupportPlanForUser,
  getSupportPlanUpcomingFollowUps,
  getSupportPlanProgress,
  getSupportPlanWaitingOn,
  getSupportPlanWins,
} from "@/lib/support-plans";
import { profileQuotes } from "@/lib/site-data";

type DashboardPageProps = {
  searchParams?: PageSearchParams;
};

function getSupportStepKindLabel(kind: string) {
  switch (kind) {
    case "resource":
      return "Resource";
    case "professional":
      return "Professional";
    case "event":
      return "Event";
    default:
      return "Community";
  }
}

function getSupportStepStatusClassName(status: string) {
  switch (status) {
    case "saved":
      return "support-step-chip--saved";
    case "contacted":
      return "support-step-chip--contacted";
    case "attended":
      return "support-step-chip--attended";
    case "done":
      return "support-step-chip--done";
    default:
      return "support-step-chip--not-started";
  }
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  noStore();

  const currentUser = await requireCurrentUser();
  if (!currentUser.onboardingCompleted) {
    redirect("/onboarding");
  }

  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const resources = await listResources(currentUser.id);
  const savedResources = await listSavedResources(currentUser.id);
  const events = await listEvents();
  const recentPosts = await listCommunityPosts(6);
  const professionals = await listProfessionals();
  const recommendations = buildRecommendations(currentUser, resources, events);
  const eventSections = partitionByLocation(recommendations.events, currentUser.location);
  const goalRoadmap = buildPremiumRoadmap(currentUser);
  const supportPlan = await ensureCurrentSupportPlanForUser(currentUser, {
    communityPosts: recentPosts,
    events,
    professionals,
    resources,
  });
  const supportPlanProgress = supportPlan ? getSupportPlanProgress(supportPlan) : null;
  const supportPlanCycleLabel = supportPlan
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(new Date(supportPlan.cycleStart))
    : null;
  const supportPlanRecapSentLabel = supportPlan?.recapSentAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(supportPlan.recapSentAt))
    : null;
  const waitingOnSteps = supportPlan ? getSupportPlanWaitingOn(supportPlan) : [];
  const upcomingFollowUps = supportPlan ? getSupportPlanUpcomingFollowUps(supportPlan) : [];
  const weeklyWins = supportPlan ? getSupportPlanWins(supportPlan) : [];

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Your Space</p>
        <h1>Your support space reflects what matters most to you.</h1>
        <p className="hero-lead">
          Save what matters, keep your profile current, and move easily between
          resources, events, and community support.
        </p>
        <div className="pill-list">
          {currentUser.goals.map((goal) => (
            <span className="pill" key={goal}>
              {formatGoal(goal)}
            </span>
          ))}
        </div>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="stats-grid">
        <article className="stat-card stat-card--wide">
          <strong>{savedResources.length}</strong>
          <span>Saved resources</span>
        </article>
        <article className="stat-card stat-card--wide">
          <strong>{recommendations.resources.length}</strong>
          <span>Support picks for you</span>
        </article>
        <article className="stat-card stat-card--wide">
          <strong>{recommendations.events.length}</strong>
          <span>Upcoming events</span>
        </article>
      </section>

      {supportPlan ? (
        <section className="section split-layout">
          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="My next 3 steps"
              intro="Refreshed weekly from your goals, role, age focus, location, and what you have already saved."
              title="A calmer plan for what to do next."
            />
            <div className="stack-list">
              <article className="sub-card">
                <p className="feature-label">Week of {supportPlanCycleLabel}</p>
                <h3>
                  {supportPlanProgress?.completedCount ?? 0} of{" "}
                  {supportPlanProgress?.totalCount ?? supportPlan.steps.length} steps moved
                  forward
                </h3>
                <p>{supportPlan.summary}</p>
                <div className="pill-list pill-list--compact">
                  <span className="pill pill--soft">Weekly refresh</span>
                  <span className="pill pill--soft">
                    {currentUser.newsletterSubscribed
                      ? "Email recap enabled"
                      : "Email recap off"}
                  </span>
                </div>
              </article>

              <article className="sub-card">
                <h3>How this stays personal</h3>
                <p>
                  Guiding Light rebuilds this plan around your role, age focus,
                  location, goals, and saved support so the next step feels
                  clearer instead of heavier.
                </p>
                <p className="meta-copy">
                  {currentUser.newsletterSubscribed
                    ? supportPlanRecapSentLabel
                      ? `This week's recap email was sent ${supportPlanRecapSentLabel}.`
                      : "Your weekly recap email is enabled and ready for the next scheduled send."
                    : "Turn on email updates in your profile if you want this weekly plan in your inbox too."}
                </p>
                {!currentUser.newsletterSubscribed ? (
                  <Link className="button-secondary" href="#profile">
                    Turn on email recaps
                  </Link>
                ) : null}
              </article>
            </div>
          </div>

          <div className="section-panel">
            <SectionHeading
              eyebrow="This week"
              intro="Open each recommendation, then mark the kind of progress you made. Saving a resource can update the plan automatically."
              title="Your next 3 steps."
            />
            <div className="stack-list">
              {supportPlan.steps.map((step) => (
                <article className="support-plan-card" key={step.id}>
                  <div className="support-plan-card__header">
                    <div>
                      <p className="feature-label">
                        Step {step.position} • {getSupportStepKindLabel(step.kind)}
                      </p>
                      <h3>{step.title}</h3>
                    </div>
                    <span
                      className={[
                        "status-chip",
                        "support-step-chip",
                        getSupportStepStatusClassName(step.status),
                      ].join(" ")}
                    >
                      {formatSupportStepStatus(step.status)}
                    </span>
                  </div>
                  <p>{step.detail}</p>
                  <p className="meta-copy">{step.rationale}</p>
                  <div className="support-plan-card__footer">
                    <Link
                      className="button-secondary"
                      href={step.ctaHref}
                      rel={isExternalHref(step.ctaHref) ? "noreferrer" : undefined}
                      target={isExternalHref(step.ctaHref) ? "_blank" : undefined}
                    >
                      {step.ctaLabel}
                    </Link>
                    <p className="support-plan-card__suggestion">
                      Suggested finish:{" "}
                      <strong>{formatSupportStepStatus(step.suggestedStatus)}</strong>
                    </p>
                  </div>
                  <SupportPlanProgressForm
                    currentFollowUpAt={step.followUpAt}
                    currentNote={step.note}
                    currentStatus={step.status}
                    stepId={step.id}
                    suggestedStatus={step.suggestedStatus}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {supportPlan ? (
        <section className="section split-layout">
          <div className="section-panel section-panel--accent">
            <SectionHeading
              eyebrow="Follow-through tracker"
              intro="Keep track of responses, next check-ins, and what still needs a gentle nudge."
              title="Waiting on and follow up next."
            />
            <div className="stack-list">
              <article className="sub-card">
                <h3>Waiting on</h3>
                {waitingOnSteps.length > 0 ? (
                  <div className="stack-list">
                    {waitingOnSteps.map((step) => (
                      <article className="support-followup-card" key={`waiting-${step.id}`}>
                        <div className="thread-card__meta">
                          <div>
                            <p className="feature-label">
                              Step {step.position} • {getSupportStepKindLabel(step.kind)}
                            </p>
                            <h4>{step.title}</h4>
                          </div>
                          <span className="status-chip support-step-chip support-step-chip--contacted">
                            {formatSupportStepStatus(step.status)}
                          </span>
                        </div>
                        {step.note ? <p>{step.note}</p> : <p>{step.detail}</p>}
                        <div className="support-followup-card__meta">
                          <span>
                            {step.followUpAt
                              ? `Follow up by ${formatCalendarDate(step.followUpAt)}`
                              : "No follow-up date set yet"}
                          </span>
                          <Link
                            className="text-link"
                            href={step.ctaHref}
                            rel={isExternalHref(step.ctaHref) ? "noreferrer" : undefined}
                            target={isExternalHref(step.ctaHref) ? "_blank" : undefined}
                          >
                            {step.ctaLabel}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>
                      Mark a step as contacted when you reach out. It will show
                      up here until you move it forward.
                    </p>
                  </div>
                )}
              </article>

              <article className="sub-card">
                <h3>Follow up next</h3>
                {upcomingFollowUps.length > 0 ? (
                  <div className="stack-list">
                    {upcomingFollowUps.map((step) => (
                      <article className="support-followup-card" key={`followup-${step.id}`}>
                        <div className="thread-card__meta">
                          <div>
                            <p className="feature-label">
                              {getSupportStepKindLabel(step.kind)}
                            </p>
                            <h4>{step.title}</h4>
                          </div>
                          <span className="status-chip">
                            {step.followUpAt
                              ? formatCalendarDate(step.followUpAt)
                              : "No date"}
                          </span>
                        </div>
                        <p>{step.note || step.detail}</p>
                        <div className="support-followup-card__meta">
                          <span>{formatSupportStepStatus(step.status)}</span>
                          <Link
                            className="text-link"
                            href={step.ctaHref}
                            rel={isExternalHref(step.ctaHref) ? "noreferrer" : undefined}
                            target={isExternalHref(step.ctaHref) ? "_blank" : undefined}
                          >
                            {step.ctaLabel}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>
                      Add a follow-up date inside any step to keep upcoming
                      check-ins easy to see.
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>

          <div className="section-panel">
            <SectionHeading
              eyebrow="Wins this week"
              intro="Small progress still counts. Saved resources and finished steps stay visible here so momentum is easier to notice."
              title="What moved forward."
            />
            {weeklyWins.length > 0 ? (
              <div className="stack-list">
                {weeklyWins.map((step) => (
                  <article className="support-followup-card" key={`win-${step.id}`}>
                    <div className="thread-card__meta">
                      <div>
                        <p className="feature-label">
                          Step {step.position} • {getSupportStepKindLabel(step.kind)}
                        </p>
                        <h3>{step.title}</h3>
                      </div>
                      <span
                        className={[
                          "status-chip",
                          "support-step-chip",
                          getSupportStepStatusClassName(step.status),
                        ].join(" ")}
                      >
                        {formatSupportStepStatus(step.status)}
                      </span>
                    </div>
                    <p>{step.note || step.detail}</p>
                    <p className="meta-copy">
                      {step.statusUpdatedAt
                        ? `Updated ${formatDateTime(step.statusUpdatedAt)}`
                        : "Updated in this week's plan."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  As you save resources or complete steps, this section will
                  turn into a running reminder that progress is happening.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Free access"
            intro="Guiding Light is staying focused on access, guidance, and connection without locking support behind a paid layer."
            title="Your guide stays open and free."
          />
          <div className="support-steps">
            <article className="support-step">
              <span>01</span>
              <div>
                <h3>Resources stay open</h3>
                <p>Families can keep opening real links, event pages, and practical tools without a paywall.</p>
              </div>
            </article>
            <article className="support-step">
              <span>02</span>
              <div>
                <h3>Community stays reachable</h3>
                <p>Message-board support, shared experiences, and encouragement remain part of the main experience.</p>
              </div>
            </article>
            <article className="support-step">
              <span>03</span>
              <div>
                <h3>Your saved space still matters</h3>
                <p>Profiles, saved links, and your next-step view keep helping you return to what matters most.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="Your next steps"
            intro="These are still shaped around the goals you chose, without asking you to upgrade to keep the basics close."
            title="A simple roadmap to keep nearby."
          />
          <div className="stack-list">
            {goalRoadmap.map((item) => (
              <article className="sub-card" key={item.goal}>
                <p className="feature-label">{formatGoal(item.goal)}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section split-layout" id="profile">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Your profile"
            intro="A few details help Guiding Light bring forward support that feels more relevant to you."
            title="Keep your information up to date."
          />
          <ProfileForm currentUser={currentUser} />
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Profile snapshot"
            intro="This is the information Guiding Light is using right now."
            title="Your current profile at a glance."
          />
          <article className="sub-card">
            <h3>{currentUser.name}</h3>
            <p>{currentUser.location}</p>
            <div className="pill-list pill-list--compact">
              <span className="pill pill--soft">{formatRole(currentUser.role)}</span>
              <span className="pill pill--soft">{formatAgeGroup(currentUser.ageGroup)}</span>
            </div>
            <div className="pill-list pill-list--compact">
              {currentUser.goals.map((goal) => (
                <span className="pill pill--soft" key={goal}>
                  {formatGoal(goal)}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Picked for you"
            intro="Based on your role, age focus, goals, and what you have already saved."
            title="A helpful place to start today."
          />
          <div className="stack-list">
            {recommendations.resources.map((resource) => (
              <article className="sub-card" key={resource.id}>
                <div className="stack-row">
                  <div>
                    <h3>{resource.title}</h3>
                    <p>{resource.summary}</p>
                  </div>
                  <SaveResourceForm
                    isSaved={resource.isSaved}
                    resourceId={resource.id}
                    returnTo="/dashboard"
                  />
                </div>
                <div className="pill-list pill-list--compact">
                  {resource.reasons.map((reason) => (
                    <span className="pill pill--soft" key={reason}>
                      {reason}
                    </span>
                  ))}
                </div>
                <div className="resource-meta">
                  <span>{resource.organization}</span>
                  <Link className="text-link" href={resource.href} rel="noreferrer" target="_blank">
                    Visit resource
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Saved resources"
            intro="Keep your most useful finds in one place so they are easy to return to."
            title="What you want to come back to."
          />
          {savedResources.length > 0 ? (
            <div className="stack-list">
              {savedResources.map((resource) => (
                <article className="thread-card" key={resource.id}>
                  <div className="thread-card__meta">
                    <div>
                      <h3>{resource.title}</h3>
                      <p>
                        {resource.collectionName} • {resource.organization}
                      </p>
                    </div>
                    <SaveResourceForm
                      isSaved={resource.isSaved}
                      resourceId={resource.id}
                      returnTo="/dashboard"
                    />
                  </div>
                  <p>{resource.summary}</p>
                  <Link className="text-link" href={resource.href} rel="noreferrer" target="_blank">
                    Visit resource
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                You have not saved any resources yet. Start in the support
                library and save the options that feel useful.
              </p>
              <Link className="button-secondary" href="/resources">
                Explore resources
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Upcoming events"
            intro="A few upcoming events that may feel especially relevant right now."
            title="Events you may want to keep an eye on."
          />
          <div className="stack-list">
            {eventSections.nearby.length > 0
              ? eventSections.nearby.map((event) => {
                  const { month, day } = formatMonthDay(event.eventDate);

                  return (
                    <article className="event-card" key={event.id}>
                      <Link
                        className="event-card__content-link"
                        href={event.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <div className="event-date">
                          <span>{month}</span>
                          <strong>{day}</strong>
                        </div>
                        <div className="event-card__body">
                          <p className="feature-label">
                            Near {currentUser.location} • {event.format}
                          </p>
                          <h3>{event.title}</h3>
                          <p>{event.detail}</p>
                          <p className="event-meta">
                            {formatDateTime(event.eventDate)} • {event.location}
                          </p>
                          <span className="event-card__cta">Open official event page</span>
                        </div>
                      </Link>
                    </article>
                  );
                })
              : recommendations.events.map((event) => {
              const { month, day } = formatMonthDay(event.eventDate);

              return (
                <article className="event-card" key={event.id}>
                  <Link
                    className="event-card__content-link"
                    href={event.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="event-date">
                      <span>{month}</span>
                      <strong>{day}</strong>
                    </div>
                    <div className="event-card__body">
                      <p className="feature-label">
                        {event.format} • {event.audience}
                      </p>
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                      <p className="event-meta">
                        {formatDateTime(event.eventDate)} • {event.location}
                      </p>
                      <span className="event-card__cta">Open official event page</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <div className="section-panel">
          <SectionHeading
            eyebrow="More ways to stay connected"
            intro="A wider mix of virtual and national events helps you stay connected even when nothing local fits yet."
            title="National and online options."
          />
          <div className="stack-list">
            {eventSections.broader.slice(0, 3).map((event) => (
              <article className="sub-card" key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
                <p className="meta-copy">
                  {formatDateTime(event.eventDate)} • {event.location}
                </p>
                <Link
                  className="text-link"
                  href={event.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open event page
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Message board"
          intro="Drop into encouraging conversations whenever you want ideas, reassurance, or practical tips."
          title="Support happening in the community today."
        />
        <div className="card-grid card-grid--three">
          {recentPosts.slice(0, 3).map((post) => (
            <article className="feature-card" key={post.id}>
              <p className="feature-label">{post.topic}</p>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <p className="meta-copy">
                {post.authorName} • {formatDateTime(post.createdAt)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Real voices"
          intro="A few words from autistic advocates and leaders who have helped shape the conversation."
          title="Words worth carrying with you."
        />
        <div className="card-grid card-grid--three">
          {profileQuotes.map((quote) => (
            <article className="feature-card" key={quote.author}>
              <p>{quote.quote}</p>
              <p className="feature-label">
                {quote.author} • {quote.role}
              </p>
              <Link className="text-link" href={quote.href} rel="noreferrer" target="_blank">
                {quote.sourceLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

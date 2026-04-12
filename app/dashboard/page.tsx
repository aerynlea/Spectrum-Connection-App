import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { updateProfileAction } from "@/app/actions";
import { GoalCheckboxes } from "@/components/goal-checkboxes";
import { SaveResourceForm } from "@/components/save-resource-form";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { requireCurrentUser } from "@/lib/auth";
import { ageGroupOptions, roleOptions } from "@/lib/catalog";
import {
  listCommunityPosts,
  listEvents,
  listResources,
  listSavedResources,
} from "@/lib/data";
import { formatDateTime, formatGoal, formatMonthDay } from "@/lib/formatters";
import { buildRecommendations } from "@/lib/recommendations";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type DashboardPageProps = {
  searchParams?: PageSearchParams;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  noStore();

  const currentUser = await requireCurrentUser();
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const resources = await listResources(currentUser.id);
  const savedResources = await listSavedResources(currentUser.id);
  const events = await listEvents();
  const recentPosts = await listCommunityPosts(3);
  const recommendations = buildRecommendations(currentUser, resources, events);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Dashboard</p>
        <h1>Your support space now responds to your profile and priorities.</h1>
        <p className="hero-lead">
          Save what matters, keep your profile current, and use the dashboard as
          the hub between resources, events, and community support.
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
          <span>Matched recommendations</span>
        </article>
        <article className="stat-card stat-card--wide">
          <strong>{recommendations.events.length}</strong>
          <span>Relevant upcoming events</span>
        </article>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Profile settings"
            intro="Profile signals drive the recommendation engine, so this is where we tune what the app should surface first."
            title="Keep your support profile current."
          />
          <form action={updateProfileAction} className="form-card">
            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input defaultValue={currentUser.name} name="name" required type="text" />
              </label>
              <label className="field">
                <span>Location</span>
                <input
                  defaultValue={currentUser.location}
                  name="location"
                  required
                  type="text"
                />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Your role</span>
                <select defaultValue={currentUser.role} name="role" required>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Current age focus</span>
                <select defaultValue={currentUser.ageGroup} name="ageGroup" required>
                  {ageGroupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field">
              <span>Priority goals</span>
              <p className="field-help">
                These goals shape the resources and events that get the highest recommendation scores.
              </p>
              <GoalCheckboxes selected={currentUser.goals} />
            </div>

            <button className="button-primary" type="submit">
              Save profile
            </button>
          </form>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Recommended resources"
            intro="These are scored from your role, age focus, selected goals, and current saved-resource history."
            title="A better starting point for your next step."
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Saved resources"
            intro="Everything you bookmark stays here so the app can feel more like a workspace than a one-time browse."
            title="Your saved list."
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
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                You have not saved any resources yet. Start with the resource
                hub and bookmark the options that feel useful.
              </p>
              <Link className="button-secondary" href="/resources">
                Explore resources
              </Link>
            </div>
          )}
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Upcoming matches"
            intro="Event matches are based on role and age-stage fit, with virtual formats getting a slight flexibility boost."
            title="Events you may want to keep an eye on."
          />
          <div className="stack-list">
            {recommendations.events.map((event) => {
              const { month, day } = formatMonthDay(event.eventDate);

              return (
                <article className="event-card" key={event.id}>
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
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Recent conversations"
          intro="Community posts can become another recommendation signal later, but they are already available to browse and contribute to."
          title="Support happening in the forum right now."
        />
        <div className="card-grid card-grid--three">
          {recentPosts.map((post) => (
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
    </div>
  );
}

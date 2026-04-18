import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { ResourceCard } from "@/components/resources/resource-card";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { listResources } from "@/lib/data";
import {
  buildResourceCollectionPath,
  getFilteredResources,
  getResourceDirectoryOptions,
  getResourceQuickStartByCollectionName,
  getResourceQuickStartSummaries,
} from "@/lib/resources";
import { getQueryMessage } from "@/lib/search-params";

type ResourcesPageProps = {
  searchParams?: Promise<{
    query?: string;
    category?: string;
    collection?: string;
    ageGroup?: string;
    message?: string;
    error?: string;
  }>;
};

function buildReturnTo(params: {
  query: string;
  category: string;
  collection: string;
  ageGroup: string;
}) {
  const search = new URLSearchParams();

  if (params.query) {
    search.set("query", params.query);
  }

  if (params.category) {
    search.set("category", params.category);
  }

  if (params.collection) {
    search.set("collection", params.collection);
  }

  if (params.ageGroup) {
    search.set("ageGroup", params.ageGroup);
  }

  const queryString = search.toString();
  return queryString ? `/resources?${queryString}` : "/resources";
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  noStore();

  const currentUser = await getCurrentUser();
  const resolvedParams = (await searchParams) ?? {};
  const message = await getQueryMessage(searchParams, "message");
  const error = await getQueryMessage(searchParams, "error");
  const filters = {
    query: resolvedParams.query ?? "",
    category: resolvedParams.category ?? "",
    collection: resolvedParams.collection ?? "",
    ageGroup: resolvedParams.ageGroup ?? "",
  };
  const resources = await listResources(currentUser?.id);
  const filteredResources = getFilteredResources(resources, filters);
  const quickStarts = getResourceQuickStartSummaries(resources);
  const options = getResourceDirectoryOptions(resources);
  const returnTo = buildReturnTo(filters);
  const selectedQuickStart = filters.collection
    ? getResourceQuickStartByCollectionName(filters.collection)
    : null;

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Find support</p>
        <h1>Support for home, school, community, and everyday life.</h1>
        <p className="hero-lead">
          Browse trusted links for school and insurance questions, theme park
          access, spectrum-friendly playplaces, haircut support, caregiver
          applications, communication tools, PBS videos, and everyday sensory
          help in one place that feels easier to return to.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section">
        <SectionHeading
          eyebrow="Guided pages"
          intro="If you would rather begin with a calmer path, these pages bring common questions together for you."
          title="Open a page built around one need at a time."
        />
        <div className="card-grid card-grid--two">
          <Link className="feature-card" href="/california-guide">
            <p className="feature-label">California guide</p>
            <h3>Follow school, insurance, and caregiver steps in one place.</h3>
            <p>
              Use a simpler California-focused page for IEPs, evaluations,
              insurance questions, and family support links.
            </p>
          </Link>
          <Link className="feature-card" href="/outings">
            <p className="feature-label">Outings guide</p>
            <h3>Plan family outings with more predictability and less pressure.</h3>
            <p>
              Open a calmer planning page for theme parks, playplaces, quiet
              spaces, and travel-friendly sensory support.
            </p>
          </Link>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Start here"
          intro="Begin with the kind of help that feels most useful today."
          title="Choose the support you need right now."
        />
        <div className="card-grid card-grid--five">
          {quickStarts.map((quickStart) => (
            <Link
              className="feature-card"
              href={buildResourceCollectionPath(quickStart.slug)}
              key={quickStart.slug}
            >
              <p className="feature-label">
                {quickStart.eyebrow} • {quickStart.count} links
              </p>
              <h3>{quickStart.title}</h3>
              <p>{quickStart.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Narrow it down"
            intro="Use just a few filters to make the list feel easier to manage."
            title="Search by need, age, or type of support."
          />

          <form className="form-card">
            <div className="field-grid">
              <label className="field">
                <span>Search</span>
                <input
                  defaultValue={filters.query}
                  name="query"
                  placeholder="Search school help, Disney DAS, playplaces, haircuts, AAC, PBS, and more"
                  type="text"
                />
              </label>

              <label className="field">
                <span>Support area</span>
                <select defaultValue={filters.collection} name="collection">
                  <option value="">All support areas</option>
                  {options.collections.map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Category</span>
                <select defaultValue={filters.category} name="category">
                  <option value="">All categories</option>
                  {options.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Age focus</span>
                <select defaultValue={filters.ageGroup} name="ageGroup">
                  <option value="">All ages</option>
                  {options.ageGroups.map((ageGroup) => (
                    <option key={ageGroup.value} value={ageGroup.value}>
                      {ageGroup.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="button-row" style={{ marginTop: "0.35rem" }}>
              <button className="button-primary" type="submit">
                Show matches
              </button>
              {selectedQuickStart ? (
                <Link
                  className="button-secondary"
                  href={buildResourceCollectionPath(selectedQuickStart.slug)}
                >
                  Open support page
                </Link>
              ) : null}
              <Link className="button-secondary" href="/resources">
                Clear filters
              </Link>
            </div>
          </form>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Helpful to know"
            intro="California families often have more than one system to work through at the same time."
            title="School support and insurance support usually do not run through the same doorway."
          />
          <ul className="bullet-list bullet-list--wide">
            <li>A school district evaluation helps decide special education eligibility and school services.</li>
            <li>A medical or insurance evaluation is a separate path for diagnosis, treatment, and coverage.</li>
            <li>You will also find official outing links here for DAS, access passes, maps, and calmer care spaces.</li>
            <li>Families can browse playplaces, speaking tools, fidgets, swings, and fort-building ideas in the same hub.</li>
          </ul>
          <p className="meta-copy">
            This California note is a practical guide for families and not legal
            advice. When in doubt, the official school and insurance pages below
            can help you prepare for both conversations.
          </p>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Support matches"
          intro={`Showing ${filteredResources.length} resource${filteredResources.length === 1 ? "" : "s"} that fit what you picked.`}
          title="Options you can explore now."
        />

        {filteredResources.length > 0 ? (
          <div className="stack-list">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                returnTo={returnTo}
                showSaveAction={Boolean(currentUser)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              Nothing matched that combination yet. Try a broader search or
              clear a filter to bring more options back into view.
            </p>
            <Link className="button-secondary" href="/resources">
              Show everything again
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

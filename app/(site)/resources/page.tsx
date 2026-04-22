import Link from "next/link";

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

function buildResourcesPath(params: {
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

function buildFilterLink(
  currentFilters: {
    query: string;
    category: string;
    collection: string;
    ageGroup: string;
  },
  nextFilters: Partial<{
    query: string;
    category: string;
    collection: string;
    ageGroup: string;
  }>,
) {
  return buildResourcesPath({
    ...currentFilters,
    ...nextFilters,
  });
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const [currentUser, resolvedParams, message, error] = await Promise.all([
    getCurrentUser(),
    searchParams,
    getQueryMessage(searchParams, "message"),
    getQueryMessage(searchParams, "error"),
  ]);
  const safeParams = resolvedParams ?? {};
  const filters = {
    query: safeParams.query ?? "",
    category: safeParams.category ?? "",
    collection: safeParams.collection ?? "",
    ageGroup: safeParams.ageGroup ?? "",
  };
  const resources = await listResources(currentUser?.id);
  const filteredResources = getFilteredResources(resources, filters);
  const quickStarts = getResourceQuickStartSummaries(resources);
  const options = getResourceDirectoryOptions(resources);
  const returnTo = buildResourcesPath(filters);
  const selectedQuickStart = filters.collection
    ? getResourceQuickStartByCollectionName(filters.collection)
    : null;
  const featuredLinks = filteredResources.slice(0, 5);
  const categoryShortcutOptions = options.categories.slice(0, 6);

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

      <section className="section split-layout">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Quick filters"
            intro="Use a few fast filters first, then jump straight into the links that match."
            title="Get to the right kind of help faster."
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

          <div className="form-card resource-shortcuts-card">
            <div className="resource-shortcuts-card__section">
              <h3>Quick subject filters</h3>
              <div className="pill-list pill-list--compact">
                {quickStarts.map((quickStart) => (
                  <Link
                    className={
                      filters.collection === quickStart.collectionName
                        ? "pill pill--soft pill--active"
                        : "pill pill--soft"
                    }
                    href={buildFilterLink(filters, {
                      collection: quickStart.collectionName,
                      category: "",
                    })}
                    key={quickStart.slug}
                  >
                    {quickStart.eyebrow}
                  </Link>
                ))}
              </div>
            </div>

            <div className="resource-shortcuts-card__section">
              <h3>Category shortcuts</h3>
              <div className="pill-list pill-list--compact">
                {categoryShortcutOptions.map((category) => (
                  <Link
                    className={
                      filters.category === category
                        ? "pill pill--soft pill--active"
                        : "pill pill--soft"
                    }
                    href={buildFilterLink(filters, { category })}
                    key={category}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Open links faster"
            intro={`Showing the first ${featuredLinks.length} official link${featuredLinks.length === 1 ? "" : "s"} that match what you have picked so far.`}
            title="Helpful links closer to the top."
          />
          {featuredLinks.length > 0 ? (
            <div className="stack-list">
              {featuredLinks.map((resource) => (
                <article className="sub-card" key={resource.id}>
                  <p className="feature-label">
                    {resource.collectionName} • {resource.organization}
                  </p>
                  <h3>{resource.title}</h3>
                  <p>{resource.summary}</p>
                  <div className="button-row button-row--compact">
                    <Link
                      className="button-primary"
                      href={resource.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open official site
                    </Link>
                    <Link className="button-secondary" href={`/resources/${resource.id}`}>
                      See Guiding Light details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                Nothing is matching yet. Try a broader search or clear one filter
                to bring fast links back into view.
              </p>
            </div>
          )}
        </div>
      </section>

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

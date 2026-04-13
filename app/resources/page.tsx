import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { ResourceCard } from "@/components/resources/resource-card";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentUser } from "@/lib/auth";
import { listResources } from "@/lib/data";
import {
  getFilteredResources,
  getResourceDirectoryOptions,
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

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Resource Directory</p>
        <h1>Real resources for support at home, in community, and online.</h1>
        <p className="hero-lead">
          Browse verified resources for therapies, haircut and grooming
          support, caregiver applications, PBS videos, learning links, and
          spectrum-friendly digital spaces in one place that feels easier to
          return to.
        </p>
      </section>

      <StatusBanner message={message} />
      <StatusBanner message={error} tone="error" />

      <section className="section">
        <SectionHeading
          eyebrow="Quick starts"
          intro="Start with the kind of help you need right now instead of scrolling through everything at once."
          title="A calmer way to open the directory."
        />
        <div className="card-grid card-grid--four">
          {quickStarts.map((quickStart) => (
            <Link
              className="feature-card"
              href={{
                pathname: "/resources",
                query: { collection: quickStart.collectionName },
              }}
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
            eyebrow="Find the right fit"
            intro="Use just a few filters to narrow the list without making the page feel busy."
            title="Filter by need, age focus, or collection."
          />

          <form className="form-card">
            <div className="field-grid">
              <label className="field">
                <span>Search</span>
                <input
                  defaultValue={filters.query}
                  name="query"
                  placeholder="Search PBS, caregiver benefits, learning tools, and more"
                  type="text"
                />
              </label>

              <label className="field">
                <span>Collection</span>
                <select defaultValue={filters.collection} name="collection">
                  <option value="">All collections</option>
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
                Update results
              </button>
              <Link className="button-secondary" href="/resources">
                Clear filters
              </Link>
            </div>
          </form>
        </div>

        <div className="section-panel section-panel--accent">
          <SectionHeading
            eyebrow="Helpful for home"
            intro="These newer sections were added for families who want quick access to everyday digital support."
            title="What you can find here now."
          />
          <ul className="bullet-list bullet-list--wide">
            <li>Spectrum-friendly gaming and online community links.</li>
            <li>PBS and PBS KIDS videos you can open right away.</li>
            <li>Learning tools for younger children and family support routines.</li>
            <li>Official caregiver application and benefit pages for at-home support.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Results"
          intro={`Showing ${filteredResources.length} resource${filteredResources.length === 1 ? "" : "s"} that match your current filters.`}
          title="Verified resources you can actually use."
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
              Nothing matched those filters yet. Try a broader search or clear
              one filter to bring more options back into view.
            </p>
            <Link className="button-secondary" href="/resources">
              Reset the directory
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

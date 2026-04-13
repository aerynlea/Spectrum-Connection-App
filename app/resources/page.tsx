import { ResourceCard } from "@/components/resources/resource-card";
import { SectionHeading } from "@/components/section-heading";
import { getFilteredResources } from "@/lib/resources";

type ResourcesPageProps = {
  searchParams?: Promise<{
    query?: string;
    category?: string;
  }>;
};

const categories = ["", "Therapy", "Community", "Employment"];

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.query ?? "";
  const category = params.category ?? "";
  const resources = getFilteredResources(query, category);

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">Resource Directory</p>
        <h1>Find support that matches your needs and stage of life.</h1>
        <p className="hero-lead">
          Explore community-shared and verified resources in a format designed
          to feel clear, supportive, and easy to revisit.
        </p>
      </section>

      <section className="section">
        <div className="section-panel">
          <SectionHeading
            eyebrow="Support options"
            title="Resources organized to reduce overwhelm."
            intro="Search by keyword or filter by category to find the support that feels most relevant right now."
          />

          <form className="form-card" style={{ marginBottom: "1.5rem" }}>
            <div className="field-grid">
              <label className="field">
                <span>Search</span>
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Search by title or description"
                />
              </label>

              <label className="field">
                <span>Category</span>
                <select name="category" defaultValue={category}>
                  {categories.map((item) => (
                    <option key={item || "all"} value={item}>
                      {item || "All categories"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button className="button-primary" type="submit">
                Apply filters
              </button>
            </div>
          </form>

          {resources.length > 0 ? (
            <div className="stack-list">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                No resources matched your search yet. Try a different keyword or
                clear the category filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
import Link from "next/link";

import { SaveResourceForm } from "@/components/save-resource-form";
import { formatAgeGroup } from "@/lib/formatters";
import type { DirectoryResource } from "@/lib/resources";

type ResourceCardProps = {
  resource: DirectoryResource;
  returnTo: string;
  showSaveAction?: boolean;
};

function formatAudienceTag(value: string) {
  return value.replace(/^Parents and caregivers$/i, "Caregivers");
}

export function ResourceCard({
  resource,
  returnTo,
  showSaveAction = true,
}: ResourceCardProps) {
  return (
    <article className="resource-card">
      <div className="resource-card__header">
        <div>
          <h2>{resource.title}</h2>
          <p>
            {resource.collectionName} • {resource.organization}
          </p>
        </div>
        <span className="tag-chip">
          {resource.verified ? "Verified" : "Community Shared"}
        </span>
      </div>

      <p>{resource.summary}</p>

      <div className="pill-list pill-list--compact">
        <span className="pill pill--soft">{resource.category}</span>
        <span className="pill pill--soft">
          {resource.ageGroup === "all" ? "All ages" : formatAgeGroup(resource.ageGroup)}
        </span>
        <span className="pill pill--soft">{formatAudienceTag(resource.audience)}</span>
      </div>

      <div className="resource-meta">
        <div className="resource-meta__group">
          <span>{resource.locationScope}</span>
          <span>{resource.savedCount} saves</span>
        </div>
        <div className="resource-actions">
          <Link className="text-link" href={`/resources/${resource.id}`}>
            See details
          </Link>
          <Link
            className="text-link"
            href={resource.href}
            rel="noreferrer"
            target="_blank"
          >
            Official site
          </Link>
          {showSaveAction ? (
            <SaveResourceForm
              isSaved={resource.isSaved}
              resourceId={resource.id}
              returnTo={returnTo}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

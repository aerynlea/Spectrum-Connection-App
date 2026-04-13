import Link from "next/link";

import type { Resource } from "@/lib/resources/types";

type ResourceCardProps = {
  resource: Resource;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link href={`/resources/${resource.id}`} className="thread-card">
      <div className="thread-card__meta">
        <div>
          <h3>{resource.title}</h3>
          <p>{resource.location}</p>
        </div>
        <span className="tag-chip">
          {resource.verified ? "Verified" : "Shared"}
        </span>
      </div>

      <p>{resource.description}</p>

      <p className="meta-copy">
        {resource.category} • {resource.ageGroup}
      </p>
    </Link>
  );
}
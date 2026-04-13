import { ageGroupOptions } from "@/lib/catalog";
import { resourceQuickStarts } from "@/lib/resources/data";
import type {
  DirectoryResource,
  ResourceDirectoryFilters,
  ResourceDirectoryOptions,
} from "@/lib/resources/types";

export * from "./data";
export * from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right),
  );
}

export function getResourceById(resources: DirectoryResource[], id: string) {
  return resources.find((resource) => resource.id === id);
}

export function getFilteredResources(
  resources: DirectoryResource[],
  filters: ResourceDirectoryFilters,
) {
  const query = normalize(filters.query);
  const category = normalize(filters.category);
  const collection = normalize(filters.collection);
  const ageGroup = normalize(filters.ageGroup);

  return resources.filter((resource) => {
    const searchable = [
      resource.title,
      resource.summary,
      resource.collectionName,
      resource.category,
      resource.organization,
      resource.audience,
      resource.locationScope,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = query ? searchable.includes(query) : true;
    const matchesCategory = category
      ? normalize(resource.category) === category
      : true;
    const matchesCollection = collection
      ? normalize(resource.collectionName) === collection
      : true;
    const matchesAgeGroup = ageGroup
      ? resource.ageGroup === "all" || normalize(resource.ageGroup) === ageGroup
      : true;

    return matchesQuery && matchesCategory && matchesCollection && matchesAgeGroup;
  });
}

export function getResourceDirectoryOptions(
  resources: DirectoryResource[],
): ResourceDirectoryOptions {
  const categories = uniqueSorted(resources.map((resource) => resource.category));
  const collections = uniqueSorted(
    resources.map((resource) => resource.collectionName),
  );
  const ageGroups = uniqueSorted(
    resources
      .map((resource) => resource.ageGroup)
      .filter((ageGroup) => ageGroup !== "all"),
  );

  return {
    categories,
    collections,
    ageGroups: ageGroups.map((value) => ({
      value,
      label:
        ageGroupOptions.find((option) => option.value === value)?.label ?? value,
    })),
  };
}

export function getResourceQuickStartSummaries(resources: DirectoryResource[]) {
  return resourceQuickStarts.map((quickStart) => ({
    ...quickStart,
    count: resources.filter(
      (resource) => resource.collectionName === quickStart.collectionName,
    ).length,
  }));
}

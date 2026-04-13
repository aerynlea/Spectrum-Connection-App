import type { ResourceRecord } from "@/lib/app-types";

export type ResourceDirectoryFilters = {
  query: string;
  category: string;
  collection: string;
  ageGroup: string;
};

export type ResourceDirectoryOptions = {
  categories: string[];
  collections: string[];
  ageGroups: Array<{
    value: string;
    label: string;
  }>;
};

export type ResourceQuickStart = {
  slug: string;
  title: string;
  description: string;
  collectionName: string;
  eyebrow: string;
};

export type ResourceQuickStartSummary = ResourceQuickStart & {
  count: number;
};

export type DirectoryResource = ResourceRecord;

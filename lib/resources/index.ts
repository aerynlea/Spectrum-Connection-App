import { resources } from "./data";

export function listResources() {
  return resources;
}

export function getResourceById(id: string) {
  return resources.find((resource) => resource.id === id);
}

export function getFilteredResources(query: string, category: string) {
  return resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(query.toLowerCase()) ||
      resource.description.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = category
      ? resource.category.toLowerCase() === category.toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });
}
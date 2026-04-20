import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guiding Light",
    short_name: "Guiding Light",
    description:
      "Autism-focused support, resources, events, and community for autistic people, families, caregivers, and trusted professionals.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5ff",
    theme_color: "#5a7be8",
    orientation: "portrait",
    categories: ["health", "education", "lifestyle", "social"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

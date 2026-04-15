import { unstable_noStore as noStore } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { getStats, listCommunityPosts, listEvents, listResources } from "@/lib/data";
import { getQueryMessage, type PageSearchParams } from "@/lib/search-params";

type HomePageProps = {
  searchParams?: Promise<PageSearchParams> | PageSearchParams;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  noStore();

  const currentUser = await getCurrentUser();

  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<PageSearchParams>).then === "function"
      ? await (searchParams as Promise<PageSearchParams>)
      : (searchParams as PageSearchParams | undefined);

  const message = await getQueryMessage(resolvedSearchParams, "message");
  const stats = await getStats();
  const posts = await listCommunityPosts(3);
  const events = await listEvents();

  const resources = currentUser ? await listResources(currentUser.id) : [];

  return (
    <main className="page" style={{ padding: "40px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: "12px",
          }}
        >
          Recovery Mode
        </p>

        <h1 style={{ fontSize: "3rem", lineHeight: 1.05, marginBottom: "16px" }}>
          Guiding Light is live ✅
        </h1>

        <p style={{ fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "680px", marginBottom: "32px" }}>
          The homepage is temporarily running in a safe mode while we restore the full experience.
        </p>

        {message ? (
          <div
            style={{
              marginBottom: "24px",
              padding: "16px 20px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <strong>Status:</strong> {message}
          </div>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>User</h2>
            <p>{currentUser ? "Signed in" : "Browsing as guest"}</p>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>Resources</h2>
            <p>{resources.length} loaded</p>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>Events</h2>
            <p>{events.length} loaded</p>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <h2 style={{ marginBottom: "8px", fontSize: "1.1rem" }}>Community Posts</h2>
            <p>{posts.length} loaded</p>
          </div>
        </section>

        <section
          style={{
            padding: "24px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>Stats check</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {JSON.stringify(stats, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
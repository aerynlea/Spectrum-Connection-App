import { hasAdminLookupAccess } from "@/lib/admin-access";
import { listMemberRoster } from "@/lib/data";

export const runtime = "nodejs";

function escapeCsvCell(value: string) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export async function GET(request: Request) {
  const hasAccess = await hasAdminLookupAccess();

  if (!hasAccess) {
    return new Response("Not found.", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") === "newsletter" ? "newsletter" : "all";
  const roster = await listMemberRoster();
  const filteredRoster =
    scope === "newsletter"
      ? roster.filter((entry) => entry.newsletterSubscribed)
      : roster;

  const lines = [
    "name,email",
    ...filteredRoster.map(
      (entry) => `${escapeCsvCell(entry.name)},${escapeCsvCell(entry.email)}`,
    ),
  ];
  const fileLabel =
    scope === "newsletter" ? "guiding-light-newsletter.csv" : "guiding-light-roster.csv";

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileLabel}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

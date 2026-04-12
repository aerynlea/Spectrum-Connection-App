export type PageSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | undefined;

export async function getQueryMessage(
  searchParams: PageSearchParams,
  key: "error" | "message",
) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const value = resolvedParams?.[key];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

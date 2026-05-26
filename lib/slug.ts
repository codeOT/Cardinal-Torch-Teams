export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(base) || "department";
  let suffix = 1;

  while (await exists(slug)) {
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }

  return slug;
}

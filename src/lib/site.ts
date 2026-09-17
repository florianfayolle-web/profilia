// Single source of truth for the site's brand name and canonical URL, used
// in metadata, structured data, and anywhere else it needs to be consistent.
export const SITE_NAME = "Profilia";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

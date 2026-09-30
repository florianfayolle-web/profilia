// Shared by every /admin/* page: only the site owner(s) listed in
// ADMIN_EMAILS can see these pages — everyone else gets a plain 404 (see
// each page's notFound() call), same as a route that doesn't exist, rather
// than a "forbidden" page that would reveal there's something here to
// protect.
export function isAdmin(email: string | undefined) {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return !!email && allowed.includes(email.toLowerCase());
}

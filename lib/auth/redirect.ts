const AUTH_PATHS = ["/login", "/signup"];

/** Paths that require an admin account */
const ADMIN_ONLY_PATHS = ["/admin"];

export function getPostAuthPath(
  isAdmin: boolean,
  from?: string | null,
): string {
  const safeFrom =
    from && !AUTH_PATHS.includes(from) && from.startsWith("/") ? from : null;

  if (safeFrom && ADMIN_ONLY_PATHS.some((p) => safeFrom.startsWith(p))) {
    return isAdmin ? safeFrom : "/";
  }

  if (safeFrom) {
    return safeFrom;
  }

  return isAdmin ? "/admin" : "/";
}
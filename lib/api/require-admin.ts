import { requireAuth } from "@/lib/api/require-auth";
import { jsonError } from "@/lib/api/errors";

export async function requireAdmin() {
  const auth = await requireAuth();
  if ("error" in auth) {
    return auth;
  }

  if (!auth.user.isAdmin) {
    return { error: jsonError("Forbidden", 403) };
  }

  return auth;
}

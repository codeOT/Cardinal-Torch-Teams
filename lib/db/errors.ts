import { isMongoAuthError, mongoConnectionHelp } from "@/lib/db/mongo-uri";
import { jsonError } from "@/lib/api/errors";

export function handleDbError(err: unknown, fallback = "Request failed") {
  if (isMongoAuthError(err)) {
    console.error("MongoDB auth error:", err);
    return jsonError(
      "Database connection failed. Check MONGODB_URI (or Atlas user/password) in .env.local.",
      503,
    );
  }
  console.error(fallback, err);
  return jsonError(fallback, 500);
}

export { isMongoAuthError, mongoConnectionHelp };

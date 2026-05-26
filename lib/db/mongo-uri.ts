/**
 * Resolves MongoDB connection string from env.
 * Prefer MONGODB_URI, or set MONGODB_USER + MONGODB_PASSWORD + MONGODB_HOST
 * (password is URL-encoded automatically — safe for special characters).
 */
export function getMongoUri(): string | undefined {
  const direct = process.env.MONGODB_URI?.trim();
  if (direct) return direct;

  const user = process.env.MONGODB_USER?.trim();
  const password = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST?.trim();

  if (!user || !password || !host) {
    return undefined;
  }

  const db =
    process.env.MONGODB_DB_NAME?.trim() ||
    process.env.MONGODB_DATABASE?.trim() ||
    "team-center";

  const params = new URLSearchParams();
  params.set("retryWrites", "true");
  params.set("w", "majority");
  if (process.env.MONGODB_APP_NAME?.trim()) {
    params.set("appName", process.env.MONGODB_APP_NAME.trim());
  }

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${encodeURIComponent(db)}?${params}`;
}

export function isMongoAuthError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: number; codeName?: string; message?: string };
  return (
    e.code === 8000 ||
    e.codeName === "AtlasError" ||
    (typeof e.message === "string" &&
      (e.message.includes("bad auth") ||
        e.message.includes("Authentication failed")))
  );
}

export function mongoConnectionHelp(): string {
  return [
    "Cannot connect to MongoDB (authentication failed).",
    "",
    "In MongoDB Atlas:",
    "1. Database Access — confirm username and password (or reset the password).",
    "2. Network Access — allow your IP (or 0.0.0.0/0 for local dev).",
    "3. Connect → Drivers — copy a fresh connection string into .env.local.",
    "",
    "If the password has @ # : / etc., either URL-encode it in MONGODB_URI, or use:",
    "  MONGODB_USER=...",
    "  MONGODB_PASSWORD=...",
    "  MONGODB_HOST=cluster0.xxxxx.mongodb.net",
    "",
    "Then run: npm run db:test",
  ].join("\n");
}

import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { getSession } from "@/lib/auth/session";
import { serializeUser } from "@/lib/serializers";
import { jsonUnauthorized } from "@/lib/api/errors";
import type { TeamMember } from "@/lib/types";

export async function requireAuth(): Promise<
  { user: TeamMember } | { error: Response }
> {
  const session = await getSession();
  if (!session) {
    return { error: jsonUnauthorized() };
  }

  await connectDB();
  const doc = await User.findOne({ memberId: session.memberId });
  if (!doc) {
    return { error: jsonUnauthorized() };
  }

  return { user: serializeUser(doc) };
}

import { NextResponse } from "next/server";

import { getSession, setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { serializeUser } from "@/lib/serializers";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  await connectDB();
  const user = await User.findOne({ memberId: session.memberId });
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const isAdmin = user.isAdmin ?? false;
  if (session.isAdmin !== isAdmin) {
    await setSessionCookie({
      memberId: user.memberId,
      email: user.email,
      isAdmin,
    });
  }

  return NextResponse.json({ user: serializeUser(user) });
}

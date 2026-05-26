import { NextResponse } from "next/server";

import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export async function POST() {
  const session = await getSession();

  if (session) {
    await connectDB();
    await User.updateOne({ memberId: session.memberId }, { isOnline: false });
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

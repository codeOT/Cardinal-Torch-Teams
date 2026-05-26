import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { serializeUser } from "@/lib/serializers";
import { jsonError } from "@/lib/api/errors";
import { handleDbError } from "@/lib/db/errors";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    await connectDB();

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return jsonError("Invalid email or password", 401);
    }

    user.isOnline = true;
    await user.save();

    await setSessionCookie({
      memberId: user.memberId,
      email: user.email,
      isAdmin: user.isAdmin ?? false,
    });

    return NextResponse.json({ user: serializeUser(user) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError("Invalid login data");
    }
    return handleDbError(err, "Login failed");
  }
}

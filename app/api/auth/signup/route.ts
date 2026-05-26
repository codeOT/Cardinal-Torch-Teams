import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { Department } from "@/lib/db/models/Department";
import { User } from "@/lib/db/models/User";
import { jsonError } from "@/lib/api/errors";
import { serializeUser } from "@/lib/serializers";
import { avatarColorFromName, initialsFromName } from "@/lib/user-utils";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().max(80).optional().default("Team member"),
  departmentId: z.string().min(1, "Select a department"),
});

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json());
    await connectDB();

    const department = await Department.findOne({
      departmentId: body.departmentId,
    });
    if (!department) {
      return jsonError("Selected department does not exist");
    }

    const email = body.email.toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (existing) {
      return jsonError("An account with this email already exists");
    }

    const name = body.name.trim();
    const memberId = `m-${Date.now()}`;
    const passwordHash = await hashPassword(body.password);

    const user = await User.create({
      memberId,
      email,
      passwordHash,
      name,
      role: body.role?.trim() || "Team member",
      departmentId: body.departmentId,
      avatarColor: avatarColorFromName(name),
      initials: initialsFromName(name),
      isOnline: true,
      isAdmin: false,
    });

    await setSessionCookie({
      memberId: user.memberId,
      email: user.email,
      isAdmin: false,
    });

    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.issues[0]?.message ?? "Invalid sign-up data");
    }
    console.error("Signup error:", err);
    return jsonError("Sign up failed", 500);
  }
}

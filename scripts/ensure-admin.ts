import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../lib/db/connect";
import { hashPassword } from "../lib/auth/password";
import { User } from "../lib/db/models/User";
import { avatarColorFromName, initialsFromName } from "../lib/user-utils";

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before running this script.",
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  await connectDB();
  const passwordHash = await hashPassword(password);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.isAdmin = true;
    existing.name = name;
    existing.role = "Administrator";
    existing.initials = initialsFromName(name);
    existing.avatarColor = avatarColorFromName(name);
    await existing.save();
    console.log(`Admin updated: ${email}`);
  } else {
    await User.create({
      memberId: `admin-${Date.now()}`,
      email,
      passwordHash,
      name,
      role: "Administrator",
      departmentId: "",
      avatarColor: avatarColorFromName(name),
      initials: initialsFromName(name),
      isOnline: false,
      isAdmin: true,
    });
    console.log(`Admin created: ${email}`);
  }

  console.log("Sign out and sign in again at /login to refresh your session.");
  process.exit(0);
}

ensureAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});

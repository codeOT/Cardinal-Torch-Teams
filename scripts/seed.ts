import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../lib/db/connect";
import { hashPassword } from "../lib/auth/password";
import { User } from "../lib/db/models/User";
import { Department } from "../lib/db/models/Department";
import { Task } from "../lib/db/models/Task";
import { DailyLog } from "../lib/db/models/DailyLog";
import { TaskComment } from "../lib/db/models/TaskComment";
import { Activity } from "../lib/db/models/Activity";

import { avatarColorFromName, initialsFromName } from "../lib/user-utils";

async function seed() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!email || !password) {
    console.error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before running seed.",
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Task.deleteMany({}),
    DailyLog.deleteMany({}),
    TaskComment.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const passwordHash = await hashPassword(password);

  await User.create({
    memberId: "admin-1",
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

  console.log("Database seeded successfully.");
  console.log(`Admin account: ${email}`);
  console.log("Use the admin panel to add departments.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

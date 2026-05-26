import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { DataLoader } from "@/components/layout/DataLoader";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { TeamDataProvider } from "@/lib/team-context";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?from=/admin");
  }

  await connectDB();
  const user = await User.findOne({ memberId: session.memberId });
  if (!user?.isAdmin) {
    redirect("/");
  }

  return (
    <TeamDataProvider>
      <AppShell>
        <DataLoader>{children}</DataLoader>
      </AppShell>
    </TeamDataProvider>
  );
}

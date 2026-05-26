import { AppShell } from "@/components/layout/AppShell";
import { DataLoader } from "@/components/layout/DataLoader";
import { TeamDataProvider } from "@/lib/team-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamDataProvider>
      <AppShell>
        <DataLoader>{children}</DataLoader>
      </AppShell>
    </TeamDataProvider>
  );
}

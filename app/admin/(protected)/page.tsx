import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Admin</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage organization departments.
        </p>
      </div>
      <AdminPanel />
    </div>
  );
}

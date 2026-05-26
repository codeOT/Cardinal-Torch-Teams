import { redirect } from "next/navigation";

/** Convenience URL: /admin/login → sign-in with return to /admin */
export default function AdminLoginPage() {
  redirect("/login?from=/admin");
}

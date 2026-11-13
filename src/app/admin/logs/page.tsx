import { redirect } from "next/navigation";
import { ActivityLog } from "@/components/admin/ActivityLog";
import { listActivity } from "@/lib/activity";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const { rows, missingTable } = await listActivity();
  return <ActivityLog rows={rows} missingTable={missingTable} email={admin.email} />;
}

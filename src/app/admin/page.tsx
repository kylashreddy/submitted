import { redirect } from "next/navigation";
import { AdminBoard } from "@/components/admin/AdminBoard";
import { getAdmin } from "@/lib/auth";
import { crewNames } from "@/lib/content";
import { emailProvider } from "@/lib/email";
import { listRequests } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const rows = await listRequests();
  return <AdminBoard initial={rows} crew={crewNames()} email={admin.email} emailOn={emailProvider() !== null} />;
}

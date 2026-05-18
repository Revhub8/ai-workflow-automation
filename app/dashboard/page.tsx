import { DashboardPage } from "@/components/dashboard/dashboard-page";

export const metadata = {
  title: "Dashboard | AI Workflow Automation",
  description: "Operational analytics from processed workflow documents",
};

export default function DashboardRoute() {
  return (
    <main className="flex flex-1 flex-col">
      <DashboardPage />
    </main>
  );
}

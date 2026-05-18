import { HistoryPage } from "@/components/history/history-page";

export const metadata = {
  title: "History | AI Workflow Automation",
  description: "Search and browse saved workflow records",
};

export default function HistoryRoute() {
  return (
    <main className="flex flex-1 flex-col">
      <HistoryPage />
    </main>
  );
}

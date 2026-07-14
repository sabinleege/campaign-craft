import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — VideoMark AI" },
      { name: "description", content: "Campaign performance and history — deep dive." },
    ],
  }),
  component: AnalyticsPage,
});

const FILTERS = ["all", "pending_approval", "approved", "scheduled", "published", "draft"] as const;

function AnalyticsPage() {
  const hydrated = useHydrated();
  const campaigns = useAppStore((s) => s.campaigns);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep-dive campaign history. Live graphs live on the <Link to="/" className="text-primary hover:underline">Dashboard</Link>.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs capitalize ${filter === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <div className="divide-y divide-border">
          {filtered.map((c) => {
            const needsReview = c.status === "pending_approval";
            return (
              <div key={c.id} className="-mx-2 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted/50">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">Created {new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <Badge variant="secondary" className="capitalize">{c.status.replace(/_/g, " ")}</Badge>
                <span className="text-xs text-muted-foreground">{c.downloads} dl</span>
                <Link
                  to="/campaigns/$id"
                  params={{ id: c.id }}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${needsReview ? "bg-gradient-primary text-primary-foreground shadow-elegant" : "border border-border hover:bg-muted"}`}
                >
                  {needsReview ? "Review" : "Open"}
                </Link>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No campaigns in this filter.</p>}
        </div>
      </Card>
    </div>
  );
}

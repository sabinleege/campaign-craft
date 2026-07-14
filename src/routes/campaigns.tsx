import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns — VideoMark AI" }] }),
  component: CampaignsList,
});

const FILTERS = ["all", "pending_approval", "approved", "scheduled", "published", "draft", "rejected"] as const;

function CampaignsList() {
  const hydrated = useHydrated();
  const campaigns = useAppStore((s) => s.campaigns);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Every campaign — draft to published.</p>
        </div>
        <Link to="/campaigns/new" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-elegant">
          <Sparkles className="h-4 w-4" /> Generate Campaign
        </Link>
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
          {filtered.map((c) => (
            <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }}
              className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-sm hover:bg-muted/50">
              <div className="min-w-0">
                <div className="truncate font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <Badge variant="secondary" className="capitalize shrink-0">{c.status.replace(/_/g, " ")}</Badge>
            </Link>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No campaigns in this filter.</p>}
        </div>
      </Card>
    </div>
  );
}

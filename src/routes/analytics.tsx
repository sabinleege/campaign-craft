import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — VideoMark AI" },
      { name: "description", content: "Campaign performance and history." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const hydrated = useHydrated();
  const campaigns = useAppStore((s) => s.campaigns);
  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const metrics = [
    { label: "Published", value: campaigns.filter((c) => c.status === "published").length },
    { label: "Scheduled", value: campaigns.filter((c) => c.status === "scheduled").length },
    { label: "Pending approval", value: campaigns.filter((c) => c.status === "pending_approval").length },
    { label: "Drafts", value: campaigns.filter((c) => c.status === "draft").length },
    { label: "Video downloads", value: campaigns.reduce((n, c) => n + c.downloads, 0) },
    { label: "Emails delivered", value: campaigns.filter((c) => c.status === "published").length * 128 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">V1 metrics — expanded reporting coming later.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4">
            <div className="text-2xl font-bold">{m.value}</div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Campaign history</h2>
        <div className="mt-4 divide-y divide-border">
          {campaigns.map((c) => {
            const needsReview = c.status === "pending_approval";
            return (
              <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-muted/50">
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
          {campaigns.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No campaigns yet.</p>}
        </div>
      </Card>
    </div>
  );
}

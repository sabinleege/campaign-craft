import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Video, CalendarClock, Download, Plug, Package, Sparkles, ArrowRight, Palette, ShieldAlert, FileEdit, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — VideoMark AI" },
      { name: "description", content: "Campaign overview, recent activity, and quick actions." },
    ],
  }),
  component: Dashboard,
});

function statusColor(status: string): string {
  switch (status) {
    case "published": return "bg-success text-success-foreground";
    case "scheduled": return "bg-warning text-warning-foreground";
    case "pending_approval": return "bg-accent text-accent-foreground";
    case "approved": return "bg-primary text-primary-foreground";
    case "draft": return "bg-muted text-muted-foreground";
    case "rejected": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}

function statusLabel(s: string) { return s.replace(/_/g, " "); }

function Dashboard() {
  const hydrated = useHydrated();
  const campaigns = useAppStore((s) => s.campaigns);
  const products = useAppStore((s) => s.products);
  const channels = useAppStore((s) => s.channels);
  const brand = useAppStore((s) => s.brand);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const published = campaigns.filter((c) => c.status === "published").length;
  const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
  const pending = campaigns.filter((c) => c.status === "pending_approval").length;
  const drafts = campaigns.filter((c) => c.status === "draft").length;
  const downloads = campaigns.reduce((n, c) => n + c.downloads, 0);
  const connected = channels.filter((c) => c.connected).length;

  const stats = [
    { icon: Video, label: "Published", value: published },
    { icon: CalendarClock, label: "Scheduled", value: scheduled },
    { icon: ShieldAlert, label: "Pending approval", value: pending, highlight: pending > 0 },
    { icon: FileEdit, label: "Drafts", value: drafts },
    { icon: Download, label: "Video downloads", value: downloads },
    { icon: Plug, label: "Connected channels", value: `${connected}/${channels.length}` },
    { icon: Package, label: "Products", value: products.length },
  ];

  const activity = campaigns
    .slice()
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, 6)
    .map((c) => {
      const map: Record<string, string> = {
        pending_approval: "is pending your review",
        approved: "is approved and ready to publish",
        scheduled: `is scheduled for ${c.scheduledFor ? new Date(c.scheduledFor).toLocaleString() : "later"}`,
        published: "was published",
        draft: "was saved as draft",
        rejected: "was rejected",
        generating: "is generating…",
      };
      return { id: c.id, name: c.name, text: map[c.status] ?? "was updated", status: c.status, when: c.createdAt };
    });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-elegant sm:flex-row sm:items-center sm:p-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest opacity-80">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{brand.name} Campaign Studio</h1>
          <p className="mt-2 max-w-xl text-sm opacity-90">Turn products into full multi-channel campaigns. Every asset is reviewed and approved before it ships.</p>
        </div>
        <Link to="/campaigns/new" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-background/95 px-4 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-[1.02]">
          <Sparkles className="h-4 w-4" /> Generate New Campaign
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {stats.map((s) => (
          <Card key={s.label} className={`p-4 ${s.highlight ? "border-primary bg-accent/40" : ""}`}>
            <s.icon className={`h-5 w-5 ${s.highlight ? "text-primary" : "text-primary"}`} />
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent campaigns</h2>
            <Link to="/campaigns/new" className="text-xs font-medium text-primary hover:underline">New campaign →</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {campaigns.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No campaigns yet. Generate your first one.</p>
            )}
            {campaigns.map((c) => (
              <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColor(c.status)} capitalize`}>{statusLabel(c.status)}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Brand Memory</h2>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Brand</div>
              <div className="font-semibold">{brand.name}</div>
              <div className="text-xs text-muted-foreground">{brand.tagline}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border border-border" style={{ backgroundColor: brand.primaryColor }} />
              <div>
                <div className="text-xs text-muted-foreground">Primary color</div>
                <div className="font-mono text-sm">{brand.primaryColor}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Font</div>
              <div className="text-sm">{brand.font}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tone of voice</div>
              <div className="text-sm">{brand.toneOfVoice}</div>
            </div>
            <Link to="/brand" className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline">Edit brand →</Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/campaigns/new" className="rounded-xl border border-dashed border-border p-4 text-sm hover:border-primary hover:bg-accent/40">
          <Sparkles className="mb-2 h-5 w-5 text-primary" /> Generate New Campaign
        </Link>
        <Link to="/channels" className="rounded-xl border border-dashed border-border p-4 text-sm hover:border-primary hover:bg-accent/40">
          <Plug className="mb-2 h-5 w-5 text-primary" /> Connect a channel
        </Link>
        <Link to="/products" className="rounded-xl border border-dashed border-border p-4 text-sm hover:border-primary hover:bg-accent/40">
          <Package className="mb-2 h-5 w-5 text-primary" /> Upload a product
        </Link>
      </section>
    </div>
  );
}

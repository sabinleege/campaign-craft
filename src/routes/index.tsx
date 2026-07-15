import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Sparkles, ShieldAlert, Palette, Activity, Plug, Package, TrendingUp, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend } from "recharts";
import { DashboardCalendar } from "../components/dashboard/DashboardCalendar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — VideoMark AI" },
      { name: "description", content: "Campaign overview, marketing goals, and unified analytics." },
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

function Dashboard() {
  const hydrated = useHydrated();
  const campaigns = useAppStore((s) => s.campaigns);
  const channels = useAppStore((s) => s.channels);
  const brand = useAppStore((s) => s.brand);
  const plan = useAppStore((s) => s.calendarPlan);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const goals = brand.marketingGoals;
  const today = new Date().toISOString().slice(0, 10);
  const todayItems = plan[today] ?? [];
  const pending = campaigns.filter((c) => c.status === "pending_approval");
  const connected = channels.filter((c) => c.connected);

  // Fake time-series data derived from campaigns (stable seed)
  const viewership = buildSeries(14, 200, 60);
  const engagement = buildSeries(14, 40, 15);
  const publishedSeries = buildSeries(14, 2, 2, true);
  const downloadsSeries = buildSeries(14, 15, 8);
  const emailSeries = buildSeries(14, 80, 30, true);
  const socialByNetwork = channels.filter((c) => c.connected && c.key !== "gmail" && c.key !== "whatsapp").map((c) => ({
    network: c.label,
    published: 3 + Math.floor(Math.random() * 8),
    scheduled: 1 + Math.floor(Math.random() * 4),
  }));

  const activity = campaigns.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="flex flex-col justify-between gap-6 rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-elegant sm:flex-row sm:items-center sm:p-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest opacity-80">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{brand.name}</h1>
          <p className="mt-1 max-w-xl text-sm opacity-90">{brand.tagline}</p>
        </div>
        <Link to="/campaigns/new" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-background/95 px-4 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-[1.02]">
          <Sparkles className="h-4 w-4" /> Generate New Campaign
        </Link>
      </section>

      {/* Goals + Today */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Marketing goals</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <GoalBar label="Awareness" value={goals.awareness} target={goals.awarenessTarget} />
            <GoalBar label="Leads" value={goals.leads} target={goals.leadsTarget} />
            <GoalBar label="Sales" value={goals.sales} target={goals.salesTarget} />
          </div>
          <Link to="/brand" className="mt-4 inline-block text-xs font-medium text-primary hover:underline">Adjust targets in Settings →</Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Today</h2>
          </div>
          <div className="mt-3 space-y-2">
            {pending.length > 0 && (
              <Link to="/campaigns/$id" params={{ id: pending[0].id }} className="block rounded-lg border border-primary/40 bg-accent/40 p-3 text-sm hover:border-primary">
                <div className="font-medium">Review pending</div>
                <div className="text-xs text-muted-foreground">{pending.length} campaign{pending.length === 1 ? "" : "s"} awaiting approval</div>
              </Link>
            )}
            {todayItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing scheduled today. <Link to="/calendar" className="text-primary hover:underline">Open calendar →</Link></p>
            ) : (
              todayItems.map((it) => (
                <div key={it.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-xs">
                  <span className="truncate">{it.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{it.kind}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      {/* Calendar */}
      <DashboardCalendar />

      {/* Analytics graphs */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Overall viewership & engagement" icon={<TrendingUp className="h-4 w-4 text-primary" />}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={viewership.map((v, i) => ({ day: `D${i + 1}`, views: v, engagement: engagement[i] }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engagement" stroke="#22C55E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Published campaigns over time">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={publishedSeries.map((v, i) => ({ day: `D${i + 1}`, published: v }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Bar dataKey="published" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Email delivery (connected channels)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={emailSeries.map((v, i) => ({ day: `D${i + 1}`, emails: v }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Area type="monotone" dataKey="emails" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Video downloads">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={downloadsSeries.map((v, i) => ({ day: `D${i + 1}`, downloads: v }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Line type="monotone" dataKey="downloads" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Social publishing status" className="lg:col-span-2">
          {socialByNetwork.length === 0 ? (
            <p className="grid h-40 place-items-center text-sm text-muted-foreground">Connect a social channel to see publishing status.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={socialByNetwork}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="network" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip contentStyle={{ borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="published" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="scheduled" stackId="a" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      {/* Recent activity + brand */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Campaign history</h2>
          </div>
          <div className="mt-4 divide-y divide-border">
            {activity.length === 0 && <p className="py-6 text-sm text-muted-foreground">No activity yet.</p>}
            {activity.map((c) => (
              <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-sm hover:bg-muted/50">
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <Badge className={`${statusColor(c.status)} capitalize shrink-0`}>{c.status.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Brand memory</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Palette</div>
              <div className="mt-1 flex gap-1 overflow-hidden rounded-md border border-border">
                <div className="h-8 flex-1" style={{ backgroundColor: brand.primaryColor }} />
                <div className="h-8 flex-1" style={{ backgroundColor: brand.secondaryColor }} />
                <div className="h-8 flex-1" style={{ backgroundColor: brand.accentColor }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><div className="text-muted-foreground">Fonts</div><div>{brand.font}</div></div>
              <div><div className="text-muted-foreground">Language</div><div>{brand.language}</div></div>
              <div className="col-span-2"><div className="text-muted-foreground">Tone</div><div>{brand.toneOfVoice}</div></div>
              <div className="col-span-2"><div className="text-muted-foreground">Preferred CTAs</div><div className="mt-1 flex flex-wrap gap-1">{brand.preferredCtas.map((c) => <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{c}</span>)}</div></div>
            </div>
            <Link to="/brand" className="text-xs font-medium text-primary hover:underline">Edit brand →</Link>
          </div>
        </Card>
      </section>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/campaigns/new" className="rounded-xl border border-dashed border-border p-4 text-sm hover:border-primary hover:bg-accent/40">
          <Sparkles className="mb-2 h-5 w-5 text-primary" /> Generate New Campaign
        </Link>
        <Link to="/channels" className="rounded-xl border border-dashed border-border p-4 text-sm hover:border-primary hover:bg-accent/40">
          <Plug className="mb-2 h-5 w-5 text-primary" /> Connect a channel ({connected.length}/{channels.length})
        </Link>
        <Link to="/products" className="rounded-xl border border-dashed border-border p-4 text-sm hover:border-primary hover:bg-accent/40">
          <Package className="mb-2 h-5 w-5 text-primary" /> Add a product
        </Link>
      </section>
    </div>
  );
}

function GoalBar({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, target)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground">{value} / {target}</span>
      </div>
      <Progress value={pct} className="mt-2 h-2" />
      <div className="mt-1 text-[10px] text-muted-foreground">{pct}% of target</div>
    </div>
  );
}

function ChartCard({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-6 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function buildSeries(len: number, base: number, jitter: number, allowZero = false): number[] {
  const out: number[] = [];
  let last = base;
  for (let i = 0; i < len; i++) {
    last = Math.max(allowZero ? 0 : 1, Math.round(last + (Math.random() - 0.4) * jitter));
    out.push(last);
  }
  return out;
}

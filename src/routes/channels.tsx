import { createFileRoute } from "@tanstack/react-router";
import { useAppStore, type ChannelKey } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Twitter, Video, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/channels")({
  head: () => ({
    meta: [
      { title: "Channels — VideoMark AI" },
      { name: "description", content: "Securely connect email, social, and messaging accounts." },
    ],
  }),
  component: ChannelsPage,
});

const ICON: Record<ChannelKey, React.ComponentType<{ className?: string }>> = {
  gmail: Mail, facebook: Facebook, instagram: Instagram, linkedin: Linkedin, x: Twitter, tiktok: Video, whatsapp: MessageCircle,
};

function ChannelsPage() {
  const hydrated = useHydrated();
  const channels = useAppStore((s) => s.channels);
  const toggle = useAppStore((s) => s.toggleChannel);
  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Channel connections</h1>
        <p className="text-sm text-muted-foreground">OAuth-based. Tokens are stored securely — never shown here.</p>
      </header>
      <div className="rounded-xl border border-border bg-accent/40 p-4 text-sm flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>Credentials are handled by the platform. This screen only shows connection status.</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((c) => {
          const Icon = ICON[c.key];
          return (
            <Card key={c.key} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.connected ? c.account : "Not connected"}</div>
                  </div>
                </div>
                <Badge variant={c.connected ? "default" : "secondary"} className={c.connected ? "bg-success text-success-foreground" : ""}>
                  {c.connected ? "Connected" : "Off"}
                </Badge>
              </div>
              <Button
                variant={c.connected ? "outline" : "default"}
                className={`mt-4 w-full ${c.connected ? "" : "bg-gradient-primary shadow-elegant"}`}
                onClick={() => { toggle(c.key); toast.success(`${c.label} ${c.connected ? "disconnected" : "connected"}`); }}
              >
                {c.connected ? "Disconnect" : "Connect"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

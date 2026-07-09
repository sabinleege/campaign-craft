import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAppStore, type SocialPost } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AlertTriangle, CheckCircle2, Download, Facebook, Instagram, Linkedin, Loader2, Mail, MessageCircle, Play, Send, Twitter, Video, XCircle, Calendar, Save, ShieldCheck } from "lucide-react";
import { VIDEO_PIPELINE_STEPS } from "../lib/mock-generate";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/campaigns/$id")({
  head: () => ({ meta: [{ title: "Campaign — VideoMark AI" }] }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const hydrated = useHydrated();
  const campaign = useAppStore((s) => s.campaigns.find((c) => c.id === id));
  const updateCampaign = useAppStore((s) => s.updateCampaign);
  const updateAssets = useAppStore((s) => s.updateAssets);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  if (!campaign) return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">Campaign not found.</p>
      <Link to="/" className="text-primary underline">Go home</Link>
    </div>
  );

  const a = campaign.assets;
  const approved = campaign.status === "approved" || campaign.status === "scheduled" || campaign.status === "published";

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">Dashboard</Link> / Campaigns
          </div>
          <h1 className="mt-1 truncate text-2xl font-bold">{campaign.name}</h1>
        </div>
        <Badge className="capitalize">{campaign.status.replace(/_/g, " ")}</Badge>
      </header>

      {campaign.status === "generating" && (
        <Card className="p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Still generating…</span>
        </Card>
      )}

      {a && (
        <>
          <VideoPipelineCard videoUrl={a.videoUrl} />

          <ApprovalGate campaign={campaign} onApprove={() => { updateCampaign(id, { status: "approved" }); toast.success("Campaign approved"); }} onReject={() => { updateCampaign(id, { status: "rejected" }); toast("Campaign rejected"); }} />

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Unified preview</h2>
            <p className="text-sm text-muted-foreground">Every channel asset. Edit anything before you approve.</p>

            <Tabs defaultValue="video" className="mt-4">
              <TabsList className="flex w-full flex-wrap justify-start gap-1 h-auto">
                <TabsTrigger value="video"><Video className="mr-1 h-3.5 w-3.5" />Video</TabsTrigger>
                <TabsTrigger value="social"><Facebook className="mr-1 h-3.5 w-3.5" />Social</TabsTrigger>
                <TabsTrigger value="email"><Mail className="mr-1 h-3.5 w-3.5" />Email</TabsTrigger>
                <TabsTrigger value="whatsapp"><MessageCircle className="mr-1 h-3.5 w-3.5" />WhatsApp</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
                <TabsTrigger value="landing">Landing</TabsTrigger>
                <TabsTrigger value="strategy">Strategy</TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-xl bg-black/95 p-6">
                    <div className="grid aspect-video place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                      <div className="text-center">
                        <Play className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm font-semibold">Video preview</p>
                        <p className="text-xs opacity-80">HyperFrames render (mock)</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="secondary"><Download className="mr-1 h-4 w-4" /> Download</Button>
                      <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-white/10">Regenerate</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <EditableField label="Script" rows={6} value={a.script} onChange={(v) => updateAssets(id, { script: v })} />
                    <EditableField label="Captions" rows={2} value={a.captions} onChange={(v) => updateAssets(id, { captions: v })} />
                    <EditableField label="CTA" value={a.cta} onChange={(v) => updateAssets(id, { cta: v })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="mt-4 space-y-3">
                {a.socialPosts.map((post, i) => (
                  <SocialCard key={post.network} post={post} onChange={(patch) => {
                    const next = a.socialPosts.slice(); next[i] = { ...next[i], ...patch }; updateAssets(id, { socialPosts: next });
                  }} />
                ))}
              </TabsContent>

              <TabsContent value="email" className="mt-4 space-y-3">
                <EditableField label="Subject" value={a.email.subject} onChange={(v) => updateAssets(id, { email: { ...a.email, subject: v } })} />
                <EditableField label="Preheader" value={a.email.preheader} onChange={(v) => updateAssets(id, { email: { ...a.email, preheader: v } })} />
                <EditableField label="Body" rows={10} value={a.email.body} onChange={(v) => updateAssets(id, { email: { ...a.email, body: v } })} />
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">HTML preview</p>
                  <div className="mt-2 rounded-lg bg-background p-4 shadow-sm">
                    <p className="text-sm font-semibold">{a.email.subject}</p>
                    <p className="text-xs text-muted-foreground">{a.email.preheader}</p>
                    <div className="mt-3 whitespace-pre-wrap text-sm">{a.email.body}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-4">
                <EditableField label="WhatsApp message" rows={4} value={a.whatsapp} onChange={(v) => updateAssets(id, { whatsapp: v })} />
                <div className="mt-3 max-w-sm rounded-2xl rounded-bl-none bg-success/15 p-3 text-sm">{a.whatsapp}</div>
              </TabsContent>

              <TabsContent value="blog" className="mt-4 space-y-3">
                <EditableField label="Title" value={a.blog.title} onChange={(v) => updateAssets(id, { blog: { ...a.blog, title: v } })} />
                <EditableField label="Body" rows={10} value={a.blog.body} onChange={(v) => updateAssets(id, { blog: { ...a.blog, body: v } })} />
              </TabsContent>

              <TabsContent value="landing" className="mt-4 space-y-3">
                <EditableField label="Headline" value={a.landing.headline} onChange={(v) => updateAssets(id, { landing: { ...a.landing, headline: v } })} />
                <EditableField label="Sub-headline" value={a.landing.sub} onChange={(v) => updateAssets(id, { landing: { ...a.landing, sub: v } })} />
                <EditableField label="Body" rows={6} value={a.landing.body} onChange={(v) => updateAssets(id, { landing: { ...a.landing, body: v } })} />
              </TabsContent>

              <TabsContent value="strategy" className="mt-4">
                <EditableField label="Marketing strategy" rows={8} value={a.strategy} onChange={(v) => updateAssets(id, { strategy: v })} />
              </TabsContent>
            </Tabs>
          </Card>

          {approved && (
            <PublishPanel
              onPublishNow={() => { updateCampaign(id, { status: "published", publishedAt: new Date().toISOString() }); toast.success("Published!"); nav({ to: "/" }); }}
              onSchedule={(dt) => { updateCampaign(id, { status: "scheduled", scheduledFor: dt }); toast.success("Scheduled"); nav({ to: "/" }); }}
              onDraft={() => { updateCampaign(id, { status: "draft" }); toast.success("Saved as draft"); nav({ to: "/" }); }}
            />
          )}
        </>
      )}
    </div>
  );
}

function VideoPipelineCard({ videoUrl }: { videoUrl?: string }) {
  const done = !!videoUrl || true;
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Video rendering pipeline</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {VIDEO_PIPELINE_STEPS.map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs">
            <CheckCircle2 className={`h-3.5 w-3.5 ${done ? "text-success" : "text-muted-foreground"}`} />
            {s.label}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function ApprovalGate({ campaign, onApprove, onReject }: { campaign: { status: string }; onApprove: () => void; onReject: () => void }) {
  const approved = campaign.status === "approved" || campaign.status === "scheduled" || campaign.status === "published";
  const rejected = campaign.status === "rejected";
  return (
    <Card className={`border-2 p-6 ${approved ? "border-success bg-success/5" : rejected ? "border-destructive bg-destructive/5" : "border-primary bg-accent/40"}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${approved ? "bg-success" : rejected ? "bg-destructive" : "bg-gradient-primary"} text-primary-foreground`}>
          {approved ? <ShieldCheck className="h-6 w-6" /> : rejected ? <XCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold">{approved ? "Approved — ready to publish" : rejected ? "Rejected" : "Review required before publishing"}</h3>
          <p className="text-sm text-muted-foreground">{approved ? "You can publish now, schedule, or save as draft." : rejected ? "Edit and re-generate, or approve after review." : "Nothing goes live until you approve. Edit any copy above."}</p>
        </div>
        {!approved && !rejected && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onReject}><XCircle className="mr-1 h-4 w-4" /> Reject</Button>
            <Button onClick={onApprove} className="bg-gradient-primary shadow-elegant"><CheckCircle2 className="mr-1 h-4 w-4" /> Approve</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function PublishPanel({ onPublishNow, onSchedule, onDraft }: { onPublishNow: () => void; onSchedule: (dt: string) => void; onDraft: () => void }) {
  const [dt, setDt] = useState("");
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Publish</h2>
      <p className="text-sm text-muted-foreground">Choose how to ship this campaign.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <Send className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-medium">Publish immediately</h3>
          <p className="text-xs text-muted-foreground">Send to every connected channel now.</p>
          <Button onClick={onPublishNow} className="mt-3 w-full bg-gradient-primary shadow-elegant">Publish now</Button>
        </div>
        <div className="rounded-xl border border-border p-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-medium">Schedule</h3>
          <Label className="mt-2 text-xs">Date & time</Label>
          <Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
          <Button variant="outline" className="mt-3 w-full" disabled={!dt} onClick={() => onSchedule(dt)}>Schedule</Button>
        </div>
        <div className="rounded-xl border border-border p-4">
          <Save className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-medium">Save as draft</h3>
          <p className="text-xs text-muted-foreground">Keep editing later.</p>
          <Button variant="outline" className="mt-3 w-full" onClick={onDraft}>Save draft</Button>
        </div>
      </div>
    </Card>
  );
}

function EditableField({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      {rows ? <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

const NETWORK_ICON = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, x: Twitter, tiktok: Video } as const;

function SocialCard({ post, onChange }: { post: SocialPost; onChange: (p: Partial<SocialPost>) => void }) {
  const Icon = NETWORK_ICON[post.network];
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold capitalize">{post.network}</span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Textarea rows={4} value={post.text} onChange={(e) => onChange({ text: e.target.value })} />
          <Input value={post.hashtags} onChange={(e) => onChange({ hashtags: e.target.value })} placeholder="#hashtags" />
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <div className="aspect-video rounded-md bg-gradient-primary/20" />
          <p className="mt-2 whitespace-pre-wrap">{post.text}</p>
          <p className="mt-1 text-xs text-primary">{post.hashtags}</p>
        </div>
      </div>
    </div>
  );
}

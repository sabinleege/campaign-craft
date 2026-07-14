import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppStore, type CampaignAssets, type CampaignConfig, type CampaignFormat, type VoiceOption } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { GENERATION_STEPS, generatePreview, runGeneration } from "../lib/mock-generate";
import { CheckCircle2, Loader2, Sparkles, Image as ImageIcon, Video, Mic, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns/new")({
  head: () => ({ meta: [{ title: "Generate Campaign — VideoMark AI" }] }),
  component: NewCampaignPage,
});

type Step = "setup" | "preview" | "generating";

function NewCampaignPage() {
  const hydrated = useHydrated();
  const products = useAppStore((s) => s.products);
  const brand = useAppStore((s) => s.brand);
  const addCampaign = useAppStore((s) => s.addCampaign);
  const updateCampaign = useAppStore((s) => s.updateCampaign);
  const nav = useNavigate();

  const [step, setStep] = useState<Step>("setup");
  const [name, setName] = useState("");
  const [productId, setProductId] = useState<string>("");
  const [format, setFormat] = useState<CampaignFormat>("both");
  const [videoLengthSec, setVideoLengthSec] = useState<number>(30);
  const [voice, setVoice] = useState<VoiceOption>("google_tts");
  const [voiceFileName, setVoiceFileName] = useState<string | undefined>();
  const [goal, setGoal] = useState<CampaignConfig["goal"]>("awareness");
  const [cta, setCta] = useState<string>("");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<CampaignAssets | null>(null);
  const [stepIdx, setStepIdx] = useState(-1);

  useEffect(() => {
    if (hydrated) {
      if (!productId) setProductId(products[0]?.id ?? "");
      if (!cta && brand.preferredCtas[0]) setCta(brand.preferredCtas[0]);
    }
  }, [hydrated, products, productId, brand, cta]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const product = products.find((p) => p.id === productId);

  const goToPreview = async () => {
    if (!product || !name.trim()) { toast.error("Pick a product and campaign name"); return; }
    setStep("preview");
    setPreviewLoading(true);
    const p = await generatePreview(product, brand, name, cta);
    setPreview(p);
    setPreviewLoading(false);
  };

  const approveAndGenerate = async () => {
    if (!product || !preview) return;
    setStep("generating");
    setStepIdx(-1);
    const id = `camp_${Date.now()}`;
    addCampaign({
      id, name, productId: product.id, status: "generating",
      createdAt: new Date().toISOString(), downloads: 0,
      config: { format, videoLengthSec, voice, voiceFileName, goal, cta },
      assets: preview,
    });
    await runGeneration((i) => setStepIdx(i));
    updateCampaign(id, { status: "pending_approval" });
    toast.success("Campaign generated — ready for review");
    nav({ to: "/campaigns/$id", params: { id } });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Generate a new campaign</h1>
        <p className="text-sm text-muted-foreground">Preview-first: review script, posters and copy before we render anything.</p>
      </header>

      <StepIndicator step={step} />

      {step === "setup" && (
        <Card className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Campaign name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale 2026" /></div>
            <div>
              <Label>Product</Label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label>Marketing goal</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["awareness", "leads", "sales"] as const).map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)}
                  className={`rounded-xl border p-3 text-left text-sm capitalize transition-all ${goal === g ? "border-primary bg-primary/10 shadow-elegant" : "border-border hover:border-primary/40"}`}>
                  <div className="font-semibold">{g}</div>
                  <div className="text-xs text-muted-foreground">
                    {g === "awareness" ? "Reach & views" : g === "leads" ? "Sign-ups & inquiries" : "Direct conversions"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Format</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <FormatBtn active={format === "video"} onClick={() => setFormat("video")} icon={<Video className="h-4 w-4" />} label="Video only" />
              <FormatBtn active={format === "poster"} onClick={() => setFormat("poster")} icon={<ImageIcon className="h-4 w-4" />} label="Poster only" />
              <FormatBtn active={format === "both"} onClick={() => setFormat("both")} icon={<Sparkles className="h-4 w-4" />} label="Video + Poster" />
            </div>
          </div>

          {(format === "video" || format === "both") && (
            <>
              <div>
                <Label>Video length</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[15, 30, 60, 90].map((s) => (
                    <button key={s} type="button" onClick={() => setVideoLengthSec(s)}
                      className={`rounded-full border px-4 py-1.5 text-sm ${videoLengthSec === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                      {s}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Voice-over</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <VoiceBtn active={voice === "google_tts"} onClick={() => setVoice("google_tts")} icon={<Mic className="h-4 w-4" />} label="Generate (Google TTS)" desc="AI voice for me" />
                  <VoiceBtn active={voice === "upload"} onClick={() => setVoice("upload")} icon={<Upload className="h-4 w-4" />} label="Upload my voice" desc="Bring your own mp3" />
                  <VoiceBtn active={voice === "none"} onClick={() => setVoice("none")} icon={<Video className="h-4 w-4" />} label="No voice-over" desc="Music + captions only" />
                </div>
                {voice === "upload" && (
                  <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs hover:border-primary">
                    <Upload className="h-4 w-4" />
                    <span className="truncate">{voiceFileName ?? "Upload voice file (mp3/wav)"}</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => setVoiceFileName(e.target.files?.[0]?.name)} />
                  </label>
                )}
              </div>
            </>
          )}

          <div>
            <Label>Call-to-action</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {brand.preferredCtas.map((c) => (
                <button key={c} type="button" onClick={() => setCta(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${cta === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                  {c}
                </button>
              ))}
            </div>
            <Textarea rows={2} value={cta} onChange={(e) => setCta(e.target.value)} className="mt-2" placeholder="Or write a custom CTA…" />
          </div>

          <div className="flex justify-end">
            <Button onClick={goToPreview} className="bg-gradient-primary shadow-elegant">
              Continue to preview <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === "preview" && (
        <PreviewStep
          loading={previewLoading}
          preview={preview}
          format={format}
          onEdit={(patch) => setPreview((prev) => prev ? { ...prev, ...patch } : prev)}
          onBack={() => setStep("setup")}
          onApprove={approveAndGenerate}
        />
      )}

      {step === "generating" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Generating…</h2>
          <p className="text-sm text-muted-foreground">Rendering {format === "poster" ? "poster" : `${videoLengthSec}s video`} + channel copy.</p>
          <ol className="mt-6 space-y-3">
            {GENERATION_STEPS.map((s, i) => {
              const done = i <= stepIdx;
              const active = i === stepIdx + 1;
              return (
                <motion.li key={s.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                  {done ? <CheckCircle2 className="h-5 w-5 text-success" /> : active ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <div className="h-5 w-5 rounded-full border-2 border-border" />}
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
                </motion.li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "setup", label: "1. Setup" },
    { key: "preview", label: "2. Preview" },
    { key: "generating", label: "3. Generate" },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => (
        <div key={s.key} className={`flex items-center gap-2 rounded-full border px-3 py-1 ${i <= idx ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          <span className="font-semibold">{s.label}</span>
          {i <= idx ? <CheckCircle2 className="h-3 w-3" /> : null}
        </div>
      ))}
    </div>
  );
}

function FormatBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${active ? "border-primary bg-primary/10 text-primary shadow-elegant" : "border-border hover:border-primary/40"}`}>
      {icon}<span className="font-medium">{label}</span>
    </button>
  );
}

function VoiceBtn({ active, onClick, icon, label, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-all ${active ? "border-primary bg-primary/10 shadow-elegant" : "border-border hover:border-primary/40"}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">{icon}{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </button>
  );
}

function PreviewStep({ loading, preview, format, onEdit, onBack, onApprove }: {
  loading: boolean;
  preview: CampaignAssets | null;
  format: CampaignFormat;
  onEdit: (patch: Partial<CampaignAssets>) => void;
  onBack: () => void;
  onApprove: () => void;
}) {
  if (loading || !preview) {
    return (
      <Card className="grid place-items-center gap-2 p-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Drafting your preview…</p>
      </Card>
    );
  }
  return (
    <>
      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Unified preview</h2>
            <p className="text-sm text-muted-foreground">Nothing rendered yet. Edit anything, then approve to generate.</p>
          </div>
        </div>

        {(format === "poster" || format === "both") && (
          <div>
            <Label>Poster mockup</Label>
            <div className="mt-2 grid aspect-[4/5] w-full max-w-sm place-items-center rounded-xl bg-gradient-primary p-6 text-center text-primary-foreground shadow-elegant">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-80">Poster preview</p>
                <p className="mt-2 text-lg font-bold leading-tight">{preview.landing.headline}</p>
                <p className="mt-1 text-xs opacity-90">{preview.landing.sub}</p>
                <div className="mt-4 inline-block rounded-full bg-background/95 px-4 py-1.5 text-xs font-semibold text-primary">{preview.cta}</div>
              </div>
            </div>
          </div>
        )}

        {(format === "video" || format === "both") && (
          <div>
            <Label>Video storyboard</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {preview.storyboard.map((frame, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="grid aspect-video place-items-center rounded-lg bg-gradient-primary/20 text-xs font-semibold text-primary">Frame {i + 1}</div>
                  <p className="mt-2 text-xs text-muted-foreground">{frame}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label>Script</Label>
              <Textarea rows={6} value={preview.script} onChange={(e) => onEdit({ script: e.target.value })} />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Captions</Label>
            <Textarea rows={2} value={preview.captions} onChange={(e) => onEdit({ captions: e.target.value })} />
          </div>
          <div>
            <Label>CTA</Label>
            <Input value={preview.cta} onChange={(e) => onEdit({ cta: e.target.value })} />
          </div>
        </div>

        <div>
          <Label>Email subject</Label>
          <Input value={preview.email.subject} onChange={(e) => onEdit({ email: { ...preview.email, subject: e.target.value } })} />
          <Label className="mt-2 block">Email body</Label>
          <Textarea rows={4} value={preview.email.body} onChange={(e) => onEdit({ email: { ...preview.email, body: e.target.value } })} />
        </div>

        <div>
          <Label>Social copy (Instagram)</Label>
          <Textarea rows={3} value={preview.socialPosts[1]?.text ?? ""} onChange={(e) => {
            const next = preview.socialPosts.slice();
            if (next[1]) next[1] = { ...next[1], text: e.target.value };
            onEdit({ socialPosts: next });
          }} />
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back to setup</Button>
        <Button onClick={onApprove} className="bg-gradient-primary shadow-elegant">
          <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Generate
        </Button>
      </div>
    </>
  );
}

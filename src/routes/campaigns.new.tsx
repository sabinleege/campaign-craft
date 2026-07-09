import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { GENERATION_STEPS, generateMockAssets, runGeneration } from "../lib/mock-generate";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns/new")({
  head: () => ({ meta: [{ title: "Generate Campaign — VideoMark AI" }] }),
  component: NewCampaignPage,
});

function NewCampaignPage() {
  const hydrated = useHydrated();
  const products = useAppStore((s) => s.products);
  const brand = useAppStore((s) => s.brand);
  const addCampaign = useAppStore((s) => s.addCampaign);
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [productId, setProductId] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);

  useEffect(() => { if (hydrated && !productId) setProductId(products[0]?.id ?? ""); }, [hydrated, products, productId]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const start = async () => {
    const product = products.find((p) => p.id === productId);
    if (!product || !name.trim()) { toast.error("Pick a product and campaign name"); return; }
    setRunning(true);
    setStepIdx(-1);
    const id = `camp_${Date.now()}`;
    addCampaign({ id, name, productId: product.id, status: "generating", createdAt: new Date().toISOString(), downloads: 0 });
    await runGeneration((i) => setStepIdx(i));
    const assets = generateMockAssets(product, brand, name);
    useAppStore.getState().updateCampaign(id, { status: "pending_approval", assets });
    toast.success("Campaign generated — ready for review");
    nav({ to: "/campaigns/$id", params: { id } });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Generate a new campaign</h1>
        <p className="text-sm text-muted-foreground">AI builds strategy, video, social, email, and messaging. You review and approve everything before it publishes.</p>
      </header>

      {!running ? (
        <Card className="p-6 space-y-4">
          <div><Label>Campaign name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale 2026" /></div>
          <div>
            <Label>Product</Label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="pt-2">
            <Button onClick={start} className="bg-gradient-primary shadow-elegant">
              <Sparkles className="mr-2 h-4 w-4" /> Generate Campaign
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Generating…</h2>
          <p className="text-sm text-muted-foreground">Assembling multi-channel assets. This usually takes a moment.</p>
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

import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAppStore, type Brand } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Upload, Palette, Save, Target, Megaphone, Plus, X } from "lucide-react";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Brand Setup — VideoMark AI" },
      { name: "description", content: "Persistent Brand Memory: logo, colors, fonts, tone of voice, language, and guidelines." },
    ],
  }),
  component: BrandPage,
});

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch", "Arabic", "Hindi", "Chinese", "Japanese"];

function BrandPage() {
  const hydrated = useHydrated();
  const brand = useAppStore((s) => s.brand);
  const setBrand = useAppStore((s) => s.setBrand);
  const { register, handleSubmit, reset, watch, setValue, getValues } = useForm<Brand>({ defaultValues: brand });
  const [guidelinesName, setGuidelinesName] = useState<string | undefined>(brand.guidelinesFileName);

  useEffect(() => { if (hydrated) reset(brand); }, [hydrated, brand, reset]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const saveAll = () => {
    setBrand({ ...getValues(), guidelinesFileName: guidelinesName });
    toast.success("Brand Memory saved");
  };

  const onSubmit = (data: Brand) => {
    setBrand({ ...data, guidelinesFileName: guidelinesName });
    toast.success("Brand Memory saved");
  };

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setValue("logoUrl", String(reader.result));
    reader.readAsDataURL(f);
  };

  const primaryColor = watch("primaryColor");
  const secondaryColor = watch("secondaryColor");
  const accentColor = watch("accentColor");
  const logoUrl = watch("logoUrl");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Brand Setup</h1>
          <p className="text-sm text-muted-foreground">Persistent Brand Memory. Every generation uses this.</p>
        </div>
        <Button onClick={saveAll} className="bg-gradient-primary shadow-elegant"><Save className="mr-2 h-4 w-4" /> Save Brand Memory</Button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* IDENTITY */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Identity</h2>
            <Button type="button" size="sm" variant="outline" onClick={saveAll}><Save className="mr-1 h-3 w-3" /> Save</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Brand name</Label><Input {...register("name")} /></div>
            <div><Label>Tagline</Label><Input {...register("tagline")} /></div>
            <div><Label>Website</Label><Input {...register("website")} /></div>
            <div><Label>Industry</Label><Input {...register("industry")} /></div>
            <div><Label>Contact email</Label><Input type="email" {...register("contactEmail")} /></div>
            <div>
              <Label>Default language</Label>
              <select {...register("language")} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><Label>Company description</Label><Textarea rows={3} {...register("description")} /></div>
        </Card>

        {/* VISUALS */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Visuals</h2>
            <Button type="button" size="sm" variant="outline" onClick={saveAll}><Save className="mr-1 h-3 w-3" /> Save</Button>
          </div>

          <div>
            <Label>Logo</Label>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center text-xs text-muted-foreground hover:border-primary hover:bg-accent/40">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Brand logo" className="max-h-20 rounded-md" />
                  <span className="text-[10px]">Click to replace</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload logo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </label>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-1"><Palette className="h-3 w-3" /> Brand palette</Label>
            <ColorRow label="Primary" value={primaryColor} inputProps={register("primaryColor")} />
            <ColorRow label="Secondary" value={secondaryColor} inputProps={register("secondaryColor")} />
            <ColorRow label="Accent" value={accentColor} inputProps={register("accentColor")} />
            <div className="flex gap-1 overflow-hidden rounded-md border border-border">
              <div className="h-8 flex-1" style={{ backgroundColor: primaryColor }} />
              <div className="h-8 flex-1" style={{ backgroundColor: secondaryColor }} />
              <div className="h-8 flex-1" style={{ backgroundColor: accentColor }} />
            </div>
          </div>

          <div className="grid gap-3">
            <div><Label>Primary font</Label><Input {...register("font")} placeholder="Inter" /></div>
            <div><Label>Secondary font</Label><Input {...register("secondaryFont")} placeholder="Inter" /></div>
          </div>

          <div>
            <Label>Brand guidelines (PDF)</Label>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs hover:border-primary">
              <Upload className="h-4 w-4" />
              <span className="truncate">{guidelinesName ?? "Upload PDF"}</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setGuidelinesName(e.target.files?.[0]?.name)} />
            </label>
          </div>
        </Card>

        {/* VOICE */}
        <Card className="p-6 lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Voice & writing style</h2>
            <Button type="button" size="sm" variant="outline" onClick={saveAll}><Save className="mr-1 h-3 w-3" /> Save</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><Label>Tone of voice</Label><Textarea rows={4} {...register("toneOfVoice")} placeholder="Warm, confident, sustainability-forward" /></div>
            <div><Label>Frequently used phrases / slogans</Label><Textarea rows={4} {...register("frequentPhrases")} placeholder={"Drink better. Waste less.\nOne planet. One bottle."} /></div>
          </div>
        </Card>

        <GoalsAndCtasCard />

        <div className="lg:col-span-3 flex justify-end">
          <Button type="submit" className="bg-gradient-primary shadow-elegant"><Save className="mr-2 h-4 w-4" /> Save Brand Memory</Button>
        </div>
      </form>
    </div>
  );
}

function GoalsAndCtasCard() {
  const brand = useAppStore((s) => s.brand);
  const setBrand = useAppStore((s) => s.setBrand);
  const setGoals = useAppStore((s) => s.setMarketingGoals);
  const [ctas, setCtas] = useState<string[]>(brand.preferredCtas);
  const [newCta, setNewCta] = useState("");
  useEffect(() => { setCtas(brand.preferredCtas); }, [brand.preferredCtas]);
  const save = () => { setBrand({ preferredCtas: ctas }); toast.success("Preferences saved"); };
  return (
    <Card className="p-6 lg:col-span-3 space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h2 className="font-semibold">Marketing goals</h2></div>
          <Button type="button" size="sm" variant="outline" onClick={save}><Save className="mr-1 h-3 w-3" /> Save</Button>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {(["awareness", "leads", "sales"] as const).map((k) => (
            <div key={k}>
              <Label className="capitalize">{k} — current / target</Label>
              <div className="mt-1 flex gap-2">
                <Input type="number" value={brand.marketingGoals[k]} onChange={(e) => setGoals({ [k]: Number(e.target.value) } as Partial<Brand["marketingGoals"]>)} />
                <Input type="number" value={brand.marketingGoals[`${k}Target` as const]} onChange={(e) => setGoals({ [`${k}Target`]: Number(e.target.value) } as Partial<Brand["marketingGoals"]>)} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /><h2 className="font-semibold">Preferred calls-to-action</h2></div>
          <Button type="button" size="sm" variant="outline" onClick={save}><Save className="mr-1 h-3 w-3" /> Save</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ctas.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs">
              {c}
              <button type="button" onClick={() => setCtas(ctas.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input value={newCta} onChange={(e) => setNewCta(e.target.value)} placeholder="Add a CTA (e.g. Shop now)" />
          <Button type="button" size="sm" onClick={() => { if (!newCta.trim()) return; setCtas([...ctas, newCta.trim()]); setNewCta(""); }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ColorRow({ label, value, inputProps }: { label: string; value: string; inputProps: ReturnType<ReturnType<typeof useForm<Brand>>["register"]> }) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" {...inputProps} className="h-9 w-14 cursor-pointer rounded-md border border-border bg-transparent" />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Input {...inputProps} className="h-8 font-mono text-xs" />
      </div>
      <div className="h-9 w-9 rounded-md border border-border" style={{ backgroundColor: value }} />
    </div>
  );
}

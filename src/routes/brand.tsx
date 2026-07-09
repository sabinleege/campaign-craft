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
import { Upload, Palette } from "lucide-react";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Brand Setup — VideoMark AI" },
      { name: "description", content: "Persistent Brand Memory: logo, colors, font, tone of voice, and guidelines." },
    ],
  }),
  component: BrandPage,
});

function BrandPage() {
  const hydrated = useHydrated();
  const brand = useAppStore((s) => s.brand);
  const setBrand = useAppStore((s) => s.setBrand);
  const { register, handleSubmit, reset, watch, setValue } = useForm<Brand>({ defaultValues: brand });
  const [guidelinesName, setGuidelinesName] = useState<string | undefined>(brand.guidelinesFileName);

  useEffect(() => { if (hydrated) reset(brand); }, [hydrated, brand, reset]);

  const color = watch("primaryColor");

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Brand Setup</h1>
        <p className="text-sm text-muted-foreground">Saved as persistent Brand Memory. Every generation uses this.</p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h2 className="font-semibold">Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Brand name</Label><Input {...register("name")} /></div>
            <div><Label>Tagline</Label><Input {...register("tagline")} /></div>
            <div><Label>Website</Label><Input {...register("website")} /></div>
            <div><Label>Industry</Label><Input {...register("industry")} /></div>
            <div><Label>Contact email</Label><Input type="email" {...register("contactEmail")} /></div>
            <div><Label>Font family</Label><Input {...register("font")} placeholder="Inter" /></div>
          </div>
          <div><Label>Company description</Label><Textarea rows={3} {...register("description")} /></div>
          <div><Label>Tone of voice</Label><Textarea rows={2} {...register("toneOfVoice")} /></div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="font-semibold">Visuals</h2>
          <div>
            <Label>Logo</Label>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-6 text-center text-xs text-muted-foreground hover:border-primary hover:bg-accent/40">
              {watch("logoUrl") ? (
                <img src={watch("logoUrl")} alt="Logo" className="max-h-16" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Upload logo</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </label>
          </div>
          <div>
            <Label className="flex items-center gap-1"><Palette className="h-3 w-3" /> Primary color</Label>
            <div className="mt-2 flex items-center gap-3">
              <input type="color" {...register("primaryColor")} className="h-10 w-16 cursor-pointer rounded-md border border-border bg-transparent" />
              <Input {...register("primaryColor")} className="font-mono" />
            </div>
            <div className="mt-2 h-8 rounded-md border border-border" style={{ backgroundColor: color }} />
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

        <div className="lg:col-span-3 flex justify-end">
          <Button type="submit" className="bg-gradient-primary shadow-elegant">Save Brand Memory</Button>
        </div>
      </form>
    </div>
  );
}

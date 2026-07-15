import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAppStore, type Product, type ProductVariant, type ProductCustomField } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Trash2, Upload, X, Plus } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Edit product — VideoMark AI" }] }),
  component: ProductEditPage,
});

interface FormShape {
  name: string;
  description: string;
  url?: string;
  features: string;
  benefits: string;
  audience: string;
  price?: string;
  discountPercent?: number;
  tags: string;
  faqs: string;
}

function ProductEditPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const hydrated = useHydrated();
  const product = useAppStore((s) => s.products.find((p) => p.id === id));
  const upsert = useAppStore((s) => s.upsertProduct);
  const del = useAppStore((s) => s.deleteProduct);
  const isNew = id === "new";

  const { register, handleSubmit, reset, watch } = useForm<FormShape>({
    defaultValues: toForm(product),
  });
  const live = watch();

  const [images, setImages] = useState<string[]>(product?.imageUrls ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants ?? []);
  const [customFields, setCustomFields] = useState<ProductCustomField[]>(product?.customFields ?? []);

  useEffect(() => {
    if (!hydrated) return;
    reset(toForm(product));
    setImages(product?.imageUrls ?? []);
    setVariants(product?.variants ?? []);
    setCustomFields(product?.customFields ?? []);
  }, [hydrated, product, reset]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    // TODO: upload to Supabase storage; for now store as data URLs in local state
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
      reader.readAsDataURL(f);
    });
  };

  const onSubmit = (data: FormShape) => {
    const p: Product = {
      id: isNew ? `prod_${Date.now()}` : id,
      name: data.name,
      description: data.description,
      url: data.url,
      features: splitLines(data.features),
      benefits: splitLines(data.benefits),
      audience: data.audience,
      price: data.price,
      discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrls: images,
      variants: variants.filter((v) => v.label || v.value),
      customFields: customFields.filter((c) => c.key || c.value),
      faqs: parseFaqs(data.faqs),
    };
    upsert(p);
    toast.success(isNew ? "Product created" : "Product saved");
    nav({ to: "/products" });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{isNew ? "New product" : `Edit: ${product?.name ?? ""}`}</h1>
        {!isNew && (
          <Button variant="outline" size="sm" onClick={() => { del(id); toast.success("Deleted"); nav({ to: "/products" }); }}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6 lg:col-span-2">
          <div><Label>Name</Label><Input {...register("name", { required: true })} /></div>
          <div><Label>Product URL</Label><Input {...register("url")} placeholder="https://…" /></div>
          <div><Label>Description</Label><Textarea rows={3} {...register("description")} /></div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>Price</Label><Input {...register("price")} placeholder="$29" /></div>
            <div><Label>Discount %</Label><Input type="number" min={0} max={100} {...register("discountPercent")} placeholder="10" /></div>
            <div><Label>Audience</Label><Input {...register("audience")} /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Features (one per line)</Label><Textarea rows={4} {...register("features")} /></div>
            <div><Label>Benefits (one per line)</Label><Textarea rows={4} {...register("benefits")} /></div>
          </div>

          <div><Label>Tags (comma-separated)</Label><Input {...register("tags")} /></div>

          <RepeatableList
            label="Variants"
            items={variants}
            onChange={setVariants}
            fields={["label", "value"]}
            placeholders={["Color", "Forest / Midnight / Sand"]}
            empty={{ label: "", value: "" }}
          />

          <RepeatableList
            label="Custom fields"
            items={customFields}
            onChange={setCustomFields}
            fields={["key", "value"]}
            placeholders={["Warranty", "Lifetime"]}
            empty={{ key: "", value: "" }}
          />

          <div>
            <Label>FAQs (Q: … / A: …, blank line between)</Label>
            <Textarea rows={5} {...register("faqs")} placeholder={"Q: Is it dishwasher safe?\nA: Yes, top-rack safe."} />
          </div>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Images</h2>
          <label className="grid h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-muted/40 text-xs text-muted-foreground hover:border-primary hover:bg-accent/40">
            <div className="flex flex-col items-center gap-1">
              <Upload className="h-5 w-5" />
              <span>Drop or click to upload</span>
              <span className="text-[10px]">multiple images ok</span>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={src} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/90 opacity-0 shadow transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">Images are stored in your browser for this demo. Cloud upload can be wired later.</p>
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Live preview</h2>
              <p className="text-xs text-muted-foreground">This is how your product will appear across campaigns.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="space-y-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted/40">
                {images[0] ? (
                  <img src={images[0]} alt={live.name || "Product"} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <Upload className="h-10 w-10 opacity-40" />
                  </div>
                )}
                {live.discountPercent ? (
                  <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground">-{live.discountPercent}%</span>
                ) : null}
                {live.price && (
                  <span className="absolute right-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-semibold shadow">{live.price}</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-1">
                  {images.slice(1, 5).map((src, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-md border border-border">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold">{live.name || "Untitled product"}</h3>
              {live.audience && <p className="text-[11px] uppercase tracking-widest text-muted-foreground">For {live.audience}</p>}
              <p className="text-sm text-muted-foreground">{live.description || "Add a description to see it here…"}</p>

              {splitLines(live.features || "").length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Features</div>
                  <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                    {splitLines(live.features).map((f, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {splitLines(live.benefits || "").length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Benefits</div>
                  <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                    {splitLines(live.benefits).map((f, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {variants.filter((v) => v.label || v.value).length > 0 && (
                <div className="grid gap-1 text-sm">
                  {variants.filter((v) => v.label || v.value).map((v, i) => (
                    <div key={i}><span className="text-muted-foreground">{v.label}:</span> {v.value}</div>
                  ))}
                </div>
              )}
              {customFields.filter((c) => c.key || c.value).length > 0 && (
                <div className="grid gap-1 rounded-lg border border-border p-3 text-xs">
                  {customFields.filter((c) => c.key || c.value).map((c, i) => (
                    <div key={i} className="flex justify-between gap-4"><span className="text-muted-foreground">{c.key}</span><span className="font-medium">{c.value}</span></div>
                  ))}
                </div>
              )}

              {(live.tags || "").trim() && (
                <div className="flex flex-wrap gap-1">
                  {live.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                  ))}
                </div>
              )}
              {live.url && (
                <a href={live.url} target="_blank" rel="noreferrer" className="inline-block text-xs font-medium text-primary hover:underline">Visit product page →</a>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2 lg:col-span-3">
          <Button type="button" variant="outline" onClick={() => nav({ to: "/products" })}>Cancel</Button>
          <Button type="submit" className="bg-gradient-primary shadow-elegant">Save product</Button>
        </div>
      </form>
    </div>
  );
}

function RepeatableList<T extends Record<string, string>>({
  label, items, onChange, fields, placeholders, empty,
}: {
  label: string;
  items: T[];
  onChange: (next: T[]) => void;
  fields: (keyof T & string)[];
  placeholders: string[];
  empty: T;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" size="sm" variant="ghost" onClick={() => onChange([...items, { ...empty }])}>
          <Plus className="mr-1 h-3 w-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            {fields.map((f, j) => (
              <Input
                key={f}
                placeholder={placeholders[j]}
                value={it[f] ?? ""}
                onChange={(e) => {
                  const next = items.slice();
                  next[i] = { ...next[i], [f]: e.target.value };
                  onChange(next);
                }}
              />
            ))}
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground">None yet.</p>}
      </div>
    </div>
  );
}

function toForm(p?: Product): FormShape {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    url: p?.url ?? "",
    features: p?.features.join("\n") ?? "",
    benefits: p?.benefits.join("\n") ?? "",
    audience: p?.audience ?? "",
    price: p?.price ?? "",
    discountPercent: p?.discountPercent,
    tags: p?.tags.join(", ") ?? "",
    faqs: p?.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n") ?? "",
  };
}

function splitLines(s: string) { return s.split("\n").map((x) => x.trim()).filter(Boolean); }
function parseFaqs(s: string) {
  return s.split(/\n\s*\n/).map((block) => {
    const q = /Q:\s*(.+)/i.exec(block)?.[1] ?? "";
    const a = /A:\s*([\s\S]+)/i.exec(block)?.[1]?.trim() ?? "";
    return { q, a };
  }).filter((x) => x.q);
}

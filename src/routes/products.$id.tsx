import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAppStore, type Product } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Edit product — VideoMark AI" }] }),
  component: ProductEditPage,
});

interface FormShape {
  name: string;
  description: string;
  features: string;
  benefits: string;
  audience: string;
  price?: string;
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

  const { register, handleSubmit, reset } = useForm<FormShape>({
    defaultValues: toForm(product),
  });

  useEffect(() => { if (hydrated) reset(toForm(product)); }, [hydrated, product, reset]);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const onSubmit = (data: FormShape) => {
    const p: Product = {
      id: isNew ? `prod_${Date.now()}` : id,
      name: data.name,
      description: data.description,
      features: splitLines(data.features),
      benefits: splitLines(data.benefits),
      audience: data.audience,
      price: data.price,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrls: product?.imageUrls ?? [],
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
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div><Label>Name</Label><Input {...register("name", { required: true })} /></div>
          <div><Label>Description</Label><Textarea rows={3} {...register("description")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Features (one per line)</Label><Textarea rows={4} {...register("features")} /></div>
            <div><Label>Benefits (one per line)</Label><Textarea rows={4} {...register("benefits")} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Target audience</Label><Input {...register("audience")} /></div>
            <div><Label>Price (optional)</Label><Input {...register("price")} placeholder="$29" /></div>
          </div>
          <div><Label>Tags (comma-separated)</Label><Input {...register("tags")} /></div>
          <div>
            <Label>FAQs (Q: … / A: …, blank line between)</Label>
            <Textarea rows={5} {...register("faqs")} placeholder={"Q: Is it dishwasher safe?\nA: Yes, top-rack safe."} />
          </div>
        </Card>
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Media</h2>
          <div className="grid h-40 place-items-center rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
            Drop images / videos / PDFs (mock)
          </div>
          <p className="text-xs text-muted-foreground">Any uploaded file becomes a reusable asset for future campaigns.</p>
        </Card>
        <div className="lg:col-span-3 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => nav({ to: "/products" })}>Cancel</Button>
          <Button type="submit" className="bg-gradient-primary shadow-elegant">Save product</Button>
        </div>
      </form>
    </div>
  );
}

function toForm(p?: Product): FormShape {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    features: p?.features.join("\n") ?? "",
    benefits: p?.benefits.join("\n") ?? "",
    audience: p?.audience ?? "",
    price: p?.price ?? "",
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

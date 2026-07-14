import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppStore, SPECIAL_DAYS, type CalendarItem, type CalendarItemKind } from "../stores/app-store";
import { useHydrated } from "../hooks/use-hydrated-store";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Sparkles, Plus, X, Video, Image as ImageIcon, Mail, Megaphone } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — VideoMark AI" }] }),
  component: CalendarPage,
});

function fmt(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const KIND_ICON: Record<CalendarItemKind, React.ComponentType<{ className?: string }>> = {
  video: Video, poster: ImageIcon, email: Mail, social: Megaphone,
};

function CalendarPage() {
  const hydrated = useHydrated();
  const plan = useAppStore((s) => s.calendarPlan);
  const addItem = useAppStore((s) => s.addCalendarItem);
  const setItems = useAppStore((s) => s.setCalendarItems);
  const removeItem = useAppStore((s) => s.removeCalendarItem);

  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(fmt(today));

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const grid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const selectedItems = plan[selected] ?? [];
  const selectedDate = new Date(selected + "T00:00:00");
  const specialToday = SPECIAL_DAYS.find((s) => s.monthDay === selected.slice(5));

  const aiPlanWeek = () => {
    const start = new Date(selected + "T00:00:00");
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = fmt(d);
      const items: CalendarItem[] = [
        { id: `${key}-1`, kind: i % 2 === 0 ? "social" : "poster", title: i % 2 === 0 ? "Morning social post" : "Daily poster", auto: true },
        { id: `${key}-2`, kind: i === 3 ? "video" : "email", title: i === 3 ? "Mid-week video drop" : "Nurture email", auto: true },
      ];
      setItems(key, items);
    }
    toast.success("AI planned the next 7 days");
  };

  const craftThemedPost = () => {
    if (!specialToday) return;
    addItem(selected, {
      id: `${selected}-theme-${Date.now()}`,
      kind: "social",
      title: `${specialToday.name} post`,
      theme: specialToday.theme,
      auto: false,
    });
    toast.success(`Themed post added for ${specialToday.name}`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" /> Campaign Calendar</h1>
          <p className="text-sm text-muted-foreground">Plan every day. Let AI schedule for you, or take manual control.</p>
        </div>
        <Button onClick={aiPlanWeek} className="bg-gradient-primary shadow-elegant"><Sparkles className="mr-2 h-4 w-4" /> AI plan next 7 days</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-4 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))} className="rounded-md border border-border px-2 py-1 text-xs">←</button>
            <h2 className="font-semibold">{monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</h2>
            <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))} className="rounded-md border border-border px-2 py-1 text-xs">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              const key = fmt(d);
              const items = plan[key] ?? [];
              const inMonth = d.getMonth() === monthCursor.getMonth();
              const isToday = key === fmt(today);
              const isSelected = key === selected;
              const isSpecial = SPECIAL_DAYS.some((s) => s.monthDay === key.slice(5));
              return (
                <button key={i} onClick={() => setSelected(key)}
                  className={`relative min-h-[68px] rounded-lg border p-1.5 text-left text-xs transition-all
                    ${isSelected ? "border-primary bg-primary/10 shadow-elegant" : "border-border/60 hover:border-primary/40"}
                    ${!inMonth ? "opacity-40" : ""}
                    ${isToday ? "ring-1 ring-primary" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isSpecial ? "text-primary" : ""}`}>{d.getDate()}</span>
                    {items.length > 0 && <span className="rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">{items.length}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {items.slice(0, 3).map((it) => {
                      const Icon = KIND_ICON[it.kind];
                      return <Icon key={it.id} className="h-3 w-3 text-muted-foreground" />;
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div>
            <h2 className="font-semibold">{selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2>
            <p className="text-xs text-muted-foreground">{selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} planned</p>
          </div>

          {specialToday && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
              <div className="text-xs font-semibold text-primary">{specialToday.name}</div>
              <p className="mt-1 text-xs text-muted-foreground">{specialToday.theme}</p>
              <Button size="sm" onClick={craftThemedPost} className="mt-2 bg-gradient-primary shadow-elegant">
                <Sparkles className="mr-1 h-3 w-3" /> Craft themed post
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {selectedItems.map((it) => {
              const Icon = KIND_ICON[it.kind];
              return (
                <div key={it.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{it.title}</div>
                    <div className="text-[11px] text-muted-foreground">{it.auto ? "Automatic" : "Manual"}{it.theme ? ` · ${it.theme}` : ""}</div>
                  </div>
                  <button onClick={() => {
                    const next = selectedItems.map((x) => x.id === it.id ? { ...x, auto: !x.auto } : x);
                    setItems(selected, next);
                  }} className="rounded-full border border-border px-2 py-0.5 text-[10px]">
                    {it.auto ? "Auto" : "Manual"}
                  </button>
                  <button onClick={() => removeItem(selected, it.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
            {selectedItems.length === 0 && <p className="text-xs text-muted-foreground">Nothing planned for this day.</p>}
          </div>

          <AddItemForm onAdd={(kind, title) => addItem(selected, { id: `${selected}-${Date.now()}`, kind, title, auto: false })} />
        </Card>
      </div>
    </div>
  );
}

function AddItemForm({ onAdd }: { onAdd: (kind: CalendarItemKind, title: string) => void }) {
  const [kind, setKind] = useState<CalendarItemKind>("social");
  const [title, setTitle] = useState("");
  return (
    <div className="rounded-xl border border-dashed border-border p-3">
      <Label className="text-xs">Add item</Label>
      <div className="mt-2 flex gap-1">
        {(["poster", "video", "email", "social"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)}
            className={`rounded-full border px-2 py-1 text-[11px] capitalize ${kind === k ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
            {k}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title…" />
        <Button size="sm" onClick={() => { if (!title.trim()) return; onAdd(kind, title.trim()); setTitle(""); }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function buildMonthGrid(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startOffset = first.getDay();
  const start = new Date(first); start.setDate(first.getDate() - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
}

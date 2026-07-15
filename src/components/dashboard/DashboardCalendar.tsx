import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAppStore, SPECIAL_DAYS, type CalendarItemKind } from "../../stores/app-store";
import { Card } from "../ui/card";
import { CalendarDays, Video, Image as ImageIcon, Mail, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

function fmt(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const KIND_ICON: Record<CalendarItemKind, React.ComponentType<{ className?: string }>> = {
  video: Video, poster: ImageIcon, email: Mail, social: Megaphone,
};

export function DashboardCalendar() {
  const plan = useAppStore((s) => s.calendarPlan);
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(fmt(today));

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first); start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);

  const selectedItems = plan[selected] ?? [];
  const selectedDate = new Date(selected + "T00:00:00");
  const special = SPECIAL_DAYS.find((s) => s.monthDay === selected.slice(5));

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Campaign calendar</h2>
        </div>
        <Link to="/calendar" className="text-xs font-medium text-primary hover:underline">Open full calendar →</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="grid h-7 w-7 place-items-center rounded-md border border-border text-xs hover:bg-muted"><ChevronLeft className="h-3 w-3" /></button>
            <span className="text-xs font-semibold">{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</span>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="grid h-7 w-7 place-items-center rounded-md border border-border text-xs hover:bg-muted"><ChevronRight className="h-3 w-3" /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] uppercase tracking-wider text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="mt-0.5 grid grid-cols-7 gap-0.5">
            {grid.map((d, i) => {
              const key = fmt(d);
              const items = plan[key] ?? [];
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = key === fmt(today);
              const isSelected = key === selected;
              const isSpecial = SPECIAL_DAYS.some((s) => s.monthDay === key.slice(5));
              return (
                <button key={i} onClick={() => setSelected(key)}
                  className={`relative aspect-square rounded-md border text-[11px] transition-all
                    ${isSelected ? "border-primary bg-primary/10 font-semibold" : "border-border/40 hover:border-primary/40"}
                    ${!inMonth ? "opacity-40" : ""}
                    ${isToday ? "ring-1 ring-primary" : ""}`}>
                  <span className={isSpecial ? "text-primary" : ""}>{d.getDate()}</span>
                  {items.length > 0 && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border p-3">
          <div className="text-xs font-semibold">{selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</div>
          <div className="text-[10px] text-muted-foreground">{selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} planned</div>

          {special && (
            <div className="mt-2 rounded-lg border border-primary/40 bg-primary/5 p-2 text-[11px]">
              <div className="font-semibold text-primary">{special.name}</div>
              <div className="text-muted-foreground">{special.theme}</div>
            </div>
          )}

          <div className="mt-2 space-y-1.5">
            {selectedItems.length === 0 && <p className="text-[11px] text-muted-foreground">Nothing scheduled. <Link to="/calendar" className="text-primary hover:underline">Plan this day →</Link></p>}
            {selectedItems.map((it) => {
              const Icon = KIND_ICON[it.kind];
              return (
                <div key={it.id} className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1.5 text-[11px]">
                  <Icon className="h-3 w-3 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{it.title}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{it.kind} · {it.auto ? "auto" : "manual"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

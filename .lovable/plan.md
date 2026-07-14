# VideoMark AI v3.2 — Front-end upgrade plan

Scope: front-end only, mock data via existing Zustand store. No backend/OAuth wiring — Supabase upload noted as future work; for now product images use local `URL.createObjectURL` previews stored as data URLs in the store.

## 1. Global navigation (all pages)

- Replace top `TopNav` with a **floating hovering menu bar** anchored top-center, translucent, subtle shadow, hover-expand.
- Nav items: Dashboard, Products, Campaigns, Calendar, Analytics, Settings, Logout.
- Keep only **Generate Campaign** as a distinct pill on the right of the floating bar.
- Add a **sticky bottom bar** (mobile + desktop) with a big "Generate Campaign" CTA.
- Move brand/company name from page headers into the floating bar (left cluster).
- Remove old dashboard/page headers that duplicated the company name.

Files: `src/components/layout/TopNav.tsx` (rewrite as `FloatingNav.tsx`), new `BottomGenerateBar.tsx`, update `src/routes/__root.tsx`.

## 2. Dashboard

- Company name + tagline hero strip (from brand memory).
- Marketing goals card: three progress bars (Awareness, Leads, Sales) with editable targets stored in brand memory.
- "Today" panel: today's scheduled actions from the calendar.
- Unified analytics graphs (recharts, already available via shadcn or add if missing):
  - Viewership & engagement (line)
  - Published campaigns over time (bar)
  - Email delivery (bar, where connected)
  - Video downloads (line)
  - Social publishing status (stacked bar per network)
  - Scheduled vs published (area)
- Recent activity feed retained; remove the old 5-stat row.

Files: `src/routes/index.tsx` rewrite; add `src/components/dashboard/GoalsCard.tsx`, `AnalyticsGraphs.tsx`.

## 3. Products

- Rich form: name, description, URL, pricing, discount %, tags, features, variants (repeatable rows: label + value), custom fields (repeatable key/value), multiple image uploads (drag-drop, preview grid, reorder, remove).
- Images stored as data URLs in the store (Supabase upload flagged as TODO comment).
- Product list card shows first image, price, discount badge.

Files: `src/routes/products.$id.tsx` rewrite; `src/routes/products.tsx` card update; extend `Product` type in `app-store.ts` (add `url`, `discountPercent`, `variants`, `customFields`).

## 4. Campaign generation — preview-first flow

New wizard in `src/routes/campaigns.new.tsx`:

1. **Setup**: name, product, marketing goal, format (Video / Poster-only / Both), video length (15s/30s/60s/90s), voice option (Generate w/ Google TTS · Upload own mp3 · No voice), CTA selection.
2. **Preview** (before any rendering): show script, storyboard frames, poster mockups, captions, social copy, email copy. Inline edit. Buttons: Regenerate section · Approve & Generate.
3. **Generate**: existing animated pipeline runs only after approval.
4. **Result**: navigates to campaign detail.

Files: `src/routes/campaigns.new.tsx` rewrite; `src/lib/mock-generate.ts` add `generatePreview()` returning draft assets fast (no video render).

## 5. Campaign calendar

New route `src/routes/calendar.tsx`:

- Month grid, each day clickable.
- Day detail drawer: list of planned posts (poster/video/email/social) with Auto / Manual toggle per day.
- "AI plan my week" button — mock fills next 7 days with scheduled items.
- Special-day awareness: predefined dates (Women's Day, Genocide Remembrance, etc.) show a themed suggestion banner and one-click "Craft themed post".
- Data persisted in store as `calendarPlan: Record<dateISO, PlannedItem[]>`.

Files: `src/routes/calendar.tsx`, `src/components/calendar/DayDrawer.tsx`, extend store with `calendarPlan`, `marketingGoals`, `specialDays` seed.

## 6. Analytics

- Remove the old 6-stat row. Redirect to Dashboard graphs OR keep as deep-dive with the same graphs + campaign history table (kept) and Drafts/Scheduled/Published/Pending filters.

Files: `src/routes/analytics.tsx` simplified to campaign history + filter tabs.

## 7. Brand Memory (Settings)

Rename route label to **Settings**; keep `/brand` path.

- Sections (each with its own Save): Identity, Visuals (primary/secondary/accent + fonts), Voice & Language (tone, phrases, language), Company, Marketing Goals (targets), Preferred CTAs (repeatable list).
- Store additions: `preferredCtas: string[]`, `marketingGoals: { awareness, leads, sales, targets }`.

Files: `src/routes/brand.tsx` extend; store extend.

## 8. Campaign detail

- Show company name badge at top.
- Approval gate stays; after approval reveal Publish/Schedule/AI-plan buttons.
- Add "Add to calendar" action that writes into `calendarPlan`.

Files: `src/routes/campaigns.$id.tsx` small additions.

## Technical notes

- Add `recharts` if missing (`bun add recharts`).
- All new store fields seeded so existing localStorage users get merged defaults via a small migration in the persist `onRehydrateStorage`.
- Logout button is a no-op that clears store + toast (no auth in v1).
- Keep all styling via semantic tokens in `styles.css`; floating nav uses `bg-background/70 backdrop-blur border border-border/60 shadow-elegant rounded-full`.

## Out of scope (flagged as TODO in code)

- Real Supabase image upload, real Google TTS, real OAuth posting, real AI scheduling, auth/logout.

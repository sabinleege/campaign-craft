## VideoMark AI — Front-end V1 Plan

Build a responsive, mock-data-driven front end for an AI marketing campaign platform. No backend calls in V1 — all "AI generation", rendering, and publishing simulated with timeouts + Zustand store. Approval gate is enforced structurally (Publish controls don't render until `campaign.status === 'approved'`).

### Design system (src/styles.css)
- Primary `#6C3CE1` (oklch) + gradient token `--gradient-primary`.
- Inter via Google Fonts `<link>` in `__root.tsx` head (never `@import` remote CSS).
- Neutral surfaces, soft shadows, rounded-xl cards. Light mode only in V1.
- Semantic tokens only — no hardcoded colors in components.

### Routes (src/routes/)
- `index.tsx` — Dashboard (stats, recent campaigns, quick actions, brand summary)
- `brand.tsx` — Brand Setup (logo, colors, fonts, guidelines PDF, company info)
- `products.tsx` — Product & Asset Library (list + search)
- `products.$id.tsx` — Product edit/create form
- `campaigns.new.tsx` — Campaign Generation (loading pipeline → unified preview with channel tabs)
- `campaigns.$id.tsx` — Campaign detail: video pipeline view + approval gate + publish options
- `channels.tsx` — Channel connections (Gmail, FB, IG, LinkedIn, X, TikTok, WhatsApp) with mock OAuth
- `analytics.tsx` — Metrics + campaign history

Shared layout via `__root.tsx`: top bar with logo + nav links + brand badge.

### State (Zustand)
`src/stores/app-store.ts` holds: `brand`, `products[]`, `campaigns[]`, `channels[]`. Persisted to localStorage (read in `useEffect` to avoid hydration mismatch). Seeded with mock data: brand "GreenTech" (purple), product "EcoBottle", campaign "Summer Sale 2026" pre-generated.

### Components (src/components/)
- `Layout/TopNav.tsx`
- `Dashboard/StatCard.tsx`, `RecentCampaigns.tsx`, `BrandSummary.tsx`
- `Campaign/GenerationPipeline.tsx` (animated step progress)
- `Campaign/ChannelPreviewTabs.tsx` (Video / Email / Social / WhatsApp / Blog / Landing)
- `Campaign/VideoPipeline.tsx` (Script → VO → HyperFrames → Captions → Music → Branding → Render)
- `Campaign/ApprovalGate.tsx` — big banner; renders Edit + Approve/Reject; Publish panel only appears post-approval
- `Campaign/PublishPanel.tsx` (Publish now / Schedule with date-time / Save draft)
- `Channels/ChannelCard.tsx`
- `Products/ProductForm.tsx` (react-hook-form)

### Approval gate (non-negotiable)
`PublishPanel` is conditionally rendered on `status === 'approved'`. Before approval, only an "Awaiting approval" banner shows. Edits are inline (contentEditable / textarea) and update store; approve action flips status and unlocks publish.

### Mocking
- `src/lib/mock-generate.ts` — async fn returning full campaign assets after staggered `setTimeout`s emitting pipeline progress.
- Toast feedback via `sonner`.
- Video preview: HTML5 `<video>` with a sample mp4 URL (or poster-only placeholder if no CDN).

### Tech
- TanStack Start (existing), TanStack Router, TanStack Query not needed (local store), Zustand, react-hook-form, sonner, lucide-react icons, framer-motion for pipeline animation.
- Add deps: `zustand react-hook-form framer-motion sonner`.

### Out of scope for V1
Real OAuth, real AI calls, real publishing, real analytics data, auth/multi-user, dark mode toggle.

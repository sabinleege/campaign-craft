import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CampaignStatus = "draft" | "generating" | "pending_approval" | "approved" | "scheduled" | "published" | "rejected";

export interface MarketingGoals {
  awareness: number; // 0..100 current progress
  leads: number;
  sales: number;
  awarenessTarget: number;
  leadsTarget: number;
  salesTarget: number;
}

export interface Brand {
  name: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  secondaryFont: string;
  toneOfVoice: string;
  frequentPhrases: string;
  language: string;
  website: string;
  industry: string;
  description: string;
  contactEmail: string;
  guidelinesFileName?: string;
  preferredCtas: string[];
  marketingGoals: MarketingGoals;
}

export interface ProductVariant { label: string; value: string; }
export interface ProductCustomField { key: string; value: string; }

export interface Product {
  id: string;
  name: string;
  description: string;
  url?: string;
  features: string[];
  benefits: string[];
  audience: string;
  price?: string;
  discountPercent?: number;
  tags: string[];
  imageUrls: string[]; // data URLs
  variants: ProductVariant[];
  customFields: ProductCustomField[];
  faqs: { q: string; a: string }[];
}

export interface SocialPost { network: "facebook" | "instagram" | "linkedin" | "x" | "tiktok"; text: string; hashtags: string; }
export interface CampaignAssets {
  strategy: string;
  script: string;
  storyboard: string[];
  voiceoverUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  captions: string;
  cta: string;
  socialPosts: SocialPost[];
  email: { subject: string; preheader: string; body: string };
  whatsapp: string;
  blog: { title: string; body: string };
  landing: { headline: string; sub: string; body: string };
}

export type CampaignFormat = "video" | "poster" | "both";
export type VoiceOption = "google_tts" | "upload" | "none";

export interface CampaignConfig {
  format: CampaignFormat;
  videoLengthSec: number;
  voice: VoiceOption;
  voiceFileName?: string;
  goal: "awareness" | "leads" | "sales";
  cta: string;
}

export interface Campaign {
  id: string;
  name: string;
  productId: string;
  status: CampaignStatus;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  downloads: number;
  emailsDelivered?: number;
  views?: number;
  engagement?: number;
  config?: CampaignConfig;
  assets?: CampaignAssets;
}

export type ChannelKey = "gmail" | "facebook" | "instagram" | "linkedin" | "x" | "tiktok" | "whatsapp";
export interface Channel { key: ChannelKey; label: string; connected: boolean; account?: string; }

export type CalendarItemKind = "poster" | "video" | "email" | "social";
export interface CalendarItem {
  id: string;
  kind: CalendarItemKind;
  title: string;
  auto: boolean;
  campaignId?: string;
  theme?: string;
  done?: boolean;
}
export type CalendarPlan = Record<string, CalendarItem[]>; // key: YYYY-MM-DD

interface AppState {
  brand: Brand;
  products: Product[];
  campaigns: Campaign[];
  channels: Channel[];
  calendarPlan: CalendarPlan;
  setBrand: (b: Partial<Brand>) => void;
  setMarketingGoals: (g: Partial<MarketingGoals>) => void;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCampaign: (c: Campaign) => void;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  updateAssets: (id: string, patch: Partial<CampaignAssets>) => void;
  toggleChannel: (key: ChannelKey) => void;
  setCalendarItems: (dateKey: string, items: CalendarItem[]) => void;
  addCalendarItem: (dateKey: string, item: CalendarItem) => void;
  removeCalendarItem: (dateKey: string, itemId: string) => void;
  resetAll: () => void;
}

const seedBrand: Brand = {
  name: "GreenTech",
  tagline: "Sustainable tech for everyday life",
  logoUrl: "",
  primaryColor: "#6C3CE1",
  secondaryColor: "#22C55E",
  accentColor: "#F59E0B",
  font: "Inter",
  secondaryFont: "Inter",
  toneOfVoice: "Warm, confident, sustainability-forward",
  frequentPhrases: "Drink better. Waste less.\nSmall choices, big impact.",
  language: "English",
  website: "https://greentech.example.com",
  industry: "Consumer sustainability",
  description: "GreenTech designs everyday eco-friendly products that help households reduce waste without changing their lifestyle.",
  contactEmail: "hello@greentech.example.com",
  preferredCtas: ["Shop now", "Learn more", "Get 10% off", "Join the movement"],
  marketingGoals: {
    awareness: 62, leads: 41, sales: 28,
    awarenessTarget: 100, leadsTarget: 200, salesTarget: 150,
  },
};

const seedProducts: Product[] = [
  {
    id: "prod_ecobottle",
    name: "EcoBottle",
    description: "Insulated stainless-steel bottle made from 90% recycled materials. Keeps drinks cold for 24h or hot for 12h.",
    url: "https://greentech.example.com/ecobottle",
    features: ["Recycled stainless steel", "Leak-proof lid", "24h cold / 12h hot", "BPA-free"],
    benefits: ["Reduces single-use plastic", "Long-lasting", "Dishwasher safe"],
    audience: "Eco-conscious professionals aged 25-45",
    price: "$29",
    discountPercent: 10,
    tags: ["hydration", "sustainable", "bestseller"],
    imageUrls: [],
    variants: [
      { label: "Color", value: "Forest Green / Midnight / Sand" },
      { label: "Size", value: "500ml / 750ml" },
    ],
    customFields: [
      { key: "Material", value: "90% recycled stainless steel" },
      { key: "Warranty", value: "Lifetime" },
    ],
    faqs: [
      { q: "Is it dishwasher safe?", a: "Yes, top-rack safe." },
      { q: "What's the warranty?", a: "Lifetime warranty against manufacturing defects." },
    ],
  },
];

const seedAssets: CampaignAssets = {
  strategy: "Position EcoBottle as the smart summer hydration choice for eco-conscious professionals. Emphasize 24h cold performance and recycled materials. Multi-channel launch with a 10% early-summer discount, targeting urban commuters and outdoor enthusiasts.",
  script: "[Scene 1] Sunrise over a city skyline. VO: This summer, hydration meets responsibility.\n[Scene 2] Hands filling EcoBottle at a tap. VO: Made from 90% recycled steel — engineered to last a lifetime.\n[Scene 3] Cyclist takes a sip mid-ride. VO: Cold for 24 hours. Even on the hottest days.\n[Scene 4] Product hero shot with logo. VO: EcoBottle. Drink better. Waste less.",
  storyboard: [
    "Sunrise city skyline, warm tones",
    "Close-up of bottle being filled",
    "Cyclist drinking mid-ride",
    "Product hero with brand logo",
  ],
  captions: "Meet EcoBottle — 24h cold, made from 90% recycled steel.",
  cta: "Shop the Summer Sale — 10% off this week",
  socialPosts: [
    { network: "facebook", text: "Summer's here — and so is our biggest EcoBottle drop yet. 24h cold, 90% recycled steel. Get 10% off this week only.", hashtags: "#EcoBottle #SummerSale #Sustainable" },
    { network: "instagram", text: "Hot summer. Cold drinks. Zero compromise. ☀️🧊", hashtags: "#EcoBottle #Hydration #EcoFriendly #SummerSale" },
    { network: "linkedin", text: "We're launching our Summer Sale on EcoBottle — a small daily choice with a measurable impact on single-use plastic waste.", hashtags: "#Sustainability #ConsumerTech" },
    { network: "x", text: "Summer Sale is live. EcoBottle — 24h cold, 90% recycled. 10% off this week.", hashtags: "#EcoBottle #Sale" },
    { network: "tiktok", text: "POV: your water is still ice cold at hour 23 🥶", hashtags: "#EcoTok #Hydration #SummerSale" },
  ],
  email: {
    subject: "Your summer just got 10% cooler ☀️",
    preheader: "EcoBottle Summer Sale — this week only.",
    body: "Hi there,\n\nSummer is heating up, and so is our biggest sale of the year. This week, get 10% off EcoBottle — the 24h-cold, 90% recycled steel bottle that keeps up with your day.\n\nShop the sale and hydrate on your terms.\n\n— The GreenTech team",
  },
  whatsapp: "Hi! 👋 Quick heads-up: EcoBottle is 10% off this week for our Summer Sale. Reply YES and we'll send you the link.",
  blog: {
    title: "Why we're launching our Summer Sale (and what we learned building EcoBottle)",
    body: "This summer we're offering 10% off EcoBottle — but the story behind it matters more than the discount. Here's how we designed a bottle to keep drinks cold for 24 hours while using 90% recycled steel, and why every purchase measurably reduces single-use plastic in your city.",
  },
  landing: {
    headline: "Summer Sale — 10% off EcoBottle",
    sub: "24h cold. 90% recycled. Built for a lifetime.",
    body: "Join thousands of eco-conscious professionals who made the switch. Free shipping on orders over $40. Lifetime warranty included.",
  },
};

const seedCampaigns: Campaign[] = [
  {
    id: "camp_summer_2026",
    name: "Summer Sale 2026",
    productId: "prod_ecobottle",
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    downloads: 3,
    emailsDelivered: 0,
    views: 0,
    engagement: 0,
    assets: seedAssets,
  },
];

const seedChannels: Channel[] = [
  { key: "gmail", label: "Gmail", connected: true, account: "hello@greentech.example.com" },
  { key: "facebook", label: "Facebook", connected: true, account: "GreenTech Official" },
  { key: "instagram", label: "Instagram", connected: false },
  { key: "linkedin", label: "LinkedIn", connected: true, account: "GreenTech" },
  { key: "x", label: "X (Twitter)", connected: false },
  { key: "tiktok", label: "TikTok", connected: false },
  { key: "whatsapp", label: "WhatsApp Business", connected: true, account: "+1 555-0100" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      brand: seedBrand,
      products: seedProducts,
      campaigns: seedCampaigns,
      channels: seedChannels,
      calendarPlan: {},
      setBrand: (b) => set((s) => ({ brand: { ...s.brand, ...b } })),
      setMarketingGoals: (g) => set((s) => ({ brand: { ...s.brand, marketingGoals: { ...s.brand.marketingGoals, ...g } } })),
      upsertProduct: (p) =>
        set((s) => {
          const idx = s.products.findIndex((x) => x.id === p.id);
          if (idx === -1) return { products: [...s.products, p] };
          const next = s.products.slice();
          next[idx] = p;
          return { products: next };
        }),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      addCampaign: (c) => set((s) => ({ campaigns: [c, ...s.campaigns] })),
      updateCampaign: (id, patch) =>
        set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      updateAssets: (id, patch) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id && c.assets ? { ...c, assets: { ...c.assets, ...patch } } : c
          ),
        })),
      toggleChannel: (key) =>
        set((s) => ({
          channels: s.channels.map((c) =>
            c.key === key ? { ...c, connected: !c.connected, account: !c.connected ? c.account ?? "connected-account" : undefined } : c
          ),
        })),
      setCalendarItems: (dateKey, items) =>
        set((s) => ({ calendarPlan: { ...s.calendarPlan, [dateKey]: items } })),
      addCalendarItem: (dateKey, item) =>
        set((s) => ({ calendarPlan: { ...s.calendarPlan, [dateKey]: [...(s.calendarPlan[dateKey] ?? []), item] } })),
      removeCalendarItem: (dateKey, itemId) =>
        set((s) => ({ calendarPlan: { ...s.calendarPlan, [dateKey]: (s.calendarPlan[dateKey] ?? []).filter((i) => i.id !== itemId) } })),
      resetAll: () => set({ brand: seedBrand, products: seedProducts, campaigns: seedCampaigns, channels: seedChannels, calendarPlan: {} }),
    }),
    {
      name: "videomark-ai-store",
      version: 2,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : (undefined as never))),
      skipHydration: true,
      migrate: (persisted: unknown) => {
        // Merge missing fields from seed defaults for older stored state
        const p = (persisted ?? {}) as Partial<AppState>;
        const brand: Brand = { ...seedBrand, ...(p.brand ?? {}), marketingGoals: { ...seedBrand.marketingGoals, ...((p.brand as Brand | undefined)?.marketingGoals ?? {}) }, preferredCtas: (p.brand as Brand | undefined)?.preferredCtas ?? seedBrand.preferredCtas };
        const products = (p.products ?? seedProducts).map((pr) => ({ ...pr, variants: pr.variants ?? [], customFields: pr.customFields ?? [], imageUrls: pr.imageUrls ?? [] }));
        return { ...p, brand, products, calendarPlan: p.calendarPlan ?? {} } as AppState;
      },
    }
  )
);

export const SPECIAL_DAYS: { monthDay: string; name: string; theme: string }[] = [
  { monthDay: "01-01", name: "New Year's Day", theme: "Fresh start, new goals, celebrate the year ahead." },
  { monthDay: "02-14", name: "Valentine's Day", theme: "Love, gifting, thoughtful gestures." },
  { monthDay: "03-08", name: "International Women's Day", theme: "Celebrate women, uplift female voices, gender equality." },
  { monthDay: "04-07", name: "Genocide Against the Tutsi Remembrance", theme: "Solemn remembrance, unity, hope, resilience. No promotional tone." },
  { monthDay: "04-22", name: "Earth Day", theme: "Sustainability, environmental commitment, planet-first." },
  { monthDay: "05-01", name: "Labor Day", theme: "Honor workers, team spotlights." },
  { monthDay: "06-05", name: "World Environment Day", theme: "Environmental action, eco impact." },
  { monthDay: "11-24", name: "Black Friday", theme: "Biggest sale of the year, urgency, exclusive deals." },
  { monthDay: "12-25", name: "Christmas", theme: "Warmth, gifting, community." },
];

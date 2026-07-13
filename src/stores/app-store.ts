import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CampaignStatus = "draft" | "generating" | "pending_approval" | "approved" | "scheduled" | "published" | "rejected";

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
}

export interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits: string[];
  audience: string;
  price?: string;
  tags: string[];
  imageUrls: string[];
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

export interface Campaign {
  id: string;
  name: string;
  productId: string;
  status: CampaignStatus;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  downloads: number;
  assets?: CampaignAssets;
}

export type ChannelKey = "gmail" | "facebook" | "instagram" | "linkedin" | "x" | "tiktok" | "whatsapp";
export interface Channel { key: ChannelKey; label: string; connected: boolean; account?: string; }

interface AppState {
  brand: Brand;
  products: Product[];
  campaigns: Campaign[];
  channels: Channel[];
  setBrand: (b: Partial<Brand>) => void;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCampaign: (c: Campaign) => void;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  updateAssets: (id: string, patch: Partial<CampaignAssets>) => void;
  toggleChannel: (key: ChannelKey) => void;
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
};

const seedProducts: Product[] = [
  {
    id: "prod_ecobottle",
    name: "EcoBottle",
    description: "Insulated stainless-steel bottle made from 90% recycled materials. Keeps drinks cold for 24h or hot for 12h.",
    features: ["Recycled stainless steel", "Leak-proof lid", "24h cold / 12h hot", "BPA-free"],
    benefits: ["Reduces single-use plastic", "Long-lasting", "Dishwasher safe"],
    audience: "Eco-conscious professionals aged 25-45",
    price: "$29",
    tags: ["hydration", "sustainable", "bestseller"],
    imageUrls: [],
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
      setBrand: (b) => set((s) => ({ brand: { ...s.brand, ...b } })),
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
    }),
    {
      name: "videomark-ai-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? window.localStorage : (undefined as never))),
      skipHydration: true,
    }
  )
);

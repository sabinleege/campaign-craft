import type { CampaignAssets, Product, Brand } from "../stores/app-store";

export interface GenStep { key: string; label: string; }
export const GENERATION_STEPS: GenStep[] = [
  { key: "strategy", label: "Marketing strategy" },
  { key: "script", label: "Video script" },
  { key: "storyboard", label: "Storyboard" },
  { key: "voiceover", label: "Voice-over (Google TTS)" },
  { key: "animation", label: "HyperFrames animation" },
  { key: "captions", label: "Captions & CTA" },
  { key: "channels", label: "Social, email & messaging copy" },
];

export const VIDEO_PIPELINE_STEPS: GenStep[] = [
  { key: "script", label: "Script" },
  { key: "voiceover", label: "Voice-over" },
  { key: "hyperframes", label: "HyperFrames animation" },
  { key: "captions", label: "Captions" },
  { key: "music", label: "Music" },
  { key: "branding", label: "Branding" },
  { key: "render", label: "Render" },
];

export function generateMockAssets(product: Product, brand: Brand, name: string): CampaignAssets {
  const p = product.name;
  return {
    strategy: `Position ${p} as the leading choice for ${product.audience}. Emphasize ${product.features.slice(0, 2).join(" and ")}. Multi-channel launch aligned with ${brand.name}'s ${brand.toneOfVoice.toLowerCase()} voice.`,
    script: `[Scene 1] Hook — introduce the problem ${p} solves.\n[Scene 2] Show ${p} in action.\n[Scene 3] Highlight: ${product.features.slice(0, 3).join(", ")}.\n[Scene 4] Call to action: ${name}.`,
    storyboard: ["Hook shot", "Product in context", "Feature close-ups", "Brand hero shot"],
    captions: `Meet ${p} — ${product.features[0] ?? "built for you"}.`,
    cta: `Learn more — ${name}`,
    socialPosts: [
      { network: "facebook", text: `${p} is here. ${product.benefits[0] ?? ""} ${name} is live.`, hashtags: `#${brand.name} #${p.replace(/\s+/g, "")}` },
      { network: "instagram", text: `${product.benefits[0] ?? p} ✨`, hashtags: `#${p.replace(/\s+/g, "")} #${brand.name}` },
      { network: "linkedin", text: `We're launching ${p} — ${product.description}`, hashtags: `#${brand.industry.replace(/\s+/g, "")}` },
      { network: "x", text: `${p} — ${product.features[0] ?? ""}. ${name}.`, hashtags: `#${p.replace(/\s+/g, "")}` },
      { network: "tiktok", text: `POV: ${product.benefits[0] ?? "you found it"} 👀`, hashtags: `#${p.replace(/\s+/g, "")}` },
    ],
    email: {
      subject: `Introducing ${p}`,
      preheader: `${name} is live.`,
      body: `Hi,\n\nWe're excited to share ${p} — ${product.description}\n\n— The ${brand.name} team`,
    },
    whatsapp: `Hey! 👋 Quick note: ${p} is now available as part of ${name}. Reply YES for the link.`,
    blog: {
      title: `Introducing ${p}: ${product.benefits[0] ?? "a better way"}`,
      body: `Today we're launching ${p}. ${product.description}\n\nKey features: ${product.features.join(", ")}.`,
    },
    landing: {
      headline: name,
      sub: `${p} — ${product.features[0] ?? ""}`,
      body: product.description,
    },
  };
}

export async function runGeneration(onStep: (idx: number) => void, delayMs = 700): Promise<void> {
  for (let i = 0; i < GENERATION_STEPS.length; i++) {
    await new Promise((r) => setTimeout(r, delayMs));
    onStep(i);
  }
}

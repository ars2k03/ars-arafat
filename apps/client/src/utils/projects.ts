import type { Project } from "@/types/projects";
import type { TechItem } from "@/types/skills";
import { site } from "@/utils/site";

const tech = {
  nextjs: { name: "Next.js", logo: "/skills/nextjs.svg" },
  typescript: { name: "TypeScript", logo: "/skills/typescript.svg" },
  nestjs: { name: "NestJS", logo: "/skills/nestjs.svg" },
  postgresql: { name: "PostgreSQL", logo: "/skills/postgresql.svg" },
  nodejs: { name: "Node.js", logo: "/skills/nodejs.svg" },
  redis: { name: "Redis", logo: "/skills/redis.svg" },
} satisfies Record<string, TechItem>;

export const projects: Project[] = [
  {
    title: "WA Gateway",
    description:
      "Self-hosted WhatsApp OTP gateway: link your number, create an API key and send verification codes with one HTTP request. Developers can send OTPs via API after QR pairing, with auto-reconnect and Redis-backed sessions, plus a dashboard for API keys, custom templates, playground, logs and usage limits.",
    image: "/projects/wa-gateway.png",
    stack: [tech.nextjs, tech.nestjs, tech.typescript, tech.postgresql, tech.redis],
    links: [
      { label: "Live site", href: "https://wa.ars2k03.tech" },
      { label: "GitHub", href: "https://github.com/ars2k03/wa" },
      { label: "API docs", href: "https://wa.ars2k03.tech/docs" },
    ],
  },
  {
    title: "Chakri AI",
    description:
      "AI-powered recruitment platform for Bangladesh that connects job seekers and recruiters with matching, voice interviews and career tools. Job seekers get AI match scores, CV builder and scored AI voice interviews; recruiters get AI ranking, Auto-Pilot hiring, messaging and bKash/SSLCommerz payments.",
    image: "/projects/chakri-ai-home.png",
    stack: [tech.nextjs, tech.nestjs, tech.typescript, tech.postgresql, tech.redis],
    links: [{ label: "Live site", href: "https://chakriai.com" }],
  },
  {
    title: "JoldiMart",
    description:
      "Hyper-local grocery delivery platform for Dhaka. Customers browse catalog, login with WhatsApp OTP and checkout with Cash on Delivery or bKash, then track orders live with SSE updates and a 15-minute delivery countdown.",
    image: "/projects/joldimart-home.png",
    stack: [tech.nextjs, tech.nestjs, tech.typescript, tech.postgresql, tech.redis],
    links: [{ label: "Live site", href: "https://joldimart.com" }],
  },
  {
    title: "ars-facebook-auth",
    description: "Add Facebook login to any Node.js backend in two lines of code.",
    stack: [tech.typescript, tech.nodejs],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/ars-facebook-auth" },
      { label: "Source", href: `${site.github.url}/ars-facebook-auth` },
    ],
  },
];

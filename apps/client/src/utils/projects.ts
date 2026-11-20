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
      "WhatsApp OTP is expensive and hard to set up for small teams — WA Gateway gives developers and startups a free, self-hosted API to send verification codes over WhatsApp with one HTTP request.",
    points: [
      "Skips costly SMS/Business API vendors: pair your number via QR, create an API key, then send OTPs from your app",
      "Dashboard with custom templates, playground, message logs and usage limits so developers and small startups can ship auth without per-message bills",
    ],
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
      "Manual hiring in Bangladesh is slow and fragmented — Chakri AI matches job seekers and recruiters with AI screening, voice interviews and shortlisting in one place.",
    points: [
      "Job seekers get AI match scores with explanations, a CV builder and scored AI voice interviews with live captions and proctoring",
      "Recruiters get AI candidate ranking, Auto-Pilot hiring workflows and real-time messaging to shortlist faster",
    ],
    image: "/projects/chakri-ai-home.png",
    stack: [tech.nextjs, tech.nestjs, tech.typescript, tech.postgresql, tech.redis],
    links: [{ label: "Live site", href: "https://chakriai.com" }],
  },
  {
    title: "JoldiMart",
    description:
      "Everyday grocery runs in Dhaka are slow and inconvenient — JoldiMart delivers essentials to your door in about 15 minutes in Bashundhara R/A.",
    points: [
      "Customers browse the catalog, log in with WhatsApp OTP and checkout with Cash on Delivery or bKash",
      "Live order tracking with SSE updates, a 15-minute delivery countdown and a floating active-order tracker",
    ],
    image: "/projects/joldimart-home.png",
    stack: [tech.nextjs, tech.nestjs, tech.typescript, tech.postgresql, tech.redis],
    links: [{ label: "Live site", href: "https://joldimart.com" }],
  },
  {
    title: "ars-facebook-auth",
    description:
      "Facebook OAuth is boilerplate-heavy for Node backends — this npm package lets developers add Facebook login in two lines without wiring the full handshake themselves.",
    points: [
      "Install the package, pass your app credentials, and drop Facebook login into any Node.js API",
      "Handles the OAuth flow end to end so you get a verified Facebook user without custom callback plumbing",
    ],
    stack: [tech.typescript, tech.nodejs],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/ars-facebook-auth" },
      { label: "Source", href: `${site.github.url}/ars-facebook-auth` },
    ],
  },
];

import type { TechCategory } from "@/types/skills";

export const skillCategories: TechCategory[] = [
  {
    title: "Programming Languages",
    items: [
      { name: "TypeScript", logo: "/skills/typescript.svg" },
      { name: "JavaScript", logo: "/skills/javascript.svg" },
      { name: "SQL", logo: "/skills/sql.svg" },
      { name: "Dart", logo: "/skills/dart.svg" },
      { name: "C", logo: "/skills/c.svg" },
      { name: "C++", logo: "/skills/cpp.svg" },
      { name: "Java", logo: "/skills/java.svg" },
    ],
  },
  {
    title: "Backend Development",
    items: [
      { name: "Node.js", logo: "/skills/nodejs.svg" },
      { name: "NestJS", logo: "/skills/nestjs.svg" },
      { name: "Express.js", logo: "/skills/express.svg" },
      { name: "REST APIs", logo: "/skills/restapi.svg" },
      { name: "WebSockets", logo: "/skills/websocket.svg" },
    ],
  },
  {
    title: "Frontend & Mobile",
    items: [
      { name: "React", logo: "/skills/react.svg" },
      { name: "Next.js", logo: "/skills/nextjs.svg" },
      { name: "Flutter", logo: "/skills/flutter.svg" },
    ],
  },
  {
    title: "Databases & ORM",
    items: [
      { name: "PostgreSQL", logo: "/skills/postgresql.svg" },
      { name: "MongoDB", logo: "/skills/mongodb.svg" },
      { name: "Redis", logo: "/skills/redis.svg" },
      { name: "Prisma ORM", logo: "/skills/prisma.svg" },
    ],
  },
  {
    title: "Cloud & Infrastructure",
    items: [
      { name: "Supabase", logo: "/skills/supabase.svg" },
      { name: "Cloudflare", logo: "/skills/cloudflare.svg" },
      { name: "Docker", logo: "/skills/docker.svg" },
    ],
  },
  {
    title: "AI & LLM",
    items: [
      { name: "LLM Integration", logo: "/skills/rag.svg" },
      { name: "AI Agents", logo: "/skills/rag.svg" },
      { name: "RAG", logo: "/skills/rag.svg" },
      { name: "Speech-to-Text", logo: "/skills/rag.svg" },
      { name: "Text-to-Speech", logo: "/skills/rag.svg" },
    ],
  },
  {
    title: "Development Tools & CI/CD",
    items: [
      { name: "GitHub Actions", logo: "/skills/githubactions.svg" },
      { name: "Postman", logo: "/skills/postman.svg" },
    ],
  },
];

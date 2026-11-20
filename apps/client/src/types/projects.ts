import type { TechItem } from "@/types/skills";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  /** One-line: what it is and what problem it solves */
  description: string;
  /** How it works / key capabilities (resume-style bullets) */
  points: string[];
  image?: string;
  stack: TechItem[];
  links: ProjectLink[];
}

export type Role = "user" | "assistant";

export type ChatImage = {
  name: string;
  url: string;
  alt?: string;
};

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  images?: ChatImage[];
  isStreaming?: boolean;
};

export type AskResponse = {
  answer: string;
  images?: ChatImage[];
};

export type AskResult =
  | { ok: true; answer: string; images?: ChatImage[] }
  | { ok: false; error: string };

export type StreamEvent =
  | { type: "start" }
  | { type: "meta"; images?: ChatImage[] }
  | { type: "token"; text: string }
  | { type: "done" };

export type MessageBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

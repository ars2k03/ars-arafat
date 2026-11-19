import type { Metadata } from "next";
import { ChatShell } from "@/components/chat/ChatShell";

export const metadata: Metadata = {
  title: "A R S Assistant",
  description:
    "Ask questions about Md Arafat Rahman Sohan — projects, skills, and background.",
  alternates: {
    canonical: "/assistant",
  },
};

export default function AssistantPage() {
  return <ChatShell />;
}

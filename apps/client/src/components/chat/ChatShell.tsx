"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import type { ChatImage, ChatMessage, StreamEvent } from "@/types/chat";

function createMessage(
  role: ChatMessage["role"],
  content: string,
  id = crypto.randomUUID(),
  extras?: Pick<ChatMessage, "images" | "isStreaming">,
): ChatMessage {
  return {
    id,
    role,
    content,
    createdAt: Date.now(),
    ...extras,
  };
}

function parseStreamLine(line: string): StreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as StreamEvent;
  } catch {
    return null;
  }
}

function paintFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

type ChatShellProps = {
  variant?: "page" | "widget";
  onClose?: () => void;
};

export function ChatShell({ variant = "page", onClose }: ChatShellProps) {
  const compact = variant === "widget";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, createMessage("user", question)]);
    setInput("");
    setError(null);
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    let pendingImages: ChatImage[] = [];
    let content = "";
    let started = false;

    const ensureAssistant = (
      next: Partial<Pick<ChatMessage, "content" | "images" | "isStreaming">>,
    ) => {
      if (!started) {
        started = true;
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          createMessage("assistant", next.content ?? "", assistantId, {
            images: next.images,
            isStreaming: next.isStreaming ?? true,
          }),
        ]);
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId ? { ...message, ...next } : message,
        ),
      );
    };

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok || !response.body) {
        const message =
          (await response.text()) ||
          "Something went wrong while getting a reply. Please try again.";
        setError(message);
        setMessages((prev) => [...prev, createMessage("assistant", message)]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleEvent = async (event: StreamEvent) => {
        if (event.type === "start") {
          return;
        }

        if (event.type === "meta") {
          pendingImages = event.images ?? [];
          if (started && pendingImages.length > 0) {
            ensureAssistant({ images: pendingImages });
          }
          return;
        }

        if (event.type === "token") {
          content += event.text;
          ensureAssistant({
            content,
            ...(pendingImages.length > 0 ? { images: pendingImages } : {}),
            isStreaming: true,
          });
          await paintFrame();
          return;
        }

        if (event.type === "done" && started) {
          ensureAssistant({
            content,
            ...(pendingImages.length > 0 ? { images: pendingImages } : {}),
            isStreaming: false,
          });
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const event = parseStreamLine(line);
          if (event) await handleEvent(event);
        }
      }

      const tail = decoder.decode();
      if (tail) buffer += tail;

      for (const line of buffer.split("\n")) {
        const event = parseStreamLine(line);
        if (event) await handleEvent(event);
      }

      if (!started) {
        if (pendingImages.length > 0) {
          ensureAssistant({
            content: "",
            images: pendingImages,
            isStreaming: false,
          });
        } else {
          const message =
            "I couldn't generate a reply. Please try asking again.";
          setError(message);
          setMessages((prev) => [...prev, createMessage("assistant", message)]);
        }
      } else {
        ensureAssistant({
          content,
          ...(pendingImages.length > 0 ? { images: pendingImages } : {}),
          isStreaming: false,
        });
      }
    } catch {
      const message =
        "I couldn't connect right now. Please try again in a moment.";
      setError(message);
      if (started) {
        ensureAssistant({ content: message, isStreaming: false });
      } else {
        setMessages((prev) => [...prev, createMessage("assistant", message)]);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col bg-[#fbf8f1] ${
        compact ? "h-full" : "h-[calc(100dvh-72px)]"
      }`}
    >
      <ChatHeader compact={compact} onClose={onClose} />
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        bottomRef={bottomRef}
        compact={compact}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        error={error}
        inputRef={inputRef}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        compact={compact}
        inputId={compact ? "assistant-widget-input" : "chat-input"}
      />
    </div>
  );
}

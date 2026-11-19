import type { RefObject } from "react";
import { EmptyChatIcon } from "@/components/icons";
import {
  MessageBubble,
  TypingIndicator,
} from "@/components/chat/MessageBubble";
import type { ChatMessage } from "@/types/chat";

type ChatMessagesProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  compact?: boolean;
};

export function ChatMessages({
  messages,
  isLoading,
  bottomRef,
  compact = false,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className={`mx-auto flex min-h-full max-w-3xl flex-col ${
          compact ? "px-3 py-4" : "px-4 py-6 sm:px-6"
        }`}
      >
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <EmptyChatIcon
              className={`${compact ? "h-12 w-12" : "h-16 w-16"} text-[#1a1a1a]/40`}
            />
            <div>
              <p
                className={`font-[family-name:var(--font-playfair)] italic text-[#1a1a1a] ${
                  compact ? "text-xl" : "text-2xl"
                }`}
              >
                Start a conversation
              </p>
              <p
                className={`mt-2 max-w-sm text-[#4a4336] ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                Ask about projects, skills, or background.
              </p>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col pb-2 ${compact ? "gap-4" : "gap-6"}`}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}
        <div ref={bottomRef} className="h-1 shrink-0" />
      </div>
    </div>
  );
}

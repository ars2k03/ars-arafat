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
};

export function ChatMessages({
  messages,
  isLoading,
  bottomRef,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6 sm:px-6">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <EmptyChatIcon className="h-16 w-16 text-[#1a1a1a]/40" />
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-2xl italic text-[#1a1a1a]">
                Start a conversation
              </p>
              <p className="mt-2 max-w-sm text-base text-[#4a4336]">
                Ask about experience, projects, skills, or background.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-2">
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

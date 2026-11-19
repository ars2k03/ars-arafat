import { MessageContent } from "@/components/chat/MessageContent";
import type { ChatMessage } from "@/types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const images = message.images ?? [];

  return (
    <div
      className={`flex animate-[fadeIn_0.25s_ease-out] ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[min(100%,36rem)] flex-col gap-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {message.content ? (
          <div
            className={`px-4 py-3 shadow-[2px_2px_0_rgba(26,26,26,0.06)] ${
              isUser
                ? "rounded-2xl rounded-tr-md bg-[#1a1a1a] text-[#fbf8f1]"
                : "rounded-2xl rounded-tl-md border-[1.5px] border-[#1a1a1a]/20 bg-white text-[#1a1a1a]"
            }`}
          >
            <MessageContent content={message.content} variant={message.role} />
          </div>
        ) : null}

        {images.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {images.map((image) => (
              <a
                key={image.url}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl border-[1.5px] border-[#1a1a1a]/20 bg-white shadow-[2px_2px_0_rgba(26,26,26,0.06)]"
              >
                <img
                  src={image.url}
                  alt={image.alt ?? image.name}
                  className="max-h-80 w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex animate-[fadeIn_0.2s_ease-out] justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border-[1.5px] border-[#1a1a1a]/20 bg-white px-4 py-3.5 shadow-[2px_2px_0_rgba(26,26,26,0.06)]">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#7a2020] [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#7a2020] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#7a2020] [animation-delay:300ms]" />
      </div>
    </div>
  );
}

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { SendIcon } from "@/components/icons";

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  error: string | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  compact?: boolean;
  inputId?: string;
};

export function ChatInput({
  input,
  isLoading,
  error,
  inputRef,
  onInputChange,
  onSubmit,
  onKeyDown,
  compact = false,
  inputId = "chat-input",
}: ChatInputProps) {
  return (
    <footer className="shrink-0">
      <div
        className={`mx-auto max-w-3xl ${
          compact ? "px-3 py-3" : "px-4 py-4 sm:px-6"
        }`}
      >
        {error && (
          <p
            className="mb-3 rounded-xl border border-[#7a2020]/25 bg-[#7a2020]/5 px-3 py-2 text-sm text-[#7a2020]"
            role="alert"
          >
            {error}
          </p>
        )}
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 rounded-3xl border border-[#1a1a1a]/16 bg-[#fffefb] p-2 shadow-[0_2px_12px_rgba(26,26,26,0.06)] focus-within:border-[#1a1a1a]/28 focus-within:shadow-[0_4px_18px_rgba(26,26,26,0.08)]"
        >
          <label htmlFor={inputId} className="sr-only">
            Your question
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message A R S Assistant…"
            disabled={isLoading}
            className={`max-h-36 flex-1 resize-none bg-transparent px-3 text-base text-[#1a1a1a] outline-none placeholder:text-[#4a4336]/50 disabled:opacity-60 ${
              compact ? "min-h-10 py-2.5" : "min-h-12 py-3"
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[#fbf8f1] transition-colors hover:bg-[#7a2020] disabled:cursor-not-allowed disabled:bg-[#1a1a1a]/25 disabled:opacity-100"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </form>
        {!compact && (
          <p className="mt-2.5 text-center text-xs text-[#4a4336]/65">
            Enter to send · Shift+Enter for new line
          </p>
        )}
      </div>
    </footer>
  );
}

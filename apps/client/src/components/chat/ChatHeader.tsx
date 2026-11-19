import Link from "next/link";
import { CloseIcon, LogoMark } from "@/components/icons";

type ChatHeaderProps = {
  compact?: boolean;
  onClose?: () => void;
};

export function ChatHeader({ compact = false, onClose }: ChatHeaderProps) {
  return (
    <div className="shrink-0 border-b border-[#1a1a1a]/15 bg-[#fbf8f1]">
      <div
        className={`mx-auto flex max-w-3xl items-center gap-3 px-4 ${
          compact ? "py-3 sm:px-4" : "flex-col justify-center gap-1 py-4 text-center sm:px-6"
        }`}
      >
        <div className={`flex items-center gap-2.5 ${compact ? "min-w-0 flex-1" : ""}`}>
          <LogoMark className={compact ? "h-6 w-6 shrink-0 text-[#1a1a1a]" : "h-7 w-7 text-[#1a1a1a]"} />
          <div className={compact ? "min-w-0 text-left" : ""}>
            <h1
              className={`font-[family-name:var(--font-playfair)] italic tracking-wide text-[#1a1a1a] ${
                compact ? "truncate text-lg" : "text-xl sm:text-2xl"
              }`}
            >
              A R S Assistant
            </h1>
            {!compact && (
              <p className="text-sm text-[#4a4336]">
                Ask anything about Md Arafat Rahman Sohan
              </p>
            )}
            {compact && (
              <p className="truncate text-xs text-[#4a4336]">
                Ask about experience, projects & skills
              </p>
            )}
          </div>
        </div>

        {compact && (
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/assistant"
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#4a4336] transition-colors hover:bg-[#1a1a1a]/6 hover:text-[#1a1a1a]"
            >
              Expand
            </Link>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close assistant"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#1a1a1a] transition-colors hover:bg-[#1a1a1a]/8"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

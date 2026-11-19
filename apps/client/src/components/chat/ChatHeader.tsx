import { LogoMark } from "@/components/icons";

export function ChatHeader() {
  return (
    <div className="shrink-0 border-b border-[#1a1a1a]/15 bg-[#fbf8f1]">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-1 px-4 py-4 text-center sm:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7 text-[#1a1a1a]" />
          <h1 className="font-[family-name:var(--font-playfair)] text-xl italic tracking-wide text-[#1a1a1a] sm:text-2xl">
            A R S Assistant
          </h1>
        </div>
        <p className="text-sm text-[#4a4336]">
          Ask anything about Md Arafat Rahman Sohan
        </p>
      </div>
    </div>
  );
}

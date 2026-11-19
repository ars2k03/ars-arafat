import type { Role } from "@/types/chat";
import { parseMessageBlocks } from "@/utils/message";

type MessageContentProps = {
  content: string;
  variant: Role;
};

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

export function MessageContent({ content, variant }: MessageContentProps) {
  if (variant === "user") {
    return (
      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
        {content}
      </p>
    );
  }

  const blocks = parseMessageBlocks(content);

  return (
    <div className="space-y-3 text-[15px] leading-7 text-[#1a1a1a]">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="break-words">
              {renderInline(block.text, `p${i}`)}
            </p>
          );
        }

        if (block.type === "ul") {
          return (
            <ul
              key={i}
              className="list-disc space-y-1.5 pl-5 marker:text-[#7a2020]"
            >
              {block.items.map((item, j) => (
                <li key={j} className="break-words pl-1">
                  {renderInline(item, `ul${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <ol
            key={i}
            className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-[#7a2020]"
          >
            {block.items.map((item, j) => (
              <li key={j} className="break-words pl-1">
                {renderInline(item, `ol${i}-${j}`)}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}

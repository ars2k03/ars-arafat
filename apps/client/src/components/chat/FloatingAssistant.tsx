"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatShell } from "@/components/chat/ChatShell";
import { CloseIcon, LogoMark } from "@/components/icons";

const NOTIF_KEY = "ars-assistant-notif-seen";

export function FloatingAssistant() {
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const hidden = pathname.startsWith("/assistant");

  useEffect(() => {
    if (hidden) {
      setOpen(false);
      return;
    }

    try {
      if (sessionStorage.getItem(NOTIF_KEY) === "1") return;
    } catch {
      // ignore storage failures
    }

    const timer = window.setTimeout(() => setShowNotif(true), 1200);
    return () => window.clearTimeout(timer);
  }, [hidden]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const dismissNotif = () => {
    setShowNotif(false);
    try {
      sessionStorage.setItem(NOTIF_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  const handleToggle = () => {
    setOpen((value) => {
      const next = !value;
      if (next) dismissNotif();
      return next;
    });
  };

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-6 sm:p-8 md:p-10">
      <div className="pointer-events-auto flex flex-col items-end gap-3.5">
        {open && (
          <section
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label="A R S Assistant"
            className="flex h-[min(640px,calc(100dvh-9rem))] w-[min(100vw-3rem,24rem)] origin-bottom-right animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden rounded-2xl border border-[#1a1a1a]/18 bg-[#fbf8f1] shadow-[0_18px_50px_rgba(26,26,26,0.18)] sm:w-[26rem]"
          >
            <ChatShell variant="widget" onClose={() => setOpen(false)} />
          </section>
        )}

        {!open && showNotif && (
          <div
            role="status"
            className="relative max-w-[16.5rem] animate-[notifPop_0.35s_ease-out] rounded-2xl rounded-br-md border border-[#1a1a1a]/15 bg-white px-4 py-3 shadow-[0_12px_28px_rgba(26,26,26,0.14)]"
          >
            <p className="font-[family-name:var(--font-playfair)] text-[15px] italic leading-snug text-[#1a1a1a]">
              Got a question? Ask A R S Assistant.
            </p>
            <p className="mt-1 text-xs leading-snug text-[#4a4336]">
              Projects, skills, background — tap to chat.
            </p>
            <button
              type="button"
              onClick={dismissNotif}
              aria-label="Dismiss notification"
              className="absolute -left-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#1a1a1a]/15 bg-[#fbf8f1] text-[#1a1a1a] shadow-sm transition-colors hover:bg-[#1a1a1a] hover:text-[#fbf8f1]"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-[#1a1a1a]/15 bg-white"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={open ? "Close assistant" : "Open A R S Assistant"}
          className={`group relative inline-flex items-center gap-3 rounded-2xl border border-[#1a1a1a]/20 bg-[#1a1a1a] text-[#fbf8f1] transition-[transform,background-color] hover:bg-[#7a2020] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a2020] active:scale-[0.97] ${
            open
              ? "h-14 w-14 justify-center shadow-[0_12px_32px_rgba(26,26,26,0.22)]"
              : "h-16 animate-[fabPulse_2.4s_ease-in-out_infinite] pl-3.5 pr-5 shadow-[0_12px_32px_rgba(26,26,26,0.22)]"
          }`}
        >
          {open ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <>
              <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf8f1]">
                <LogoMark className="h-8 w-8" />
              </span>
              <span className="flex min-w-0 flex-col items-start text-left">
                <span className="font-[family-name:var(--font-playfair)] text-[17px] italic leading-none tracking-wide">
                  Ask A R S
                </span>
                <span className="mt-1 text-[11px] font-sans font-medium leading-none text-[#fbf8f1]/70">
                  AI Assistant
                </span>
              </span>
              {showNotif && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 -top-1.5 inline-flex h-6 min-w-6 animate-[notifBounce_1.6s_ease-in-out_infinite] items-center justify-center rounded-full border-2 border-[#fbf8f1] bg-[#7a2020] px-1.5 text-[11px] font-sans font-bold leading-none text-[#fbf8f1]"
                >
                  1
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

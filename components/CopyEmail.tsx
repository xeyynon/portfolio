"use client";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * A small icon button in the email tile's corner: copies the address for
 * visitors whose mailto link opens nothing, and turns into a check mark.
 */
export default function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  const label = state === "copied" ? "Copied" : state === "failed" ? "Copy failed, select the address" : "Copy email address";

  return (
    <button
      type="button"
      className="copy-email"
      data-state={state}
      onClick={copy}
      aria-label={label}
      title={label}
    >
      {state === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Copied" : ""}
      </span>
    </button>
  );
}

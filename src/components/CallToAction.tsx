"use client";

import type { TrackingPayload } from "@/types";

interface CallToActionProps {
  trackingPayload: Omit<TrackingPayload, "event">;
}

export default function CallToAction({ trackingPayload }: CallToActionProps) {
  async function handleClick() {
    // Fire tracking event
    try {
      await fetch("/api/quote/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trackingPayload, event: "human_requested" }),
      });
    } catch {
      // Non-blocking
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <a
        href="tel:8552640363"
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{
          background: "rgba(240,235,224,0.08)",
          border: "1px solid rgba(240,235,224,0.15)",
          color: "var(--text)",
          borderRadius: "50px",
          padding: "14px 28px",
          fontSize: "0.95rem",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        Let me talk to a real person
      </a>
      <span className="text-sm" style={{ color: "var(--muted)" }}>
        855-264-0363
      </span>
    </div>
  );
}

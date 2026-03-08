import { NextRequest, NextResponse } from "next/server";
import type { TrackingPayload } from "@/types";

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/D3VIcqBWYMsTDRW3Efk5/webhook-trigger/8da45d3b-9143-4a43-9169-1fa46119fd96";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as TrackingPayload;

    // Log event
    console.log("[track]", payload.event, payload.email);

    // Forward to GHL if human was requested
    if (payload.event === "human_requested") {
      try {
        await fetch(GHL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("GHL webhook error:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Track error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

"use client";

import { useEffect, useRef } from "react";

let sessionId: string | null = null;

function getSession(): string {
  if (sessionId) return sessionId;
  if (typeof window !== "undefined") {
    let sid = sessionStorage.getItem("nv_session");
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("nv_session", sid);
    }
    sessionId = sid;
    return sid;
  }
  return "ssr";
}

async function track(
  eventType: string,
  componentId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        path: window.location.pathname,
        componentId,
        sessionId: getSession(),
        deviceInfo: `${navigator.userAgent.substring(0, 100)}`,
        metadata,
      }),
    });
  } catch {
    // fail silently
  }
}

export function useAnalytics() {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("PAGE_VIEW");
    }
  }, []);

  return {
    trackClick: (componentId: string, metadata?: Record<string, unknown>) =>
      track("CLICK", componentId, metadata),
    trackIntent: (metadata?: Record<string, unknown>) =>
      track("INTENT_BOOK", "reserve_button", metadata),
    trackConversion: (metadata?: Record<string, unknown>) =>
      track("CONVERSION", "reserve_form", metadata),
    trackAbandon: (metadata?: Record<string, unknown>) =>
      track("ABANDON", "reserve_form", metadata),
  };
}

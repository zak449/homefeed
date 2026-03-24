"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  size?: "normal" | "compact";
}

export default function Turnstile({ onVerify, size = "normal" }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onVerify);

  // Keep callback ref up to date
  callbackRef.current = onVerify;

  useEffect(() => {
    if (!siteKey) return;

    // Define the global callback
    const callbackName = `__turnstileCb_${Math.random().toString(36).slice(2)}`;
    (window as unknown as Record<string, unknown>)[callbackName] = (token: string) => {
      callbackRef.current(token);
    };

    // Load the Turnstile script if not already loaded
    if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Set attributes on the container div for implicit rendering
    const el = containerRef.current;
    if (el) {
      el.setAttribute("data-sitekey", siteKey);
      el.setAttribute("data-callback", callbackName);
      el.setAttribute("data-appearance", "managed");
      el.setAttribute("data-size", size);
    }

    return () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };
  }, [siteKey, size]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="cf-turnstile" />;
}

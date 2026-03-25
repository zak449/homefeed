"use client";

import Image from "next/image";
import { useState } from "react";

type Agent = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  photo?: string | null;
  brokerage?: string | null;
};

export default function AgentContactForm({
  listingId,
  agent,
}: {
  listingId: string;
  agent: Agent;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, senderName: name, senderEmail: email, message }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const inputClass = "w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-bg focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink/10 transition-colors";

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Agent info */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-border">
        {agent.photo ? (
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0">
            <Image src={agent.photo} alt={agent.name ?? "Agent"} fill className="object-cover" sizes="44px" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-tag flex items-center justify-center text-lg shrink-0">
            🏠
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display font-semibold text-sm text-ink">{agent.name ?? "Listing Agent"}</p>
          {agent.brokerage && (
            <p className="text-xs text-muted truncate">{agent.brokerage}</p>
          )}
        </div>
      </div>

      {/* Contact details */}
      {(agent.phone || agent.email) && (
        <div className="px-5 py-3 border-b border-border flex gap-4 flex-wrap">
          {agent.phone && (
            <a href={`tel:${agent.phone}`} className="text-xs font-medium text-cold hover:underline">
              {agent.phone}
            </a>
          )}
          {agent.email && (
            <a href={`mailto:${agent.email}`} className="text-xs font-medium text-cold hover:underline truncate">
              {agent.email}
            </a>
          )}
        </div>
      )}

      {/* Form */}
      <div className="px-5 py-4">
        {status === "sent" ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✉️</p>
            <p className="font-display font-semibold text-sm text-ink">Message sent</p>
            <p className="text-xs text-muted mt-1">Expect a reply soon</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-3 text-xs font-medium text-cold hover:underline"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <textarea
              placeholder="I have a question about this property..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className={`${inputClass} resize-none`}
            />
            {status === "error" && <p className="text-xs text-accent font-medium">Something went wrong. Try again.</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-2.5 bg-[#F5F5F5] text-[#0E0E0E] text-sm font-semibold rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

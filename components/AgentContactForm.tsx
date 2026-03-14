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

    const res = await fetch("/api/contact-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, senderName: name, senderEmail: email, message }),
    });

    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {/* Agent info */}
      <div className="bg-goldenrod px-6 py-5 flex items-center gap-4">
        {agent.photo ? (
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-white/60">
            <Image src={agent.photo} alt={agent.name ?? "Agent"} fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-white/40 flex items-center justify-center text-xl shrink-0">
            🏠
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display text-xl text-ink leading-tight">{agent.name ?? "Listing Agent"}</p>
          {agent.brokerage && <p className="text-sm text-ink/70 mt-0.5 truncate">{agent.brokerage}</p>}
          <div className="flex gap-3 mt-2 flex-wrap">
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="text-sm font-semibold text-ink hover:underline">
                📞 {agent.phone}
              </a>
            )}
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="text-sm font-semibold text-ink hover:underline">
                ✉️ {agent.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="px-6 py-5">
        {status === "sent" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-display text-xl text-ink">Message sent!</p>
            <p className="text-sm text-gray-500 mt-1">Check your inbox for a confirmation copy.</p>
            <button onClick={() => setStatus("idle")} className="mt-4 text-sm text-coral hover:underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Send a message</p>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-goldenrod/50 bg-cream"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-goldenrod/50 bg-cream"
            />
            <textarea
              placeholder="Hi, I'm interested in this property…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-goldenrod/50 bg-cream resize-none"
            />

            {status === "error" && (
              <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-ink text-white font-bold py-3 rounded-xl hover:bg-ink/80 transition-colors text-sm disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send Message →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

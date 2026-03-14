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

  const inputClass = "w-full rounded-xl border-2 border-ink px-4 py-2.5 text-sm font-medium bg-cream focus:outline-none focus:border-goldenrod focus:ring-2 focus:ring-goldenrod/30";

  return (
    <div className="rounded-2xl overflow-hidden border-3 border-ink shadow-brute bg-white">
      {/* Agent info */}
      <div className="bg-goldenrod px-6 py-5 border-b-3 border-ink flex items-center gap-4">
        {agent.photo ? (
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-ink shadow-brute-sm">
            <Image src={agent.photo} alt={agent.name ?? "Agent"} fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-ink/10 border-2 border-ink flex items-center justify-center text-2xl shrink-0">
            🏠
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display text-xl text-ink uppercase leading-tight">{agent.name ?? "Listing Agent"}</p>
          {agent.brokerage && <p className="text-sm text-ink/60 mt-0.5 truncate font-medium">{agent.brokerage}</p>}
          <div className="flex gap-3 mt-2 flex-wrap">
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="text-sm font-bold text-ink hover:text-coral transition-colors">
                📞 {agent.phone}
              </a>
            )}
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="text-sm font-bold text-ink hover:text-coral transition-colors">
                ✉️ {agent.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="px-6 py-5">
        {status === "sent" ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-display text-xl text-ink uppercase">Message sent!</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Check your inbox for a confirmation.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 font-display text-xs uppercase border-2 border-ink px-4 py-1.5 rounded-full hover:bg-coral hover:text-white hover:border-coral transition-all shadow-brute-sm"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="font-display text-sm uppercase tracking-wider text-ink mb-1">Send a message</p>
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <textarea
              placeholder="Hi, I'm interested in this property…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className={`${inputClass} resize-none`}
            />
            {status === "error" && <p className="text-sm text-coral font-bold">Something went wrong. Please try again.</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full font-display text-sm uppercase bg-ink text-white border-2 border-ink py-3 rounded-xl hover:bg-coral hover:border-coral transition-colors disabled:opacity-50 shadow-brute-sm"
            >
              {status === "sending" ? "Sending…" : "Send Message →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

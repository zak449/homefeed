"use client";

import { useState } from "react";

type Step = "zip" | "address" | "verified";

export default function ZipVerification({ onVerified }: { onVerified?: (data: { zipCode: string; name: string; email: string }) => void }) {
  const [step, setStep] = useState<Step>("zip");
  const [zipCode, setZipCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleZipSubmit = () => {
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Enter a valid 5-digit zip code");
      return;
    }
    setError("");
    setStep("address");
  };

  const handleVerify = async () => {
    if (!address.trim() || !name.trim() || !email.trim()) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/community/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipCode, name, email, address }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Verification failed");
      }
      // Store verification in localStorage
      localStorage.setItem("gwak-verified", JSON.stringify({ zipCode, name, email, verifiedAt: new Date().toISOString() }));
      setStep("verified");
      onVerified?.({ zipCode, name, email });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "verified") {
    return (
      <div className="bg-surface border border-divider rounded-xl p-6 text-center">
        <div className="text-3xl mb-3">✅</div>
        <h3 className="text-lg font-semibold text-ink mb-1">You&apos;re verified</h3>
        <p className="text-sm text-secondary mb-3">
          Verified local in <span className="font-medium text-ink">{zipCode}</span>
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Verified Neighbor
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-divider rounded-xl p-6">
      <h3 className="text-base font-semibold text-ink mb-1">
        {step === "zip" ? "Join your neighborhood" : "Verify your address"}
      </h3>
      <p className="text-xs text-secondary mb-4">
        {step === "zip"
          ? "Enter your zip code to join the conversation."
          : "Your address is never shown publicly — only used to verify you live here."}
      </p>

      {error && (
        <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {step === "zip" && (
        <div className="space-y-3">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="Enter your zip code"
            className="w-full px-3 py-2.5 bg-highlight border border-divider rounded-lg text-sm text-ink placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          <button
            onClick={handleZipSubmit}
            className="w-full px-4 py-2.5 bg-ink text-bg text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue
          </button>
        </div>
      )}

      {step === "address" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-highlight rounded-lg">
            <span className="text-xs text-secondary">Zip:</span>
            <span className="text-xs font-medium text-ink">{zipCode}</span>
            <button onClick={() => setStep("zip")} className="text-xs text-amber hover:underline ml-auto">Change</button>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2.5 bg-highlight border border-divider rounded-lg text-sm text-ink placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full px-3 py-2.5 bg-highlight border border-divider rounded-lg text-sm text-ink placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your street address"
            className="w-full px-3 py-2.5 bg-highlight border border-divider rounded-lg text-sm text-ink placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          <p className="text-[11px] text-tertiary flex items-center gap-1">
            🔒 Your address is encrypted and never displayed publicly.
          </p>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-ink text-bg text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Join Community"}
          </button>
        </div>
      )}
    </div>
  );
}

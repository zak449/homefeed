import Link from "next/link";

export const metadata = {
  title: "AI Imagination — Gwaky",
  description: "See what could be. Reimagine any property with AI-powered visualization tools.",
};

export default function ImaginePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-tertiary mb-4">
          coming Q3 2026
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium text-ink mb-4 tracking-tight">
          See what could be.
        </h1>
        <p className="text-base text-secondary max-w-lg mx-auto leading-relaxed">
          AI-powered tools to reimagine any property. See remodels before you buy.
          Visualize your dream home. Share your vision with the community.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-16">
        {[
          {
            emoji: "🎨",
            title: "Reimagine Spaces",
            desc: "Apply different styles to any property — modern, farmhouse, Mediterranean. See it before you buy.",
          },
          {
            emoji: "📸",
            title: "Before & After",
            desc: "See a property\u2019s full history. Every renovation, every flip, every change — pulled from public records.",
          },
          {
            emoji: "🤖",
            title: "Ask the AI Agent",
            desc: "Our AI agent sits on community data. Ask anything about a neighborhood — noise, safety, schools, vibes.",
          },
        ].map((feature, i) => (
          <div key={i} className="bg-surface border border-divider rounded-xl p-6 hover:shadow-hover transition-shadow">
            <div className="text-2xl mb-3">{feature.emoji}</div>
            <h3 className="text-sm font-semibold text-ink mb-2">{feature.title}</h3>
            <p className="text-xs text-secondary leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-lg font-semibold text-ink mb-6 text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Choose a property", desc: "Browse any listing or search by address." },
            { step: "02", title: "Select a vision", desc: "Pick a style — or let AI surprise you." },
            { step: "03", title: "Share with the community", desc: "Post your reimagination as a visual take." },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ink text-bg text-sm font-semibold mb-3">
                {s.step}
              </div>
              <h4 className="text-sm font-medium text-ink mb-1">{s.title}</h4>
              <p className="text-xs text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Visions Gallery */}
      <div className="mb-16">
        <h2 className="text-lg font-semibold text-ink mb-2 text-center">Community visions</h2>
        <p className="text-xs text-secondary text-center mb-6">What neighbors imagine for their neighborhood</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { style: "Modern", zip: "90026", likes: 47 },
            { style: "Farmhouse", zip: "90039", likes: 32 },
            { style: "Mediterranean", zip: "90012", likes: 28 },
            { style: "Industrial", zip: "90291", likes: 19 },
          ].map((item, i) => (
            <div key={i} className="bg-highlight rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-amber/10 to-highlight flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-ink">{item.style}</p>
                <p className="text-[10px] text-tertiary">{item.zip} · {item.likes} likes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist CTA */}
      <div className="bg-surface border border-divider rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-ink mb-2">Be first to reimagine.</h2>
        <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
          AI Imagination launches Q3 2026. Join the waitlist for early access.
        </p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-3 py-2.5 bg-highlight border border-divider rounded-lg text-sm text-ink placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-amber/30"
          />
          <button className="px-5 py-2.5 bg-ink text-bg text-sm font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
            Join waitlist
          </button>
        </div>
        <p className="text-[10px] text-tertiary mt-3">No spam. Just early access.</p>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-secondary hover:text-ink transition-colors">
          ← Back to listings
        </Link>
      </div>
    </div>
  );
}

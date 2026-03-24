import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import JoinNeighborhood from "./JoinNeighborhood";

export const metadata: Metadata = {
  title: "About — gwak gwak",
  description:
    "We built gwak gwak because buying blind shouldn't be normal. The community-powered real estate platform rebuilding neighborhood trust.",
};

export default async function AboutPage() {
  const [listingCount, commentCount, reactionCount] = await Promise.all([
    prisma.listing.count({ where: { status: "active" } }),
    prisma.comment.count(),
    prisma.reaction.count(),
  ]);

  return (
    <div className="bg-bg min-h-screen">
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber/[0.06] blur-[120px] amber-shimmer pointer-events-none" />

        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24 relative z-10">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-5">
            About gwak gwak
          </p>
          <h1 className="font-display text-[2.25rem] sm:text-[3.25rem] md:text-[4rem] font-extrabold text-ink tracking-[-0.04em] leading-[1.04] max-w-3xl">
            We built gwak gwak because buying blind shouldn&rsquo;t be{" "}
            <span className="text-amber">normal</span>.
          </h1>
          <p className="text-lg sm:text-xl text-secondary mt-6 leading-relaxed max-w-2xl">
            Real estate is a trillion-dollar industry built on information asymmetry.
            We&rsquo;re flipping it. One neighborhood at a time.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — FOUNDER'S STORY
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="relative">
          {/* Vertical accent line */}
          <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-amber via-amber/40 to-transparent rounded-full" />

          <div className="pl-8 sm:pl-10 space-y-6">
            <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase">
              The origin story
            </p>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight">
              &ldquo;If gwak gwak existed, that truth would have been there.&rdquo;
            </h2>

            <div className="space-y-5 text-[15px] sm:text-base text-secondary leading-[1.75]">
              <p>
                Our founder bought a place. Signed the papers. Moved in. And then the
                neighbors started talking.
              </p>

              <p className="text-ink font-medium">
                The un-permitted addition the seller never disclosed. The flooding in the
                basement every spring. The HVAC unit on the roof that was two years past
                its life expectancy. The property line dispute that had been simmering for
                a decade. The construction project going up next door that would block the
                light for the next three years.
              </p>

              <p>
                All of it was common knowledge on the block. None of it appeared in the
                listing. The inspector didn&rsquo;t catch it. The agent didn&rsquo;t mention it.
                The neighbors? They would have told anyone who asked.
              </p>

              <p>
                But there was nowhere to ask. No platform where neighbors could share
                what they knew. No comment section for the biggest purchase of
                someone&rsquo;s life.
              </p>

              <p className="text-ink font-semibold text-base sm:text-lg">
                That&rsquo;s the moment gwak gwak was born. Not out of resentment
                toward the industry &mdash; but out of a simple belief: the people who
                live on a street know more about it than anyone trying to sell you
                something on it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — THE MISSION
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-ink">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-6">
            Our mission
          </p>
          <h2 className="font-display text-3xl sm:text-[2.75rem] md:text-5xl font-extrabold text-white tracking-[-0.04em] leading-[1.08] max-w-3xl">
            Rebuilding neighborhood trust in the age of isolation.
          </h2>
          <p className="text-lg text-white/60 mt-6 leading-relaxed max-w-2xl">
            Your neighbors have the answers. We gave them a place to share. Every
            listing gets a comment section. Every neighborhood gets a voice. Every buyer
            gets the truth before they sign.
          </p>

          {/* Mission pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14">
            {[
              {
                title: "Radical transparency",
                text: "No more information asymmetry. Neighbors, buyers, and locals surface what listing agents won't.",
              },
              {
                title: "Community intelligence",
                text: "The best data about a neighborhood already exists — in the heads of the people who live there.",
              },
              {
                title: "Trust before transaction",
                text: "When buyers trust the process, everyone wins. Including the agents who do things right.",
              },
            ].map((pillar) => (
              <div key={pillar.title} className="group">
                <div className="w-10 h-[3px] bg-amber rounded-full mb-4 group-hover:w-14 transition-all duration-300" />
                <h3 className="text-sm font-bold text-white tracking-tight mb-2">
                  {pillar.title}
                </h3>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS (3-STEP)
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-4">
            How it works
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Three steps to the truth
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Browse",
              description:
                "Explore listings for sale and rent across the country. Every home has a page. Every page has a pulse.",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Verify",
              description:
                "Read real opinions from verified neighbors, past buyers, and locals who know the street like family.",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Gwak",
              description:
                "Drop your take. Share what you know. Flag what others missed. Be the neighbor you wish you had.",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative bg-surface border border-divider rounded-2xl p-7 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Step number watermark */}
              <span className="absolute top-4 right-5 text-[3.5rem] font-display font-extrabold text-ink/[0.04] leading-none select-none">
                {item.step}
              </span>

              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-glow flex items-center justify-center shadow-glow">
                {item.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-ink tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="text-[13px] text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — THE AI VISION
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-highlight">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-4">
            The AI vision
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-4 max-w-2xl">
            Community intelligence, amplified by AI.
          </h2>
          <p className="text-base text-secondary leading-relaxed max-w-2xl mb-12">
            We&rsquo;re building at the intersection of collective wisdom and machine
            intelligence. Not to replace the neighborhood &mdash; but to make its
            knowledge accessible to everyone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: "AI Property Reimagination",
                text: "See what a home could become. Our AI generates renovation visions based on the property, the neighborhood, and what local markets value most.",
                badge: "Live",
              },
              {
                title: "Community Intelligence Engine",
                text: "Patterns emerge from thousands of neighbor comments. AI surfaces the insights that matter — from hidden flood zones to the best block for dog walks.",
                badge: "Building",
              },
              {
                title: "Neighborhood Knowledge Graph",
                text: "Every comment, every reaction, every verified insight builds a living map of neighborhood truth that gets smarter over time.",
                badge: "Building",
              },
              {
                title: "Agentic Future",
                text: "We're preparing for a world where AI agents help you find, evaluate, and negotiate homes. They'll need ground truth. We're building it.",
                badge: "Vision",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-surface border border-divider rounded-2xl p-6 hover:shadow-soft transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-bold text-ink tracking-tight">
                    {item.title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                      item.badge === "Live"
                        ? "bg-amber/10 text-amber"
                        : item.badge === "Building"
                        ? "bg-ink/5 text-secondary"
                        : "bg-ink/5 text-tertiary"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-[13px] text-secondary leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — FOR AGENTS
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 items-start">
          <div className="flex-1">
            <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-4">
              For real estate agents
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-5 leading-tight">
              We&rsquo;re not anti-agent.{" "}
              <span className="text-amber">We&rsquo;re pro-transparency.</span>
            </h2>
            <div className="space-y-4 text-[15px] text-secondary leading-[1.75]">
              <p>
                The best agents thrive when buyers trust the process. Transparency
                isn&rsquo;t a threat to good agents &mdash; it&rsquo;s a competitive
                advantage. When your listing has nothing to hide, a comment section full
                of neighbor love is the most powerful social proof money can&rsquo;t buy.
              </p>
              <p>
                gwak gwak helps honest agents stand out. It builds buyer confidence. And
                it creates a direct line between the neighborhood and the people
                considering joining it.
              </p>
            </div>
          </div>

          {/* Visual card */}
          <div className="shrink-0 w-full sm:w-64">
            <div className="bg-surface border border-divider rounded-2xl p-6 shadow-soft">
              <div className="space-y-4">
                {[
                  { label: "Build trust", desc: "Verified neighbor endorsements" },
                  { label: "Reduce days on market", desc: "Buyers close faster with confidence" },
                  { label: "Win more listings", desc: "Sellers want transparency too" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber/10 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D4763C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.label}</p>
                      <p className="text-[12px] text-tertiary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — THE DATA
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-ink">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-4">
              Live from the platform
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Real numbers. Real community.
            </h2>
            <p className="text-sm text-white/40 mt-3 max-w-md mx-auto">
              These aren&rsquo;t vanity metrics. Every number represents a real person
              sharing something real about a real place.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-10">
            {[
              { value: listingCount.toLocaleString(), label: "Active Listings", sub: "Homes with live conversations" },
              { value: commentCount.toLocaleString(), label: "Comments Shared", sub: "Opinions from real people" },
              { value: reactionCount.toLocaleString(), label: "Reactions", sub: "Community engagement signals" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-[-0.04em]">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-white/70 mt-2">
                  {stat.label}
                </p>
                <p className="text-[11px] text-white/30 mt-1 hidden sm:block">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8 — THE FOUNDER
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber to-amber/60 flex items-center justify-center shadow-glow-amber">
            <span className="text-white font-display text-3xl font-extrabold">ZK</span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-ink tracking-tight">
              Zachary Kaufman
            </h3>
            <p className="text-sm text-amber font-semibold mb-4">Founder</p>
            <p className="text-[15px] text-secondary leading-[1.75] max-w-xl">
              Building the social layer for real estate because the biggest purchase of
              your life deserves more than a marketing brochure. Obsessed with community,
              transparency, and the belief that neighborhoods are smarter than algorithms.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://x.com/gwakgwakapp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center text-white hover:bg-ink/80 transition-colors"
                aria-label="Twitter / X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 9 — CTA: JOIN YOUR NEIGHBORHOOD
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="relative bg-gradient-to-br from-ink to-ink/95 rounded-3xl p-8 sm:p-14 text-center overflow-hidden">
          {/* Ambient amber glow */}
          <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-amber/[0.08] blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-amber/[0.06] blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[11px] font-bold text-amber tracking-[0.2em] uppercase mb-5">
              Your move
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-[-0.03em] leading-[1.1] mb-4">
              Join your neighborhood.
            </h2>
            <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto mb-8 leading-relaxed">
              Enter your zip code to see what people are saying about the homes around
              you. No account needed to browse.
            </p>

            <JoinNeighborhood />

            <p className="text-[11px] text-white/25 mt-6">
              Available nationwide. Growing every day.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

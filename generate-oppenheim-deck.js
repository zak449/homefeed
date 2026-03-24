const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pres.author = "Zachary Kaufman";
pres.title = "gwak gwak — Oppenheim Group Investment Pitch";

// ─── DESIGN SYSTEM ───
const C = {
  bg: "0A0A0A",
  bgCard: "141414",
  bgCard2: "1A1A1A",
  text: "F2F0ED",
  textMuted: "8A8680",
  amber: "E8A87C",
  amberDark: "C4855C",
  amberGlow: "2A1A0F",
  white: "FFFFFF",
  accent2: "D4A574",
  red: "FF4444",
  green: "4ADE80",
};

const FONT = { head: "Georgia", body: "Calibri", mono: "Consolas" };

// Helper: fresh shadow objects each time (pptxgenjs mutates them)
const subtleShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.3 });
const glowShadow = () => ({ type: "outer", blur: 12, offset: 0, angle: 0, color: "E8A87C", opacity: 0.15 });

// ═══════════════════════════════════════════════════════
// ACT 1: THE SOUL (Slides 1–6)
// ═══════════════════════════════════════════════════════

// ── SLIDE 1: TITLE ──
let s1 = pres.addSlide();
s1.background = { color: C.bg };
// Large centered title
s1.addText("gwak gwak", {
  x: 0.5, y: 1.5, w: 12.33, h: 2,
  fontSize: 72, fontFace: FONT.head, color: C.amber,
  bold: true, align: "center", valign: "middle",
  charSpacing: 4,
});
s1.addText("the truth your realtor won't tell you.", {
  x: 0.5, y: 3.5, w: 12.33, h: 0.8,
  fontSize: 22, fontFace: FONT.body, color: C.textMuted,
  italic: true, align: "center",
});
// Amber line
s1.addShape(pres.shapes.RECTANGLE, {
  x: 5.5, y: 4.6, w: 2.33, h: 0.04,
  fill: { color: C.amber },
});
s1.addText("Investment & Partnership Proposal for The Oppenheim Group", {
  x: 0.5, y: 5.2, w: 12.33, h: 0.5,
  fontSize: 14, fontFace: FONT.body, color: C.textMuted,
  align: "center",
});
s1.addText("March 2026  |  Confidential", {
  x: 0.5, y: 6.5, w: 12.33, h: 0.4,
  fontSize: 11, fontFace: FONT.body, color: C.textMuted,
  align: "center",
});

// ── SLIDE 2: THE PAIN ──
let s2 = pres.addSlide();
s2.background = { color: C.bg };
// Left amber accent bar
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.0, w: 0.06, h: 4.5,
  fill: { color: C.amber },
});
s2.addText([
  { text: '"I bought my place two years ago.\n\n', options: { fontSize: 24, color: C.text, fontFace: FONT.head, italic: true, breakLine: true } },
  { text: 'My neighbors told me things about the previous owners that my realtor never mentioned. Un-permitted additions. Flooding. Neighbor disputes that went on for years.\n\n', options: { fontSize: 24, color: C.text, fontFace: FONT.head, italic: true, breakLine: true } },
  { text: 'If I had gwak gwak, that truth would have been there.\n', options: { fontSize: 24, color: C.amber, fontFace: FONT.head, italic: true, bold: true, breakLine: true } },
  { text: 'I would have had second thoughts."', options: { fontSize: 24, color: C.text, fontFace: FONT.head, italic: true, breakLine: true } },
], {
  x: 1.2, y: 0.8, w: 10.5, h: 5.0,
  valign: "middle", margin: 0,
});
s2.addText("— Zachary Kaufman, Founder", {
  x: 1.2, y: 6.0, w: 10, h: 0.5,
  fontSize: 16, fontFace: FONT.body, color: C.amber, bold: true,
});

// ── SLIDE 3: THE WORLD TODAY ──
let s3 = pres.addSlide();
s3.background = { color: C.bg };
s3.addText("THE WORLD TODAY", {
  x: 0.8, y: 0.4, w: 5, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s3.addText("$1.4M decisions made alone at midnight.", {
  x: 0.8, y: 1.1, w: 11.5, h: 1.2,
  fontSize: 36, fontFace: FONT.head, color: C.text, bold: true,
});

// Three problem cards
const problems = [
  { num: "87%", label: "of buyers say they wish\nthey knew more before buying", icon: "😰" },
  { num: "41%", label: "of Gen Z use social media\nfor real estate research", icon: "📱" },
  { num: "0", label: "platforms let your neighbor\nwarn you before you sign", icon: "🏚️" },
];
problems.forEach((p, i) => {
  const x = 0.8 + i * 4.0;
  s3.addShape(pres.shapes.RECTANGLE, {
    x, y: 2.8, w: 3.6, h: 2.6,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  s3.addText(p.icon, {
    x, y: 2.9, w: 3.6, h: 0.6,
    fontSize: 28, align: "center",
  });
  s3.addText(p.num, {
    x, y: 3.5, w: 3.6, h: 0.7,
    fontSize: 42, fontFace: FONT.head, color: C.amber, bold: true, align: "center", margin: 0,
  });
  s3.addText(p.label, {
    x: x + 0.2, y: 4.2, w: 3.2, h: 1.0,
    fontSize: 14, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
});

s3.addText("The front porch is gone. Your neighbor has answers. Until now.", {
  x: 0.8, y: 5.8, w: 11.5, h: 0.6,
  fontSize: 18, fontFace: FONT.head, color: C.text, italic: true,
});

// ── SLIDE 4: THE VISION ──
let s4 = pres.addSlide();
s4.background = { color: C.bg };
s4.addText("THE VISION", {
  x: 0.8, y: 0.4, w: 5, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s4.addText([
  { text: "gwak gwak ", options: { fontSize: 32, fontFace: FONT.head, color: C.amber, bold: true } },
  { text: "is a new way of speaking real estate.\nIt's a language of truth.", options: { fontSize: 32, fontFace: FONT.head, color: C.text } },
], {
  x: 0.8, y: 1.0, w: 11.5, h: 1.5,
});

// Mock product UI — phone frame
// Outer phone bezel
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 3.8, y: 2.6, w: 5.7, h: 4.3,
  fill: { color: "222222" }, shadow: subtleShadow(),
  rectRadius: 0.25,
});
// Inner screen
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 3.95, y: 2.75, w: 5.4, h: 4.0,
  fill: { color: C.bgCard2 },
  rectRadius: 0.15,
});
// Status bar
s4.addShape(pres.shapes.RECTANGLE, {
  x: 3.95, y: 2.75, w: 5.4, h: 0.3,
  fill: { color: "1E1E1E" },
});
s4.addText("9:41", {
  x: 4.1, y: 2.74, w: 1.0, h: 0.3,
  fontSize: 9, fontFace: FONT.body, color: C.text, bold: true, margin: 0,
});
s4.addText("●●●●  📶  🔋", {
  x: 7.8, y: 2.74, w: 1.4, h: 0.3,
  fontSize: 8, align: "right", margin: 0,
});
// App header bar
s4.addShape(pres.shapes.RECTANGLE, {
  x: 3.95, y: 3.05, w: 5.4, h: 0.45,
  fill: { color: "181818" },
});
s4.addText("gwak gwak", {
  x: 4.1, y: 3.05, w: 2.0, h: 0.45,
  fontSize: 13, fontFace: FONT.head, color: C.amber, bold: true, margin: 0, valign: "middle",
});
s4.addText("Silver Lake, 90026", {
  x: 6.1, y: 3.05, w: 2.0, h: 0.45,
  fontSize: 10, fontFace: FONT.body, color: C.textMuted, margin: 0, valign: "middle", align: "center",
});
s4.addText("🔔  👤", {
  x: 8.3, y: 3.05, w: 0.9, h: 0.45,
  fontSize: 12, align: "right", margin: 0, valign: "middle",
});

// Listing header mini-card
s4.addShape(pres.shapes.RECTANGLE, {
  x: 4.1, y: 3.6, w: 5.1, h: 0.6,
  fill: { color: "1E1E1E" },
});
s4.addText("🏠  2847 Griffith Park Blvd", {
  x: 4.2, y: 3.6, w: 2.8, h: 0.35,
  fontSize: 11, fontFace: FONT.body, color: C.text, bold: true, margin: 0,
});
s4.addText("$1,249,000  ·  3 bed / 2 bath", {
  x: 4.2, y: 3.9, w: 2.8, h: 0.25,
  fontSize: 9, fontFace: FONT.body, color: C.textMuted, margin: 0,
});
// Takes count badge
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 7.8, y: 3.67, w: 1.2, h: 0.4,
  fill: { color: C.amber }, rectRadius: 0.12,
});
s4.addText("🔥 14 takes", {
  x: 7.8, y: 3.67, w: 1.2, h: 0.4,
  fontSize: 9, fontFace: FONT.body, color: C.bg, bold: true, align: "center", valign: "middle",
});

// Divider
s4.addShape(pres.shapes.RECTANGLE, {
  x: 4.1, y: 4.25, w: 5.1, h: 0.015,
  fill: { color: "333333" },
});

// Mock comments with full UI detail
const mockComments = [
  { user: "verified_silverlake_91", badge: "✓ Verified", time: "2h", text: '"Flooded twice. Insurance won\'t cover it. Run."', color: C.red, reactions: "😬 24  🚨 18  💯 9", upvotes: "47" },
  { user: "longtime_local_34", badge: "✓ 12yr Resident", time: "5h", text: '"Best block in the neighborhood. Kids grew up here."', color: C.green, reactions: "❤️ 31  🏡 14  🔥 8", upvotes: "38" },
  { user: "nosy_neighbor_90026", badge: "✓ Verified", time: "1d", text: '"Seller is divorcing. Price dropped $80K. That\'s why."', color: C.amber, reactions: "👀 42  😳 19  💰 11", upvotes: "56" },
];
mockComments.forEach((c, i) => {
  const y = 4.35 + i * 0.78;
  // Avatar circle
  s4.addShape(pres.shapes.OVAL, {
    x: 4.15, y: y + 0.05, w: 0.3, h: 0.3,
    fill: { color: c.color },
  });
  s4.addText(c.user, {
    x: 4.55, y: y - 0.02, w: 2.2, h: 0.25,
    fontSize: 9, fontFace: FONT.mono, color: C.text, bold: true, margin: 0,
  });
  // Verification badge
  s4.addText(c.badge, {
    x: 6.6, y: y - 0.02, w: 1.2, h: 0.25,
    fontSize: 7, fontFace: FONT.body, color: c.color, margin: 0,
  });
  s4.addText(c.time, {
    x: 8.6, y: y - 0.02, w: 0.5, h: 0.25,
    fontSize: 8, fontFace: FONT.mono, color: C.textMuted, align: "right", margin: 0,
  });
  // Comment text
  s4.addText(c.text, {
    x: 4.55, y: y + 0.22, w: 4.3, h: 0.28,
    fontSize: 10, fontFace: FONT.body, color: C.text, italic: true, margin: 0,
  });
  // Reactions row
  s4.addText(c.reactions, {
    x: 4.55, y: y + 0.48, w: 2.5, h: 0.22,
    fontSize: 8, fontFace: FONT.body, color: C.textMuted, margin: 0,
  });
  // Upvote pill
  s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.2, y: y + 0.47, w: 0.7, h: 0.24,
    fill: { color: "2A2A2A" }, rectRadius: 0.08,
  });
  s4.addText("▲ " + c.upvotes, {
    x: 8.2, y: y + 0.47, w: 0.7, h: 0.24,
    fontSize: 8, fontFace: FONT.body, color: C.amber, bold: true, align: "center", valign: "middle",
  });
  // Separator between comments
  if (i < 2) {
    s4.addShape(pres.shapes.RECTANGLE, {
      x: 4.55, y: y + 0.74, w: 4.5, h: 0.01,
      fill: { color: "2A2A2A" },
    });
  }
});

// Bottom nav bar
s4.addShape(pres.shapes.RECTANGLE, {
  x: 3.95, y: 6.4, w: 5.4, h: 0.35,
  fill: { color: "181818" },
});
s4.addText("🏠  Feed          🔍  Search          📍  Map          👤  Profile", {
  x: 4.1, y: 6.4, w: 5.1, h: 0.35,
  fontSize: 8, fontFace: FONT.body, color: C.textMuted, align: "center", valign: "middle",
});

s4.addText("the comment section real estate never had.", {
  x: 0.8, y: 6.7, w: 11.5, h: 0.5,
  fontSize: 16, fontFace: FONT.body, color: C.textMuted, italic: true, align: "center",
});

// ── SLIDE 5: THE MOMENT ──
let s5 = pres.addSlide();
s5.background = { color: C.bg };
s5.addText("THE MOMENT", {
  x: 0.8, y: 0.4, w: 5, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s5.addText("The last honest voices in real estate just went silent.", {
  x: 0.8, y: 1.1, w: 11.5, h: 1.0,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});

const moments = [
  { head: "Curbed — Dead", sub: "Vox Media erased 15 years of local journalism in early 2026. SF, LA, all city editions — gone.", icon: "🪦" },
  { head: "Nextdoor — Failing", sub: "Lost $98M in 2024. Stock down 40%. General drama, not real estate. Gen Z doesn't use it.", icon: "📉" },
  { head: "Zillow — Censored", sub: "Removed climate risk data under agent pressure. The opposite of transparency.", icon: "🙈" },
];
moments.forEach((m, i) => {
  const x = 0.8 + i * 4.0;
  s5.addShape(pres.shapes.RECTANGLE, {
    x, y: 2.6, w: 3.6, h: 2.8,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  s5.addText(m.icon, {
    x, y: 2.7, w: 3.6, h: 0.6,
    fontSize: 30, align: "center",
  });
  s5.addText(m.head, {
    x: x + 0.3, y: 3.3, w: 3.0, h: 0.5,
    fontSize: 20, fontFace: FONT.head, color: C.amber, bold: true, align: "center", margin: 0,
  });
  s5.addText(m.sub, {
    x: x + 0.3, y: 3.9, w: 3.0, h: 1.3,
    fontSize: 13, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
});

s5.addText([
  { text: "gwak gwak ", options: { color: C.amber, bold: true } },
  { text: "is the heir. Community-powered. Not journalist-powered.", options: { color: C.text } },
], {
  x: 0.8, y: 5.8, w: 11.5, h: 0.6,
  fontSize: 22, fontFace: FONT.head, align: "center",
});

// ── SLIDE 6: BIGGER THAN REAL ESTATE ──
let s6 = pres.addSlide();
s6.background = { color: C.bg };
s6.addText("this is bigger than real estate.", {
  x: 0.8, y: 0.3, w: 11.7, h: 0.8,
  fontSize: 36, fontFace: FONT.head, color: C.amber, bold: true,
  align: "center",
});
s6.addText("we forgot how to trust our neighbors. gwak gwak brings back the block party — digitally.", {
  x: 1.5, y: 1.1, w: 10.3, h: 0.6,
  fontSize: 16, fontFace: FONT.body, color: C.textMuted, italic: true, align: "center",
});

// ── BEFORE / AFTER visual metaphor ──
// BEFORE panel
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.8, y: 2.0, w: 5.5, h: 4.0,
  fill: { color: C.bgCard }, shadow: subtleShadow(), rectRadius: 0.1,
});
s6.addText("BEFORE", {
  x: 0.8, y: 2.05, w: 5.5, h: 0.4,
  fontSize: 11, fontFace: FONT.body, color: C.red, bold: true, charSpacing: 4, align: "center", margin: 0,
});
s6.addText("Isolated", {
  x: 0.8, y: 2.4, w: 5.5, h: 0.4,
  fontSize: 20, fontFace: FONT.head, color: C.text, bold: true, align: "center", margin: 0,
});

// Before: 6 houses scattered, no connections, muted
const beforeHouses = [
  { x: 1.4, y: 3.1 }, { x: 3.0, y: 3.0 }, { x: 4.7, y: 3.2 },
  { x: 1.8, y: 4.3 }, { x: 3.4, y: 4.5 }, { x: 5.0, y: 4.2 },
];
beforeHouses.forEach((h) => {
  // Dark isolated house
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: h.x, y: h.y, w: 0.9, h: 0.7,
    fill: { color: "222222" }, rectRadius: 0.06,
  });
  s6.addText("🏠", {
    x: h.x, y: h.y, w: 0.9, h: 0.7,
    fontSize: 22, align: "center", valign: "middle",
  });
});
// Question marks between houses (isolation)
s6.addText("?", { x: 2.15, y: 3.4, w: 0.5, h: 0.4, fontSize: 18, fontFace: FONT.head, color: "444444", align: "center" });
s6.addText("?", { x: 3.8, y: 3.5, w: 0.5, h: 0.4, fontSize: 18, fontFace: FONT.head, color: "444444", align: "center" });
s6.addText("?", { x: 2.5, y: 4.0, w: 0.5, h: 0.4, fontSize: 18, fontFace: FONT.head, color: "444444", align: "center" });
s6.addText("$1.4M decisions\nmade alone at midnight", {
  x: 1.2, y: 5.2, w: 4.8, h: 0.6,
  fontSize: 12, fontFace: FONT.body, color: C.red, align: "center", italic: true,
});

// Arrow between panels
s6.addText("→", {
  x: 6.1, y: 3.5, w: 1.1, h: 1.0,
  fontSize: 40, fontFace: FONT.head, color: C.amber, align: "center", valign: "middle", bold: true,
});

// AFTER panel
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 7.0, y: 2.0, w: 5.5, h: 4.0,
  fill: { color: C.amberGlow }, shadow: glowShadow(), rectRadius: 0.1,
});
s6.addText("AFTER", {
  x: 7.0, y: 2.05, w: 5.5, h: 0.4,
  fontSize: 11, fontFace: FONT.body, color: C.green, bold: true, charSpacing: 4, align: "center", margin: 0,
});
s6.addText("Connected", {
  x: 7.0, y: 2.4, w: 5.5, h: 0.4,
  fontSize: 20, fontFace: FONT.head, color: C.amber, bold: true, align: "center", margin: 0,
});

// After: 6 houses with connection lines and speech bubbles
const afterHouses = [
  { x: 7.6, y: 3.1 }, { x: 9.2, y: 3.0 }, { x: 10.9, y: 3.2 },
  { x: 8.0, y: 4.3 }, { x: 9.6, y: 4.5 }, { x: 11.2, y: 4.2 },
];
// Connection lines (amber glow lines between houses)
const connections = [
  [0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[0,4],[1,3],[1,5],
];
connections.forEach(([a, b]) => {
  const hA = afterHouses[a], hB = afterHouses[b];
  const midX = (hA.x + hB.x) / 2 + 0.45;
  const midY = (hA.y + hB.y) / 2 + 0.35;
  // Use thin rectangles as connection indicators (small dots at midpoints)
  s6.addShape(pres.shapes.OVAL, {
    x: midX - 0.04, y: midY - 0.04, w: 0.08, h: 0.08,
    fill: { color: C.amber },
  });
});
afterHouses.forEach((h) => {
  // Warm connected house
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: h.x, y: h.y, w: 0.9, h: 0.7,
    fill: { color: "2A1A0F" }, rectRadius: 0.06,
    line: { color: C.amber, width: 1 },
  });
  s6.addText("🏡", {
    x: h.x, y: h.y, w: 0.9, h: 0.7,
    fontSize: 22, align: "center", valign: "middle",
  });
});
// Speech bubble indicators
s6.addText("💬", { x: 8.3, y: 2.85, w: 0.4, h: 0.3, fontSize: 12 });
s6.addText("🗣️", { x: 10.0, y: 2.75, w: 0.4, h: 0.3, fontSize: 12 });
s6.addText("💬", { x: 11.4, y: 3.95, w: 0.4, h: 0.3, fontSize: 12 });
s6.addText("Every zip code a community.\nEvery neighbor a voice.", {
  x: 7.4, y: 5.2, w: 4.8, h: 0.6,
  fontSize: 12, fontFace: FONT.body, color: C.amber, align: "center", italic: true, bold: true,
});

s6.addText("We're not disrupting real estate. We're reconnecting communities.", {
  x: 0.8, y: 6.3, w: 11.7, h: 0.5,
  fontSize: 16, fontFace: FONT.body, color: C.textMuted, italic: true, align: "center",
});

// ═══════════════════════════════════════════════════════
// ACT 2: THE PRODUCT (Slides 7–12)
// ═══════════════════════════════════════════════════════

// ── SLIDE 7: HOW IT WORKS ──
let s7 = pres.addSlide();
s7.background = { color: C.bg };
s7.addText("HOW IT WORKS", {
  x: 0.8, y: 0.4, w: 5, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s7.addText("Three steps. Zero friction.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});

const steps = [
  { num: "01", title: "Browse", desc: "See every listing in your area. Read what the community is really saying. No login required.", emoji: "🏠" },
  { num: "02", title: "Verify", desc: "Prove you live here. Your zip code is your credential. One-time check, permanent voice.", emoji: "✅" },
  { num: "03", title: "Gwak", desc: "Drop your take. Warn a buyer. Co-sign a block. Share what you know. Be heard.", emoji: "🗣️" },
];
steps.forEach((step, i) => {
  const x = 0.8 + i * 4.0;
  // Card
  s7.addShape(pres.shapes.RECTANGLE, {
    x, y: 2.3, w: 3.6, h: 3.5,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  // Number badge
  s7.addShape(pres.shapes.OVAL, {
    x: x + 1.3, y: 2.5, w: 1.0, h: 1.0,
    fill: { color: C.amber },
  });
  s7.addText(step.num, {
    x: x + 1.3, y: 2.5, w: 1.0, h: 1.0,
    fontSize: 28, fontFace: FONT.head, color: C.bg, bold: true, align: "center", valign: "middle",
  });
  s7.addText(step.title, {
    x: x + 0.3, y: 3.7, w: 3.0, h: 0.5,
    fontSize: 24, fontFace: FONT.head, color: C.text, bold: true, align: "center", margin: 0,
  });
  s7.addText(step.desc, {
    x: x + 0.3, y: 4.3, w: 3.0, h: 1.2,
    fontSize: 14, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
});

s7.addText("Anyone can browse. Only verified locals can drop takes.", {
  x: 0.8, y: 6.2, w: 11.5, h: 0.5,
  fontSize: 18, fontFace: FONT.body, color: C.amber, align: "center", bold: true,
});

// ── SLIDE 8: THE FEED ──
let s8 = pres.addSlide();
s8.background = { color: C.bg };
s8.addText("THE FEED", {
  x: 0.8, y: 0.4, w: 5, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s8.addText("Real properties. Real takes. Real reactions.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 32, fontFace: FONT.head, color: C.text, bold: true,
});

// Mock feed cards
const feedItems = [
  { price: "$1,249,000", addr: "2847 Griffith Park Blvd", beds: "3 bed / 2 bath / 1,890 sqft", takes: "14 takes", emoji: "🔥", topTake: '"Foundation cracks visible from the street. Ask me how I know."' },
  { price: "$875,000", addr: "1523 Echo Park Ave", beds: "2 bed / 1 bath / 1,210 sqft", takes: "8 takes", emoji: "💀", topTake: '"This was a grow house until 2023. Entire electrical needs replacing."' },
  { price: "$2,100,000", addr: "4401 Los Feliz Blvd", beds: "4 bed / 3 bath / 2,840 sqft", takes: "22 takes", emoji: "❤️", topTake: '"Best street in the neighborhood. We raised 3 kids here. Buy it."' },
];
feedItems.forEach((item, i) => {
  const x = 0.8 + i * 4.0;
  // Card bg
  s8.addShape(pres.shapes.RECTANGLE, {
    x, y: 2.2, w: 3.6, h: 4.2,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  // Photo placeholder
  s8.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.15, y: 2.35, w: 3.3, h: 1.6,
    fill: { color: "222222" },
  });
  s8.addText("🏡", {
    x: x + 0.15, y: 2.35, w: 3.3, h: 1.6,
    fontSize: 40, align: "center", valign: "middle",
  });
  // Takes badge
  s8.addShape(pres.shapes.RECTANGLE, {
    x: x + 2.2, y: 2.5, w: 1.1, h: 0.35,
    fill: { color: C.amber },
  });
  s8.addText(item.emoji + " " + item.takes, {
    x: x + 2.2, y: 2.5, w: 1.1, h: 0.35,
    fontSize: 10, fontFace: FONT.body, color: C.bg, bold: true, align: "center", valign: "middle",
  });
  // Price
  s8.addText(item.price, {
    x: x + 0.25, y: 4.05, w: 3.1, h: 0.4,
    fontSize: 20, fontFace: FONT.head, color: C.amber, bold: true, margin: 0,
  });
  s8.addText(item.addr, {
    x: x + 0.25, y: 4.4, w: 3.1, h: 0.3,
    fontSize: 12, fontFace: FONT.body, color: C.text, margin: 0,
  });
  s8.addText(item.beds, {
    x: x + 0.25, y: 4.65, w: 3.1, h: 0.3,
    fontSize: 10, fontFace: FONT.body, color: C.textMuted, margin: 0,
  });
  // Top take divider
  s8.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.25, y: 5.0, w: 3.1, h: 0.01,
    fill: { color: "333333" },
  });
  s8.addText(item.topTake, {
    x: x + 0.25, y: 5.1, w: 3.1, h: 1.1,
    fontSize: 11, fontFace: FONT.body, color: C.textMuted, italic: true,
  });
});

s8.addText("the comment section real estate never had.", {
  x: 0.8, y: 6.7, w: 11.5, h: 0.4,
  fontSize: 15, fontFace: FONT.body, color: C.textMuted, italic: true, align: "center",
});

// ── SLIDE 9: ZIP-VERIFIED COMMUNITIES ──
let s9 = pres.addSlide();
s9.background = { color: C.bg };
s9.addText("ZIP-VERIFIED COMMUNITIES", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s9.addText("Your address is your credential.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});
s9.addText("This is not anonymous internet. This is your neighbor. With their name on it.", {
  x: 0.8, y: 1.8, w: 11.5, h: 0.5,
  fontSize: 16, fontFace: FONT.body, color: C.textMuted, italic: true,
});

// Features
const communityFeatures = [
  { title: "Zip Code = Community", desc: "Every zip code is a living, breathing community. See who's verified. See what they're saying." },
  { title: "Disappearing After Sale", desc: "Comments live while the listing lives. When it sells, the conversation archives. New buyers get fresh truth." },
  { title: "Ask the Neighborhood", desc: "Thinking about buying? Ask verified locals anything — schools, noise, flooding, construction, vibes." },
  { title: "Community Alerts", desc: "Verified residents flag issues: construction plans, crime spikes, zoning changes. Your neighborhood's early warning system." },
];
communityFeatures.forEach((f, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 6.0;
  const y = 2.6 + row * 1.8;
  // Amber dot
  s9.addShape(pres.shapes.OVAL, {
    x, y: y + 0.1, w: 0.2, h: 0.2,
    fill: { color: C.amber },
  });
  s9.addText(f.title, {
    x: x + 0.4, y, w: 5.2, h: 0.4,
    fontSize: 18, fontFace: FONT.head, color: C.text, bold: true, margin: 0,
  });
  s9.addText(f.desc, {
    x: x + 0.4, y: y + 0.45, w: 5.2, h: 0.9,
    fontSize: 13, fontFace: FONT.body, color: C.textMuted,
  });
});

// ── SLIDE 10: AI IMAGINATION LAYER ──
let s10 = pres.addSlide();
s10.background = { color: C.bg };
s10.addText("THE AI IMAGINATION LAYER", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s10.addText("What if the comment wasn't just words?", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});

const aiFeatures = [
  { title: "Reimagine the Space", desc: "AI removes furniture, applies your style. Post your vision as a take. Modern, farmhouse, industrial — see it before you buy.", emoji: "🎨" },
  { title: "See the Full Story", desc: "AI pulls historical MLS photos, Street View archives, public records. See a teardown's full life — every renovation, every flip.", emoji: "📸" },
  { title: "Disaster Scenarios", desc: "See your potential home through wildfire, flood, or earthquake scenarios. Climate-aware buying for climate-aware generations.", emoji: "🌊" },
  { title: "Ask the AI Neighborhood Agent", desc: "Our AI agent sits on top of community data. Ask anything: 'Is this block safe at night?' 'How loud is this street?' Answers from REAL data.", emoji: "🤖" },
];
aiFeatures.forEach((f, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 6.0;
  const y = 2.3 + row * 2.2;
  // Card
  s10.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 5.7, h: 1.9,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  s10.addText(f.emoji, {
    x: x + 0.3, y: y + 0.2, w: 0.6, h: 0.6,
    fontSize: 28,
  });
  s10.addText(f.title, {
    x: x + 1.0, y: y + 0.2, w: 4.3, h: 0.4,
    fontSize: 17, fontFace: FONT.head, color: C.amber, bold: true, margin: 0,
  });
  s10.addText(f.desc, {
    x: x + 1.0, y: y + 0.7, w: 4.3, h: 1.0,
    fontSize: 12, fontFace: FONT.body, color: C.textMuted,
  });
});

s10.addText("No platform has community + AI visual imagination together.", {
  x: 0.8, y: 6.7, w: 11.5, h: 0.4,
  fontSize: 15, fontFace: FONT.body, color: C.amber, italic: true, align: "center",
});

// ── SLIDE 11: WHY THIS SURVIVES AI ──
let s11 = pres.addSlide();
s11.background = { color: C.bg };
s11.addText("WHY THIS SURVIVES AI", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s11.addText([
  { text: "AI can replace your realtor.\n", options: { fontSize: 36, fontFace: FONT.head, color: C.text, bold: true, breakLine: true } },
  { text: "AI cannot replace your neighbor.", options: { fontSize: 36, fontFace: FONT.head, color: C.amber, bold: true } },
], {
  x: 0.8, y: 1.0, w: 11.5, h: 2.0,
});

// Left: What AI can do
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 3.2, w: 5.5, h: 2.8,
  fill: { color: C.bgCard }, shadow: subtleShadow(),
});
s11.addText("WHAT AI CAN DO", {
  x: 1.1, y: 3.3, w: 5.0, h: 0.4,
  fontSize: 12, fontFace: FONT.body, color: C.textMuted, bold: true, charSpacing: 3, margin: 0,
});
s11.addText([
  { text: "✓  Property valuations & comps\n", options: { breakLine: true } },
  { text: "✓  Market predictions\n", options: { breakLine: true } },
  { text: "✓  Virtual tours\n", options: { breakLine: true } },
  { text: "✓  Document processing\n", options: { breakLine: true } },
  { text: "✓  Transaction automation", options: {} },
], {
  x: 1.1, y: 3.8, w: 5.0, h: 2.0,
  fontSize: 14, fontFace: FONT.body, color: C.textMuted,
});

// Right: What AI CANNOT do
s11.addShape(pres.shapes.RECTANGLE, {
  x: 7.0, y: 3.2, w: 5.5, h: 2.8,
  fill: { color: C.amberGlow }, shadow: glowShadow(),
});
s11.addText("WHAT AI CANNOT DO", {
  x: 7.3, y: 3.3, w: 5.0, h: 0.4,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true, charSpacing: 3, margin: 0,
});
s11.addText([
  { text: "✗  Know the basement flooded 3 times\n", options: { breakLine: true } },
  { text: "✗  Know the neighbors fight at 2am\n", options: { breakLine: true } },
  { text: "✗  Know the owner cut renovation corners\n", options: { breakLine: true } },
  { text: "✗  Know a homeless shelter is planned\n", options: { breakLine: true } },
  { text: "✗  Know the REAL reason it's priced low", options: {} },
], {
  x: 7.3, y: 3.8, w: 5.0, h: 2.0,
  fontSize: 14, fontFace: FONT.body, color: C.amber, bold: true,
});

// 5-Year AI Evolution Path Timeline
s11.addText("THE AGENTIC AI PATH", {
  x: 0.8, y: 6.15, w: 3.0, h: 0.3,
  fontSize: 9, fontFace: FONT.body, color: C.amber, bold: true, charSpacing: 3, margin: 0,
});
// Timeline bar
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 6.55, w: 11.5, h: 0.06,
  fill: { color: "333333" },
});
// Amber progress fill (showing we're at the start)
s11.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 6.55, w: 2.8, h: 0.06,
  fill: { color: C.amber },
});

const aiPath = [
  { label: "YEAR 1–2", title: "Build Data Moat", emoji: "🧱", x: 0.8 },
  { label: "YEAR 2–3", title: "Become the API", emoji: "🔌", x: 3.7 },
  { label: "YEAR 3–4", title: "Launch AI Agent", emoji: "🤖", x: 6.6 },
  { label: "YEAR 4–5", title: "Platform Layer", emoji: "🌐", x: 9.5 },
];
aiPath.forEach((step, i) => {
  // Timeline node
  s11.addShape(pres.shapes.OVAL, {
    x: step.x + 1.1, y: 6.45, w: 0.22, h: 0.22,
    fill: { color: i === 0 ? C.amber : "555555" },
    line: { color: C.amber, width: 1 },
  });
  // Label above
  s11.addText(step.emoji + " " + step.title, {
    x: step.x, y: 6.72, w: 2.6, h: 0.3,
    fontSize: 10, fontFace: FONT.body, color: i === 0 ? C.amber : C.textMuted, bold: true, align: "center", margin: 0,
  });
  s11.addText(step.label, {
    x: step.x, y: 6.97, w: 2.6, h: 0.2,
    fontSize: 8, fontFace: FONT.body, color: C.textMuted, align: "center", margin: 0,
  });
});

// ── SLIDE 12: OPPENHEIM PARTNERSHIP ──
let s12 = pres.addSlide();
s12.background = { color: C.bg };
s12.addText("FOR THE OPPENHEIM GROUP", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s12.addText("We're not anti-agent. We're pro-transparency.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 32, fontFace: FONT.head, color: C.text, bold: true,
});
s12.addText("The best agents thrive when buyers trust the process. gwak gwak makes your listings MORE credible by showing the community validates them.", {
  x: 0.8, y: 1.8, w: 11.5, h: 0.7,
  fontSize: 16, fontFace: FONT.body, color: C.textMuted,
});

const partnerBenefits = [
  { title: "Community Verified Badges", desc: "Oppenheim listings get 'Verified by Neighbors' seals — the ultimate trust signal for luxury buyers." },
  { title: "Gen Z Pipeline", desc: "41% of Gen Z research real estate on social. gwak gwak delivers the next generation of buyers to your agents." },
  { title: "Co-Branded Reports", desc: "AI-powered neighborhood reports with Oppenheim branding. Premium market intelligence for your clients." },
  { title: "Revenue Share", desc: "Premium agent profiles, featured listings, and data partnerships. A new revenue stream built on community trust." },
];
partnerBenefits.forEach((b, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 6.0;
  const y = 2.8 + row * 2.0;
  s12.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 5.7, h: 1.7,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  s12.addText(b.title, {
    x: x + 0.4, y: y + 0.2, w: 4.9, h: 0.4,
    fontSize: 18, fontFace: FONT.head, color: C.amber, bold: true, margin: 0,
  });
  s12.addText(b.desc, {
    x: x + 0.4, y: y + 0.7, w: 4.9, h: 0.8,
    fontSize: 13, fontFace: FONT.body, color: C.textMuted,
  });
});

// ═══════════════════════════════════════════════════════
// ACT 3: THE MARKET (Slides 13–16)
// ═══════════════════════════════════════════════════════

// ── SLIDE 13: TARGET AUDIENCE ──
let s13 = pres.addSlide();
s13.background = { color: C.bg };
s13.addText("WHO USES THIS", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s13.addText("Three audiences. One community.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});

const personas = [
  {
    emoji: "🏠", title: "The Millennial First-Timer",
    stat: "38", statLabel: "median first-time buyer age (all-time high)",
    desc: "Buying alone at 34. No family in the city. No neighborhood intel. Making the biggest purchase of their life with Zillow and a prayer."
  },
  {
    emoji: "👀", title: "The Gen Z Observer",
    stat: "26%", statLabel: "of Gen Z own homes. 84% delaying milestones.",
    desc: "Priced out but paying attention. Watching neighborhoods change. Building opinions. Ready to engage. 30% of buyers by 2030."
  },
  {
    emoji: "🏡", title: "The Long-Time Resident",
    stat: "22yr", statLabel: "average long-time resident tenure",
    desc: "Been on the block for decades. Has opinions about every listing within 6 blocks. Finally has somewhere to put them."
  },
];
personas.forEach((p, i) => {
  const x = 0.8 + i * 4.0;
  s13.addShape(pres.shapes.RECTANGLE, {
    x, y: 2.2, w: 3.6, h: 4.3,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  s13.addText(p.emoji, {
    x, y: 2.3, w: 3.6, h: 0.6,
    fontSize: 32, align: "center",
  });
  s13.addText(p.title, {
    x: x + 0.3, y: 2.9, w: 3.0, h: 0.5,
    fontSize: 16, fontFace: FONT.head, color: C.amber, bold: true, align: "center", margin: 0,
  });
  // Big stat
  s13.addText(p.stat, {
    x: x + 0.3, y: 3.4, w: 3.0, h: 0.7,
    fontSize: 36, fontFace: FONT.head, color: C.text, bold: true, align: "center", margin: 0,
  });
  s13.addText(p.statLabel, {
    x: x + 0.3, y: 4.0, w: 3.0, h: 0.4,
    fontSize: 10, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
  s13.addText(p.desc, {
    x: x + 0.3, y: 4.5, w: 3.0, h: 1.8,
    fontSize: 12, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
});

s13.addText("41% of Gen Z already use social media for real estate research.", {
  x: 0.8, y: 6.7, w: 11.5, h: 0.4,
  fontSize: 15, fontFace: FONT.body, color: C.amber, align: "center", bold: true,
});

// ── SLIDE 14: COMPETITIVE LANDSCAPE ──
let s14 = pres.addSlide();
s14.background = { color: C.bg };
s14.addText("COMPETITIVE LANDSCAPE", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s14.addText("The problem with everything else.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});

const competitors = [
  { name: "Zillow", tag: "ALGORITHM", issue: "No human voice. Removed climate data under agent pressure.", color: "444444" },
  { name: "Redfin", tag: "AGENTS", issue: "Paid to sell. Incentive misalignment. No community layer.", color: "444444" },
  { name: "Homes.com", tag: "AI SEARCH", issue: "Launched Feb 2026. Better calculator, no community. Losing money.", color: "444444" },
  { name: "Nextdoor", tag: "DRAMA", issue: "Lost $98M in 2024. Stock down 40%. General gossip, not real estate.", color: "444444" },
  { name: "gwak gwak", tag: "VERIFIED TRUTH", issue: "Real neighbors. Real addresses. Real takes. The only source of truth.", color: C.amber },
];
competitors.forEach((comp, i) => {
  const x = 0.5 + i * 2.5;
  const isGwak = i === 4;
  s14.addShape(pres.shapes.RECTANGLE, {
    x, y: 2.3, w: 2.2, h: 4.0,
    fill: { color: isGwak ? C.amberGlow : C.bgCard },
    shadow: isGwak ? glowShadow() : subtleShadow(),
  });
  if (isGwak) {
    // Amber border
    s14.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.3, w: 2.2, h: 0.06,
      fill: { color: C.amber },
    });
  }
  s14.addText(comp.name, {
    x, y: 2.6, w: 2.2, h: 0.5,
    fontSize: 18, fontFace: FONT.head, color: isGwak ? C.amber : C.text, bold: true, align: "center", margin: 0,
  });
  s14.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.3, y: 3.2, w: 1.6, h: 0.35,
    fill: { color: isGwak ? C.amber : "333333" },
  });
  s14.addText(comp.tag, {
    x: x + 0.3, y: 3.2, w: 1.6, h: 0.35,
    fontSize: 9, fontFace: FONT.body, color: isGwak ? C.bg : C.textMuted, bold: true, align: "center", valign: "middle",
    charSpacing: 2,
  });
  s14.addText(comp.issue, {
    x: x + 0.2, y: 3.8, w: 1.8, h: 2.2,
    fontSize: 11, fontFace: FONT.body, color: isGwak ? C.amber : C.textMuted, align: "center",
  });
});

// ── SLIDE 15: THE DATA MOAT ──
let s15 = pres.addSlide();
s15.background = { color: C.bg };
s15.addText("THE DATA MOAT", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s15.addText("Every verified address is a data point.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 34, fontFace: FONT.head, color: C.text, bold: true,
});

// Flow diagram — larger, more visual with icons
const flowSteps = [
  { label: "Verified\nResidents", emoji: "👥", x: 0.5, color: C.bgCard },
  { label: "Verified Takes\n& Addresses", emoji: "💬", x: 3.2, color: C.bgCard },
  { label: "Sentiment\nDataset", emoji: "📊", x: 5.9, color: C.bgCard },
  { label: "Revenue\nStreams", emoji: "💰", x: 8.6, color: C.amberGlow },
];
flowSteps.forEach((fs, i) => {
  const isLast = i === 3;
  // Large card
  s15.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: fs.x, y: 2.2, w: 2.5, h: 1.8,
    fill: { color: fs.color }, shadow: isLast ? glowShadow() : subtleShadow(),
    rectRadius: 0.1,
  });
  if (isLast) {
    s15.addShape(pres.shapes.RECTANGLE, {
      x: fs.x, y: 2.2, w: 2.5, h: 0.06,
      fill: { color: C.amber },
    });
  }
  // Emoji icon
  s15.addText(fs.emoji, {
    x: fs.x, y: 2.3, w: 2.5, h: 0.6,
    fontSize: 28, align: "center", valign: "middle",
  });
  // Label
  s15.addText(fs.label, {
    x: fs.x, y: 2.95, w: 2.5, h: 0.9,
    fontSize: 14, fontFace: FONT.body, color: isLast ? C.amber : C.text, bold: true,
    align: "center", valign: "middle",
  });
  // Arrow connector
  if (i < 3) {
    // Arrow shaft
    s15.addShape(pres.shapes.RECTANGLE, {
      x: fs.x + 2.5, y: 3.05, w: 0.5, h: 0.04,
      fill: { color: C.amber },
    });
    // Arrowhead
    s15.addText("▶", {
      x: fs.x + 2.8, y: 2.85, w: 0.4, h: 0.45,
      fontSize: 14, color: C.amber, align: "center", valign: "middle",
    });
  }
});

// Data volume annotation
s15.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 11.3, y: 2.5, w: 1.5, h: 1.2,
  fill: { color: C.bgCard }, rectRadius: 0.08,
});
s15.addText("$85K\nper zip", {
  x: 11.3, y: 2.5, w: 1.5, h: 0.7,
  fontSize: 16, fontFace: FONT.head, color: C.amber, bold: true, align: "center", valign: "middle", margin: 0,
});
s15.addText("PropTech comp", {
  x: 11.3, y: 3.15, w: 1.5, h: 0.4,
  fontSize: 8, fontFace: FONT.body, color: C.textMuted, align: "center", margin: 0,
});

// Buyers — 4 cards in a row
s15.addText("WHO PAYS FOR THIS DATA", {
  x: 0.8, y: 4.3, w: 11.5, h: 0.35,
  fontSize: 11, fontFace: FONT.body, color: C.amber, bold: true, charSpacing: 3, margin: 0,
});

const buyers = [
  { name: "Hedge Funds\n& REITs", desc: "Block-level sentiment\nfor investment decisions", emoji: "🏦" },
  { name: "Insurance\nCompanies", desc: "Community-reported\nrisk data by zip", emoji: "🛡️" },
  { name: "City\nPlanners", desc: "Neighborhood sentiment\nfor urban development", emoji: "🏗️" },
  { name: "AI\nCompanies", desc: "Human-generated real\nestate training data", emoji: "🤖" },
];
buyers.forEach((b, i) => {
  const x = 0.5 + i * 3.1;
  s15.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y: 4.8, w: 2.8, h: 1.7,
    fill: { color: C.bgCard }, shadow: subtleShadow(), rectRadius: 0.08,
  });
  s15.addText(b.emoji, {
    x, y: 4.85, w: 2.8, h: 0.45,
    fontSize: 22, align: "center",
  });
  s15.addText(b.name, {
    x: x + 0.2, y: 5.3, w: 2.4, h: 0.5,
    fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true, align: "center", margin: 0,
  });
  s15.addText(b.desc, {
    x: x + 0.2, y: 5.8, w: 2.4, h: 0.55,
    fontSize: 9, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
});

s15.addText([
  { text: "$85K per zip ", options: { color: C.amber, bold: true, fontSize: 20 } },
  { text: "(PropTech comp)   |   Reddit's data deal with Google: ", options: { color: C.textMuted, fontSize: 16 } },
  { text: "$60M/year", options: { color: C.amber, bold: true, fontSize: 20 } },
], {
  x: 0.8, y: 6.3, w: 11.5, h: 0.5,
  fontFace: FONT.body, align: "center",
});

// ── SLIDE 16: MARKET SIZE ──
let s16 = pres.addSlide();
s16.background = { color: C.bg };
s16.addText("MARKET SIZE", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});

// TAM/SAM/SOM as concentric visual
const markets = [
  { label: "TAM", value: "$18.9B", desc: "PropTech + Real Estate Social", w: 6.0, h: 3.0, color: "1A1A1A" },
  { label: "SAM", value: "$2.1B", desc: "Community-Driven Real Estate Platforms", w: 4.0, h: 2.0, color: C.bgCard },
  { label: "SOM", value: "$47M", desc: "Year 3 Addressable", w: 2.0, h: 1.2, color: C.amberGlow },
];
markets.forEach((m) => {
  const x = (13.33 - m.w) / 2;
  const y = 1.5 + (3.0 - m.h) / 2;
  s16.addShape(pres.shapes.RECTANGLE, {
    x, y, w: m.w, h: m.h,
    fill: { color: m.color },
    line: { color: C.amber, width: 1 },
  });
});
// Labels for each
s16.addText("TAM  $18.9B", { x: 4.0, y: 1.6, w: 3.0, h: 0.4, fontSize: 11, fontFace: FONT.body, color: C.textMuted, align: "center", margin: 0 });
s16.addText("SAM  $2.1B", { x: 5.0, y: 2.2, w: 3.0, h: 0.4, fontSize: 13, fontFace: FONT.body, color: C.text, bold: true, align: "center", margin: 0 });
s16.addText("SOM\n$47M", { x: 5.66, y: 2.6, w: 2.0, h: 1.0, fontSize: 18, fontFace: FONT.head, color: C.amber, bold: true, align: "center", valign: "middle" });

// Key stats below
const mktStats = [
  { num: "$88.4B", label: "Global PropTech market\nby 2032 (CAGR 11.9%)" },
  { num: "68%", label: "YoY increase in PropTech\ninvestment (2025)" },
  { num: "$16.7B", label: "Invested in PropTech\nstartups in 2025" },
  { num: "30%", label: "of home buyers will be\nGen Z by 2030" },
];
mktStats.forEach((st, i) => {
  const x = 0.8 + i * 3.1;
  s16.addShape(pres.shapes.RECTANGLE, {
    x, y: 5.0, w: 2.8, h: 1.8,
    fill: { color: C.bgCard }, shadow: subtleShadow(),
  });
  s16.addText(st.num, {
    x, y: 5.1, w: 2.8, h: 0.7,
    fontSize: 28, fontFace: FONT.head, color: C.amber, bold: true, align: "center", margin: 0,
  });
  s16.addText(st.label, {
    x: x + 0.2, y: 5.8, w: 2.4, h: 0.8,
    fontSize: 11, fontFace: FONT.body, color: C.textMuted, align: "center",
  });
});

// ═══════════════════════════════════════════════════════
// ACT 4: THE MONEY (Slides 17–22)
// ═══════════════════════════════════════════════════════

// ── SLIDE 17: REVENUE STREAMS ──
let s17 = pres.addSlide();
s17.background = { color: C.bg };
s17.addText("REVENUE STREAMS", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s17.addText("Six revenue lines. Year 3: $5.52M ARR.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 32, fontFace: FONT.head, color: C.text, bold: true,
});

// Revenue chart
s17.addChart(pres.charts.BAR, [
  { name: "Year 1", labels: ["Premium\nListings", "Agent\nProfiles", "Data\nLicensing", "Neighborhood\nReports", "Sponsored\nContent", "API\nAccess"], values: [120, 80, 60, 50, 50, 30] },
  { name: "Year 3", labels: ["Premium\nListings", "Agent\nProfiles", "Data\nLicensing", "Neighborhood\nReports", "Sponsored\nContent", "API\nAccess"], values: [1400, 900, 1200, 600, 800, 620] },
], {
  x: 0.8, y: 2.2, w: 11.5, h: 4.5,
  barDir: "col",
  chartColors: ["8A8680", "E8A87C"],
  chartArea: { fill: { color: C.bgCard }, roundedCorners: false },
  catAxisLabelColor: C.textMuted,
  catAxisLabelFontSize: 10,
  valAxisLabelColor: C.textMuted,
  valAxisLabelFontSize: 10,
  valGridLine: { color: "333333", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true,
  dataLabelPosition: "outEnd",
  dataLabelColor: C.text,
  dataLabelFontSize: 9,
  showLegend: true,
  legendPos: "b",
  legendColor: C.textMuted,
  legendFontSize: 11,
  valAxisNumFmt: "$#,##0K",
});

// ── SLIDE 18: AI-NATIVE TEAM ──
let s18 = pres.addSlide();
s18.background = { color: C.bg };
s18.addText("AI-NATIVE TEAM", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s18.addText("Every hire does 4x. Not a slogan — an operating model.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 28, fontFace: FONT.head, color: C.text, bold: true,
});

// Headcount comparison
s18.addChart(pres.charts.BAR, [
  { name: "Traditional PropTech", labels: ["Launch", "Month 12", "Month 24"], values: [12, 28, 45] },
  { name: "gwak gwak", labels: ["Launch", "Month 12", "Month 24"], values: [4, 7, 11] },
], {
  x: 0.5, y: 2.0, w: 6.0, h: 3.5,
  barDir: "col",
  chartColors: ["444444", "E8A87C"],
  chartArea: { fill: { color: C.bgCard }, roundedCorners: false },
  catAxisLabelColor: C.textMuted,
  valAxisLabelColor: C.textMuted,
  valGridLine: { color: "333333", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true,
  dataLabelPosition: "outEnd",
  dataLabelColor: C.text,
  dataLabelFontSize: 10,
  showLegend: true,
  legendPos: "b",
  legendColor: C.textMuted,
  showTitle: true,
  title: "Team Size",
  titleColor: C.textMuted,
  titleFontSize: 12,
});

// AI coverage stats
const aiCoverage = [
  { area: "QA", pct: "100%" },
  { area: "Data Pipelines", pct: "100%" },
  { area: "Customer Support", pct: "90%" },
  { area: "Moderation", pct: "95%" },
  { area: "Marketing Content", pct: "80%" },
  { area: "Campaign Analysis", pct: "100%" },
];
s18.addShape(pres.shapes.RECTANGLE, {
  x: 7.0, y: 2.0, w: 5.5, h: 3.5,
  fill: { color: C.bgCard }, shadow: subtleShadow(),
});
s18.addText("AI COVERAGE", {
  x: 7.3, y: 2.1, w: 5.0, h: 0.4,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true, charSpacing: 3, margin: 0,
});
aiCoverage.forEach((ac, i) => {
  const y = 2.6 + i * 0.45;
  s18.addText(ac.area, {
    x: 7.3, y, w: 2.5, h: 0.35,
    fontSize: 12, fontFace: FONT.body, color: C.textMuted, margin: 0,
  });
  // Bar bg
  s18.addShape(pres.shapes.RECTANGLE, {
    x: 9.8, y: y + 0.08, w: 2.0, h: 0.2,
    fill: { color: "333333" },
  });
  // Bar fill
  const pctVal = parseInt(ac.pct) / 100;
  s18.addShape(pres.shapes.RECTANGLE, {
    x: 9.8, y: y + 0.08, w: 2.0 * pctVal, h: 0.2,
    fill: { color: C.amber },
  });
  s18.addText(ac.pct, {
    x: 11.9, y, w: 0.6, h: 0.35,
    fontSize: 11, fontFace: FONT.body, color: C.amber, bold: true, margin: 0,
  });
});

// Cost comparison
s18.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 5.8, w: 5.5, h: 1.0,
  fill: { color: C.bgCard },
});
s18.addText([
  { text: "Traditional: ", options: { color: C.textMuted, fontSize: 14 } },
  { text: "$2M/year ", options: { color: C.text, bold: true, fontSize: 18 } },
  { text: "(45 people)", options: { color: C.textMuted, fontSize: 14 } },
], { x: 1.0, y: 5.85, w: 5.1, h: 0.45, fontFace: FONT.body, margin: 0 });
s18.addText([
  { text: "gwak gwak: ", options: { color: C.amber, fontSize: 14 } },
  { text: "$800K/year ", options: { color: C.amber, bold: true, fontSize: 18 } },
  { text: "(11 people + AI)", options: { color: C.amber, fontSize: 14 } },
], { x: 1.0, y: 6.3, w: 5.1, h: 0.45, fontFace: FONT.body, margin: 0 });

s18.addText("60% cost reduction. Same output.", {
  x: 7.0, y: 5.8, w: 5.5, h: 1.0,
  fontSize: 20, fontFace: FONT.head, color: C.amber, bold: true, align: "center", valign: "middle",
});

// ── SLIDE 19: THE ASK — AI-NATIVE ECONOMICS ──
let s19 = pres.addSlide();
s19.background = { color: C.bg };
s19.addText("THE ASK", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});

// Big number
s19.addText("$1.5M", {
  x: 0.8, y: 0.8, w: 5.0, h: 1.3,
  fontSize: 64, fontFace: FONT.head, color: C.amber, bold: true, margin: 0,
});
s19.addText("SAFE note  |  $10M post-money cap  |  AI-native economics", {
  x: 0.8, y: 2.0, w: 6.0, h: 0.4,
  fontSize: 14, fontFace: FONT.body, color: C.textMuted, margin: 0,
});
s19.addText("This is not a 2015 startup that burns $10M to find product-market fit. AI lets us do in 18 months what used to take 5 years and 45 people.", {
  x: 0.8, y: 2.5, w: 5.5, h: 0.8,
  fontSize: 12, fontFace: FONT.body, color: C.text, italic: true,
});

// Use of funds — right side, with purpose explained
s19.addShape(pres.shapes.RECTANGLE, {
  x: 7.0, y: 0.8, w: 5.5, h: 5.5,
  fill: { color: C.bgCard }, shadow: subtleShadow(),
});
s19.addText("WHERE EVERY DOLLAR GOES", {
  x: 7.3, y: 0.9, w: 5.0, h: 0.4,
  fontSize: 11, fontFace: FONT.body, color: C.amber, bold: true, charSpacing: 3, margin: 0,
});

const fundBreakdown = [
  { pct: "40%", amt: "$600K", area: "Product & AI", why: "3 engineers + AI. Build community platform, AI imagination layer, data pipeline. AI handles QA, testing, deploys." },
  { pct: "25%", amt: "$375K", area: "Growth & Community", why: "Launch LA, SF, NYC. Seed communities with verified locals. Zero paid ads — community IS the growth engine." },
  { pct: "20%", amt: "$300K", area: "Operations & Data", why: "Cloud infrastructure, data licensing partnerships, legal. AI handles 90% of support + moderation." },
  { pct: "15%", amt: "$225K", area: "Reserve → Profit Bridge", why: "18 months to cash-flow positive. Not 'runway' — a bridge to early profit from data licensing + premium listings." },
];
fundBreakdown.forEach((f, i) => {
  const y = 1.5 + i * 1.15;
  // Pct badge
  s19.addShape(pres.shapes.RECTANGLE, {
    x: 7.3, y: y, w: 0.7, h: 0.35,
    fill: { color: C.amber },
  });
  s19.addText(f.pct, {
    x: 7.3, y: y, w: 0.7, h: 0.35,
    fontSize: 11, fontFace: FONT.body, color: C.bg, bold: true, align: "center", valign: "middle",
  });
  s19.addText(f.amt + "  " + f.area, {
    x: 8.1, y: y - 0.05, w: 4.2, h: 0.35,
    fontSize: 13, fontFace: FONT.body, color: C.text, bold: true, margin: 0,
  });
  s19.addText(f.why, {
    x: 8.1, y: y + 0.3, w: 4.2, h: 0.7,
    fontSize: 10, fontFace: FONT.body, color: C.textMuted,
  });
});

// Path to profit — visual ascending chart
s19.addText("PATH TO PROFIT", {
  x: 0.8, y: 3.3, w: 5.5, h: 0.35,
  fontSize: 11, fontFace: FONT.body, color: C.amber, bold: true, charSpacing: 3, margin: 0,
});

// Chart background
s19.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.8, y: 3.7, w: 5.7, h: 3.2,
  fill: { color: C.bgCard }, shadow: subtleShadow(), rectRadius: 0.08,
});

// Horizontal baseline (zero revenue line)
s19.addShape(pres.shapes.RECTANGLE, {
  x: 1.1, y: 5.7, w: 5.1, h: 0.015,
  fill: { color: "444444" },
});

// Revenue bars — ascending heights to show growth
const profitTimeline = [
  { month: "M0-6", revenue: "$0", label: "Build +\nLaunch LA", barH: 0.0, barColor: "333333", textColor: C.textMuted },
  { month: "M6-9", revenue: "$8K", label: "Early\nRevenue", barH: 0.3, barColor: C.amberDark, textColor: C.textMuted },
  { month: "M9-12", revenue: "$15K", label: "SF + NYC\n10K users", barH: 0.6, barColor: C.amberDark, textColor: C.text },
  { month: "M12-18", revenue: "$45K", label: "Data\nLicensing", barH: 1.2, barColor: C.green, textColor: C.green },
  { month: "M18+", revenue: "$80K+", label: "Profitable\nGrowth", barH: 1.7, barColor: C.green, textColor: C.green },
];
profitTimeline.forEach((t, i) => {
  const x = 1.3 + i * 1.0;
  // Revenue bar
  if (t.barH > 0) {
    s19.addShape(pres.shapes.RECTANGLE, {
      x, y: 5.7 - t.barH, w: 0.7, h: t.barH,
      fill: { color: t.barColor },
    });
  } else {
    // Dotted placeholder for $0
    s19.addShape(pres.shapes.RECTANGLE, {
      x, y: 5.6, w: 0.7, h: 0.1,
      fill: { color: "333333" },
    });
  }
  // Revenue label above bar
  s19.addText(t.revenue, {
    x: x - 0.15, y: 5.7 - t.barH - 0.3, w: 1.0, h: 0.25,
    fontSize: 10, fontFace: FONT.body, color: t.textColor, bold: true, align: "center", margin: 0,
  });
  // Month label below
  s19.addText(t.month, {
    x: x - 0.1, y: 5.75, w: 0.9, h: 0.25,
    fontSize: 8, fontFace: FONT.body, color: C.textMuted, align: "center", margin: 0,
  });
  // Milestone label below month
  s19.addText(t.label, {
    x: x - 0.2, y: 5.98, w: 1.1, h: 0.5,
    fontSize: 7, fontFace: FONT.body, color: C.textMuted, align: "center", margin: 0,
  });
});

// Cash-flow positive marker line at Month 18
s19.addShape(pres.shapes.RECTANGLE, {
  x: 4.2, y: 3.9, w: 0.015, h: 1.8,
  fill: { color: C.green },
});
s19.addText("💰 CASH-FLOW\n    POSITIVE", {
  x: 4.3, y: 3.85, w: 1.3, h: 0.4,
  fontSize: 8, fontFace: FONT.body, color: C.green, bold: true, margin: 0,
});

// MRR label
s19.addText("MRR", {
  x: 0.85, y: 3.8, w: 0.5, h: 0.3,
  fontSize: 8, fontFace: FONT.body, color: C.textMuted, margin: 0,
});

s19.addText("Cash-flow positive by Month 18. Not 'break-even someday' — profitable by design.", {
  x: 0.8, y: 6.95, w: 11.5, h: 0.35,
  fontSize: 13, fontFace: FONT.body, color: C.text, align: "center", italic: true,
});

// ── SLIDE 20: OPPENHEIM PARTNERSHIP PROPOSAL ──
let s20 = pres.addSlide();
s20.background = { color: C.bg };
s20.addText("THE PARTNERSHIP", {
  x: 0.8, y: 0.4, w: 8, h: 0.5,
  fontSize: 12, fontFace: FONT.body, color: C.amber, bold: true,
  charSpacing: 4,
});
s20.addText("Your brand + our community = the future of luxury real estate.", {
  x: 0.8, y: 1.0, w: 11.5, h: 0.8,
  fontSize: 28, fontFace: FONT.head, color: C.text, bold: true,
});

s20.addText("The Oppenheim Group doesn't hide from transparency — you lead it.", {
  x: 0.8, y: 1.8, w: 11.5, h: 0.5,
  fontSize: 16, fontFace: FONT.body, color: C.amber, italic: true,
});

const proposals = [
  { title: "Investment", desc: "Participate in the $1.5M SAFE round. Early-mover advantage in the community real estate space before it becomes obvious to everyone." },
  { title: "Distribution", desc: "Promote gwak gwak through your agent network and social channels. 8M+ Instagram followers see the future of real estate through your brand." },
  { title: "Community Verified Seal", desc: "Oppenheim listings get 'Community Verified' badges. When neighbors validate your listings, trust converts to sales." },
  { title: "Co-Branded Intelligence", desc: "AI-powered neighborhood reports with Oppenheim branding. Premium market intelligence your competitors can't offer." },
  { title: "Agent Featured Profiles", desc: "Your agents are 'trusted voices' in their zip codes. Revenue share on premium agent profiles and featured placements." },
  { title: "Gen Z Pipeline", desc: "gwak gwak is where the next generation of luxury buyers already lives. We deliver the audience. You deliver the properties." },
];
proposals.forEach((p, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 6.0;
  const y = 2.6 + row * 1.5;
  s20.addShape(pres.shapes.OVAL, {
    x, y: y + 0.15, w: 0.15, h: 0.15,
    fill: { color: C.amber },
  });
  s20.addText(p.title, {
    x: x + 0.3, y, w: 5.4, h: 0.35,
    fontSize: 16, fontFace: FONT.head, color: C.amber, bold: true, margin: 0,
  });
  s20.addText(p.desc, {
    x: x + 0.3, y: y + 0.4, w: 5.4, h: 0.9,
    fontSize: 12, fontFace: FONT.body, color: C.textMuted,
  });
});

// ── SLIDE 21: CLOSING ──
let s21 = pres.addSlide();
s21.background = { color: C.bg };
// Amber line top
s21.addShape(pres.shapes.RECTANGLE, {
  x: 5.5, y: 1.5, w: 2.33, h: 0.04,
  fill: { color: C.amber },
});
s21.addText([
  { text: "Every neighborhood has a truth.\n\n", options: { fontSize: 28, fontFace: FONT.head, color: C.text, breakLine: true } },
  { text: "We're building the infrastructure\nto surface it.\n\n", options: { fontSize: 28, fontFace: FONT.head, color: C.text, breakLine: true } },
  { text: "This is not a listing site.\n", options: { fontSize: 28, fontFace: FONT.head, color: C.textMuted, breakLine: true } },
  { text: "This is where your community lives.\n\n", options: { fontSize: 28, fontFace: FONT.head, color: C.amber, bold: true, breakLine: true } },
  { text: "Either you get in — or you missed the next way\npeople do real estate.", options: { fontSize: 22, fontFace: FONT.head, color: C.textMuted, italic: true } },
], {
  x: 1.0, y: 1.8, w: 11.33, h: 4.5,
  align: "center", valign: "middle",
});
// Amber line bottom
s21.addShape(pres.shapes.RECTANGLE, {
  x: 5.5, y: 6.0, w: 2.33, h: 0.04,
  fill: { color: C.amber },
});

// ── SLIDE 22: CONTACT ──
let s22 = pres.addSlide();
s22.background = { color: C.bg };
s22.addText("gwak gwak", {
  x: 0.5, y: 1.5, w: 12.33, h: 1.2,
  fontSize: 56, fontFace: FONT.head, color: C.amber, bold: true,
  align: "center", charSpacing: 3,
});
s22.addText("your favorite local real estate.", {
  x: 0.5, y: 2.8, w: 12.33, h: 0.5,
  fontSize: 18, fontFace: FONT.body, color: C.textMuted, italic: true, align: "center",
});
// Divider
s22.addShape(pres.shapes.RECTANGLE, {
  x: 5.5, y: 3.6, w: 2.33, h: 0.03,
  fill: { color: "333333" },
});
s22.addText([
  { text: "Zachary Kaufman\n", options: { fontSize: 22, fontFace: FONT.head, color: C.text, bold: true, breakLine: true } },
  { text: "Founder & CEO\n\n", options: { fontSize: 14, fontFace: FONT.body, color: C.textMuted, breakLine: true } },
  { text: "hello@gwakgwak.com\n", options: { fontSize: 16, fontFace: FONT.body, color: C.amber, breakLine: true } },
  { text: "gwakgwak.com", options: { fontSize: 16, fontFace: FONT.body, color: C.amber } },
], {
  x: 0.5, y: 4.0, w: 12.33, h: 2.5,
  align: "center",
});
s22.addText("Confidential  |  March 2026", {
  x: 0.5, y: 6.8, w: 12.33, h: 0.3,
  fontSize: 10, fontFace: FONT.body, color: C.textMuted, align: "center",
});

// ═══════════════════════════════════════════════════════
// WRITE FILE
// ═══════════════════════════════════════════════════════

pres.writeFile({ fileName: "/Users/zacharykaufman/Desktop/Pitch Decks/gwak gwak - Oppenheim Group Pitch.pptx" })
  .then(() => console.log("✅ Deck created: gwak gwak - Oppenheim Group Pitch.pptx"))
  .catch(err => console.error("❌ Error:", err));

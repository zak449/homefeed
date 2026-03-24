const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pres.author = "Zachary Kaufman";
pres.title = "Gwaky — Oppenheim Group Investment Pitch";

// ─── DESIGN SYSTEM ───
const C = {
  bg: "0A0A0A",
  card: "141414",
  card2: "1A1A1A",
  card3: "111111",
  text: "F2F0ED",
  muted: "8A8680",
  amber: "E8A87C",
  amberDark: "C4855C",
  white: "FFFFFF",
  green: "4ADE80",
  red: "FF6B6B",
  gray: "555555",
};

const F = { head: "Georgia", body: "Calibri", mono: "Consolas" };
const shadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.3 });

// ─── HELPERS ───
function addSlideNum(slide, num) {
  slide.addText(String(num).padStart(2, "0"), {
    x: 12.3, y: 6.9, w: 0.8, h: 0.4,
    fontSize: 9, fontFace: F.mono, color: C.muted, align: "right",
  });
}

function cardRect(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: color || C.card },
    shadow: shadow(),
  });
}

function amberLine(slide, x, y, w) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.035, fill: { color: C.amber },
  });
}

function sectionLabel(slide, text) {
  slide.addText(text.toUpperCase(), {
    x: 0.8, y: 0.5, w: 5, h: 0.35,
    fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 3,
  });
}

// ═══════════════════════════════════════════════════════
// SLIDE 1: COVER
// ═══════════════════════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: C.bg };

s1.addText("Gwaky", {
  x: 0.5, y: 1.6, w: 12.33, h: 2,
  fontSize: 78, fontFace: F.head, color: C.amber,
  bold: true, align: "center", valign: "middle", charSpacing: 5,
});
s1.addText("the truth your neighborhood already knows", {
  x: 0.5, y: 3.6, w: 12.33, h: 0.7,
  fontSize: 21, fontFace: F.body, color: C.muted, italic: true, align: "center",
});
amberLine(s1, 5.5, 4.6, 2.33);
s1.addText("Investment & Strategic Partnership  ·  March 2026  ·  Confidential", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.4,
  fontSize: 11, fontFace: F.body, color: C.muted, align: "center",
});
addSlideNum(s1, 1);

// ═══════════════════════════════════════════════════════
// SLIDE 2: THE PAIN (micro-story)
// ═══════════════════════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: C.bg };
sectionLabel(s2, "The Pain");

// Left amber accent bar
s2.addShape(pres.shapes.RECTANGLE, {
  x: 0.8, y: 1.2, w: 0.05, h: 4.3, fill: { color: C.amber },
});

s2.addText([
  { text: "I bought my place.\n\n", options: { fontSize: 26, color: C.text, fontFace: F.head, italic: true } },
  { text: "My neighbors told me things my realtor never mentioned. Un-permitted additions. Flooding. Years of disputes.\n\n", options: { fontSize: 26, color: C.text, fontFace: F.head, italic: true } },
  { text: "If Gwaky existed, I would have had second thoughts.", options: { fontSize: 26, color: C.amber, fontFace: F.head, italic: true, bold: true } },
], {
  x: 1.3, y: 1.0, w: 10.5, h: 4.8, valign: "middle", paraSpaceAfter: 6,
});

s2.addText("— Zachary Kaufman, Founder", {
  x: 1.3, y: 5.8, w: 10, h: 0.4,
  fontSize: 14, fontFace: F.body, color: C.muted, italic: true,
});
addSlideNum(s2, 2);

// ═══════════════════════════════════════════════════════
// SLIDE 3: THE WORLD IS BROKEN
// ═══════════════════════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: C.bg };
sectionLabel(s3, "The World Is Broken");

// Left card
cardRect(s3, 0.8, 1.3, 5.6, 3.8, C.card);
s3.addText("$1.4M decisions\nmade alone at midnight", {
  x: 1.2, y: 1.6, w: 4.8, h: 1.4,
  fontSize: 28, fontFace: F.head, color: C.amber, bold: true, valign: "top",
});
s3.addText("Someone scrolling Zillow at 11:47 PM.\nNo context. No community. No truth.", {
  x: 1.2, y: 3.1, w: 4.8, h: 1.2,
  fontSize: 15, fontFace: F.body, color: C.muted, valign: "top", lineSpacingMultiple: 1.3,
});

// Right card
cardRect(s3, 6.9, 1.3, 5.6, 3.8, C.card);
s3.addText("Your neighbor 3 blocks\naway has the answer", {
  x: 7.3, y: 1.6, w: 4.8, h: 1.4,
  fontSize: 28, fontFace: F.head, color: C.amber, bold: true, valign: "top",
});
s3.addText("They know the flooding. The construction.\nThe real story. They've never met you.", {
  x: 7.3, y: 3.1, w: 4.8, h: 1.2,
  fontSize: 15, fontFace: F.body, color: C.muted, valign: "top", lineSpacingMultiple: 1.3,
});

// Stats row
cardRect(s3, 0.8, 5.5, 3.7, 1.2, C.card2);
s3.addText([
  { text: "85%", options: { fontSize: 32, color: C.amber, fontFace: F.head, bold: true } },
  { text: "\nsay neighborhood > house", options: { fontSize: 12, color: C.muted, fontFace: F.body } },
], { x: 0.8, y: 5.5, w: 3.7, h: 1.2, align: "center", valign: "middle" });

cardRect(s3, 4.8, 5.5, 3.7, 1.2, C.card2);
s3.addText([
  { text: "0", options: { fontSize: 32, color: C.red, fontFace: F.head, bold: true } },
  { text: "\nplatforms connect them", options: { fontSize: 12, color: C.muted, fontFace: F.body } },
], { x: 4.8, y: 5.5, w: 3.7, h: 1.2, align: "center", valign: "middle" });

cardRect(s3, 8.8, 5.5, 3.7, 1.2, C.card2);
s3.addText([
  { text: "11:47 PM", options: { fontSize: 32, color: C.amber, fontFace: F.head, bold: true } },
  { text: "\npeak Zillow browsing hour", options: { fontSize: 12, color: C.muted, fontFace: F.body } },
], { x: 8.8, y: 5.5, w: 3.7, h: 1.2, align: "center", valign: "middle" });

addSlideNum(s3, 3);

// ═══════════════════════════════════════════════════════
// SLIDE 4: THIS IS Gwaky (Product Demo)
// ═══════════════════════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: C.bg };
sectionLabel(s4, "This Is Gwaky");

// Phone frame (center)
cardRect(s4, 4.6, 1.0, 4.1, 6.0, C.card3);
// Phone notch
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 5.8, y: 1.0, w: 1.7, h: 0.25, rectRadius: 0.1,
  fill: { color: C.bg },
});

// Feed item 1 - Warning
cardRect(s4, 4.9, 1.5, 3.5, 1.3, C.card2);
s4.addText("⚠", { x: 5.0, y: 1.55, w: 0.4, h: 0.4, fontSize: 16 });
s4.addText([
  { text: "742 Elm St", options: { fontSize: 11, color: C.amber, fontFace: F.body, bold: true } },
  { text: "  ✓ Verified Local", options: { fontSize: 8, color: C.green, fontFace: F.mono } },
], { x: 5.4, y: 1.55, w: 2.8, h: 0.3 });
s4.addText("Basement floods every spring. Previous owner hid it with fresh paint. Ask about the sump pump.", {
  x: 5.0, y: 1.95, w: 3.2, h: 0.7,
  fontSize: 10, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.2,
});

// Feed item 2 - Endorsement
cardRect(s4, 4.9, 3.0, 3.5, 1.3, C.card2);
s4.addText("★", { x: 5.0, y: 3.05, w: 0.4, h: 0.4, fontSize: 16, color: C.amber });
s4.addText([
  { text: "1200 Oak Ave", options: { fontSize: 11, color: C.amber, fontFace: F.body, bold: true } },
  { text: "  ✓ Verified Local", options: { fontSize: 8, color: C.green, fontFace: F.mono } },
], { x: 5.4, y: 3.05, w: 2.8, h: 0.3 });
s4.addText("Best block in the neighborhood. Kids play outside, everyone knows each other. We've been here 11 years.", {
  x: 5.0, y: 3.45, w: 3.2, h: 0.7,
  fontSize: 10, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.2,
});

// Feed item 3 - Insider info
cardRect(s4, 4.9, 4.5, 3.5, 1.3, C.card2);
s4.addText("💡", { x: 5.0, y: 4.55, w: 0.4, h: 0.4, fontSize: 16 });
s4.addText([
  { text: "890 Pine Dr", options: { fontSize: 11, color: C.amber, fontFace: F.body, bold: true } },
  { text: "  ✓ Verified Local", options: { fontSize: 8, color: C.green, fontFace: F.mono } },
], { x: 5.4, y: 4.55, w: 2.8, h: 0.3 });
s4.addText("Divorce sale — they'll take under ask. House is solid though. New roof 2024. Great neighbors on both sides.", {
  x: 5.0, y: 4.95, w: 3.2, h: 0.7,
  fontSize: 10, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.2,
});

// Tagline below phone
s4.addText("the comment section real estate never had", {
  x: 0.5, y: 6.8, w: 12.33, h: 0.4,
  fontSize: 16, fontFace: F.head, color: C.amber, italic: true, align: "center",
});

// Left callouts
s4.addText("warnings", {
  x: 1.0, y: 1.7, w: 3, h: 0.4,
  fontSize: 18, fontFace: F.head, color: C.red, align: "right",
});
s4.addText("what your realtor\nwon't mention", {
  x: 1.0, y: 2.1, w: 3, h: 0.6,
  fontSize: 11, fontFace: F.body, color: C.muted, align: "right", lineSpacingMultiple: 1.2,
});

s4.addText("endorsements", {
  x: 1.0, y: 3.2, w: 3, h: 0.4,
  fontSize: 18, fontFace: F.head, color: C.green, align: "right",
});
s4.addText("verified locals vouching\nfor their block", {
  x: 1.0, y: 3.6, w: 3, h: 0.6,
  fontSize: 11, fontFace: F.body, color: C.muted, align: "right", lineSpacingMultiple: 1.2,
});

s4.addText("insider intel", {
  x: 1.0, y: 4.7, w: 3, h: 0.4,
  fontSize: 18, fontFace: F.head, color: C.amber, align: "right",
});
s4.addText("context only locals\nwould know", {
  x: 1.0, y: 5.1, w: 3, h: 0.6,
  fontSize: 11, fontFace: F.body, color: C.muted, align: "right", lineSpacingMultiple: 1.2,
});

addSlideNum(s4, 4);

// ═══════════════════════════════════════════════════════
// SLIDE 5: HOW IT WORKS
// ═══════════════════════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: C.bg };
sectionLabel(s5, "How It Works");

const steps = [
  { num: "01", title: "Browse", desc: "Search any address.\nSee what neighbors are saying.\nNo account required.", icon: "🔍" },
  { num: "02", title: "Verify", desc: "Enter your zip code.\nYour location is your credential.\nOnly locals speak on their area.", icon: "✓" },
  { num: "03", title: "Gwak", desc: "Drop your take.\nWarn buyers. Endorse your block.\nShare what only you know.", icon: "💬" },
];

steps.forEach((step, i) => {
  const x = 0.8 + i * 4.1;
  cardRect(s5, x, 1.4, 3.7, 4.5, C.card);

  s5.addText(step.icon, {
    x: x + 0.3, y: 1.7, w: 0.6, h: 0.6, fontSize: 28,
  });

  s5.addText(step.num, {
    x: x + 0.3, y: 2.5, w: 1, h: 0.4,
    fontSize: 12, fontFace: F.mono, color: C.muted,
  });

  s5.addText(step.title, {
    x: x + 0.3, y: 2.9, w: 3.1, h: 0.6,
    fontSize: 30, fontFace: F.head, color: C.amber, bold: true,
  });

  s5.addText(step.desc, {
    x: x + 0.3, y: 3.6, w: 3.1, h: 1.8,
    fontSize: 14, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.4,
  });
});

// Arrow connectors
s5.addText("→", { x: 4.3, y: 3.0, w: 0.8, h: 0.6, fontSize: 28, color: C.amber, fontFace: F.body, align: "center" });
s5.addText("→", { x: 8.4, y: 3.0, w: 0.8, h: 0.6, fontSize: 28, color: C.amber, fontFace: F.body, align: "center" });

s5.addText("Anyone can browse. Only verified locals can speak.", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.5,
  fontSize: 16, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s5, 5);

// ═══════════════════════════════════════════════════════
// SLIDE 6: WHY NOW
// ═══════════════════════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: C.bg };
sectionLabel(s6, "Why Now");

const whyNow = [
  { event: "Curbed killed by Vox (2026)", detail: "The last honest voice in neighborhoods — gone.", color: C.red },
  { event: "Nextdoor lost $98M", detail: "General neighborhood drama. Not real estate.", color: C.red },
  { event: "Zillow removed climate data", detail: "Chose agent relationships over buyer transparency.", color: C.red },
  { event: "NAR settlement", detail: "Commission structure disrupted. Openness to new models.", color: C.amber },
];

whyNow.forEach((item, i) => {
  const y = 1.3 + i * 1.3;
  cardRect(s6, 0.8, y, 11.7, 1.1, C.card);

  s6.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y, w: 0.06, h: 1.1, fill: { color: item.color },
  });

  s6.addText(item.event, {
    x: 1.2, y, w: 5, h: 1.1,
    fontSize: 18, fontFace: F.head, color: C.text, bold: true, valign: "middle",
  });
  s6.addText(item.detail, {
    x: 6.5, y, w: 5.5, h: 1.1,
    fontSize: 14, fontFace: F.body, color: C.muted, valign: "middle",
  });
});

s6.addText("Gwaky is the heir. Community-powered, not journalist-powered.", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.5,
  fontSize: 17, fontFace: F.head, color: C.amber, italic: true, align: "center",
});
addSlideNum(s6, 6);

// ═══════════════════════════════════════════════════════
// SLIDE 7: THE AI MOAT
// ═══════════════════════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: C.bg };
sectionLabel(s7, "The AI Moat");

s7.addText("AI replaces your realtor.\nAI cannot replace your neighbor.", {
  x: 0.8, y: 1.0, w: 11.7, h: 1.2,
  fontSize: 30, fontFace: F.head, color: C.text, bold: true,
});

// Left column: What AI does
cardRect(s7, 0.8, 2.5, 5.6, 2.8, C.card);
s7.addText("WHAT AI DOES", {
  x: 1.2, y: 2.6, w: 5, h: 0.4,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});
const aiDoes = ["Automated valuations", "Virtual tours", "Document processing", "Market predictions", "Listing generation"];
aiDoes.forEach((item, i) => {
  s7.addText("→  " + item, {
    x: 1.2, y: 3.1 + i * 0.4, w: 4.8, h: 0.35,
    fontSize: 14, fontFace: F.body, color: C.gray,
  });
});

// Right column: What AI can't
cardRect(s7, 6.9, 2.5, 5.6, 2.8, C.card);
s7.addText("WHAT AI CAN'T", {
  x: 7.3, y: 2.6, w: 5, h: 0.4,
  fontSize: 10, fontFace: F.mono, color: C.amber, charSpacing: 2,
});
const aiCant = ["Basement floods every spring", "Neighbor disputes since 2019", "Contractor cut corners on deck", "Real reason they're selling", "Best block for families"];
aiCant.forEach((item, i) => {
  s7.addText("→  " + item, {
    x: 7.3, y: 3.1 + i * 0.4, w: 4.8, h: 0.35,
    fontSize: 14, fontFace: F.body, color: C.amber, bold: true,
  });
});

// Timeline
amberLine(s7, 0.8, 5.7, 11.7);
const timeline = [
  { yr: "Year 1-2", label: "Build Data", desc: "Neighborhood intelligence" },
  { yr: "Year 2-3", label: "Become API", desc: "License to platforms" },
  { yr: "Year 3-4", label: "Launch Agent", desc: "AI + local truth" },
  { yr: "Year 4-5", label: "Platform Layer", desc: "Infrastructure play" },
];
timeline.forEach((t, i) => {
  const x = 0.8 + i * 3.05;
  // Dot on timeline
  s7.addShape(pres.shapes.OVAL, {
    x: x + 1.2, y: 5.6, w: 0.18, h: 0.18, fill: { color: C.amber },
  });
  s7.addText(t.yr, {
    x, y: 5.9, w: 2.9, h: 0.3,
    fontSize: 9, fontFace: F.mono, color: C.muted, align: "center",
  });
  s7.addText(t.label, {
    x, y: 6.15, w: 2.9, h: 0.35,
    fontSize: 14, fontFace: F.body, color: C.text, bold: true, align: "center",
  });
  s7.addText(t.desc, {
    x, y: 6.45, w: 2.9, h: 0.3,
    fontSize: 10, fontFace: F.body, color: C.muted, align: "center",
  });
});

s7.addText("We don't compete with AI. We feed it.", {
  x: 0.5, y: 6.85, w: 12.33, h: 0.4,
  fontSize: 14, fontFace: F.head, color: C.amber, italic: true, align: "center",
});
addSlideNum(s7, 7);

// ═══════════════════════════════════════════════════════
// SLIDE 8: MARKET + BUSINESS
// ═══════════════════════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: C.bg };
sectionLabel(s8, "Market & Business");

// TAM/SAM/SOM circles
const tamData = [
  { label: "TAM", value: "$18.9B", desc: "US Real Estate Tech", size: 2.8, x: 2.5, color: C.card2 },
  { label: "SAM", value: "$2.1B", desc: "Community RE Platforms", size: 2.0, x: 5.5, color: C.card },
  { label: "SOM", value: "$47M", desc: "Year 3 Addressable", size: 1.4, x: 8.0, color: C.amber },
];

tamData.forEach((t) => {
  s8.addShape(pres.shapes.OVAL, {
    x: t.x - t.size / 2 + 1, y: 2.2 - t.size / 2 + 1.2, w: t.size, h: t.size,
    fill: { color: t.color }, line: { color: C.amber, width: 1.5 },
  });
  s8.addText([
    { text: t.label + "\n", options: { fontSize: 10, color: C.muted, fontFace: F.mono } },
    { text: t.value + "\n", options: { fontSize: t.label === "SOM" ? 22 : 20, color: C.text, fontFace: F.head, bold: true } },
    { text: t.desc, options: { fontSize: 9, color: C.muted, fontFace: F.body } },
  ], {
    x: t.x - t.size / 2 + 1, y: 2.2 - t.size / 2 + 1.2, w: t.size, h: t.size,
    align: "center", valign: "middle",
  });
});

// Revenue streams
cardRect(s8, 0.8, 4.2, 5.6, 2.8, C.card);
s8.addText("REVENUE STREAMS", {
  x: 1.2, y: 4.3, w: 5, h: 0.35,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});

const streams = [
  { name: "Premium Listings", yr1: 0.3, yr3: 1.8 },
  { name: "Agent Profiles", yr1: 0.15, yr3: 1.5 },
  { name: "Data Licensing", yr1: 0.05, yr3: 1.4 },
  { name: "API Access", yr1: 0, yr3: 0.82 },
];

streams.forEach((s, i) => {
  const y = 4.75 + i * 0.5;
  s8.addText(s.name, {
    x: 1.2, y, w: 2.2, h: 0.4,
    fontSize: 11, fontFace: F.body, color: C.text, valign: "middle",
  });
  // Year 1 bar
  const maxW = 2.5;
  const w1 = Math.max(0.1, (s.yr1 / 2) * maxW);
  const w3 = Math.max(0.1, (s.yr3 / 2) * maxW);
  s8.addShape(pres.shapes.RECTANGLE, {
    x: 3.4, y: y + 0.05, w: w1, h: 0.13, fill: { color: C.gray },
  });
  s8.addShape(pres.shapes.RECTANGLE, {
    x: 3.4, y: y + 0.22, w: w3, h: 0.13, fill: { color: C.amber },
  });
});

s8.addText([
  { text: "■", options: { fontSize: 10, color: C.gray } },
  { text: " Year 1   ", options: { fontSize: 9, color: C.muted, fontFace: F.body } },
  { text: "■", options: { fontSize: 10, color: C.amber } },
  { text: " Year 3", options: { fontSize: 9, color: C.muted, fontFace: F.body } },
], { x: 3.4, y: 6.55, w: 2.5, h: 0.3 });

// Key metric card
cardRect(s8, 6.9, 4.2, 5.6, 2.8, C.card);
s8.addText("YEAR 3 TARGET", {
  x: 7.3, y: 4.3, w: 5, h: 0.35,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});
s8.addText("$5.52M", {
  x: 7.3, y: 4.8, w: 4.8, h: 1.2,
  fontSize: 52, fontFace: F.head, color: C.amber, bold: true, valign: "middle",
});
s8.addText("Annual Recurring Revenue", {
  x: 7.3, y: 5.9, w: 4.8, h: 0.4,
  fontSize: 14, fontFace: F.body, color: C.muted,
});
s8.addText("4 revenue streams · diversified · recurring", {
  x: 7.3, y: 6.3, w: 4.8, h: 0.3,
  fontSize: 11, fontFace: F.body, color: C.muted,
});
addSlideNum(s8, 8);

// ═══════════════════════════════════════════════════════
// SLIDE 9: COMPETITIVE POSITIONING (Power Grid)
// ═══════════════════════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: C.bg };
sectionLabel(s9, "Competitive Positioning");

const gridCols = ["Gwaky", "Zillow", "Nextdoor", "1060"];
const gridRows = ["Community Intel", "Verified Locals", "AI-Native Tools", "Property Data", "Agent Tools", "Data Licensing"];
const gridData = [
  [true, false, false, false],   // Community
  [true, false, false, false],   // Verified
  [true, true, false, false],    // AI
  [true, true, false, false],    // Property Data
  [false, true, false, true],    // Agent Tools
  [true, false, false, false],   // Data Licensing
];

const gridX = 1.5;
const gridY = 1.4;
const colW = 2.4;
const rowH = 0.7;
const labelW = 2.5;

// Column headers
gridCols.forEach((col, i) => {
  const x = gridX + labelW + i * colW;
  s9.addText(col, {
    x, y: gridY, w: colW, h: 0.5,
    fontSize: col === "Gwaky" ? 13 : 12, fontFace: F.body,
    color: col === "Gwaky" ? C.amber : C.muted,
    bold: col === "Gwaky", align: "center", valign: "middle",
  });
});

// Header line
amberLine(s9, gridX, gridY + 0.55, labelW + colW * 4);

// Rows
gridRows.forEach((row, ri) => {
  const y = gridY + 0.7 + ri * rowH;

  // Alternating row bg
  if (ri % 2 === 0) {
    s9.addShape(pres.shapes.RECTANGLE, {
      x: gridX, y, w: labelW + colW * 4, h: rowH,
      fill: { color: C.card },
    });
  }

  s9.addText(row, {
    x: gridX, y, w: labelW, h: rowH,
    fontSize: 12, fontFace: F.body, color: C.text, valign: "middle", margin: [0, 0, 0, 8],
  });

  gridData[ri].forEach((val, ci) => {
    const x = gridX + labelW + ci * colW;
    s9.addText(val ? "●" : "○", {
      x, y, w: colW, h: rowH,
      fontSize: 18, fontFace: F.body,
      color: val ? (ci === 0 ? C.amber : C.green) : C.gray,
      align: "center", valign: "middle",
    });
  });
});

// Bottom insight
cardRect(s9, 0.8, 5.8, 11.7, 1.1, C.card);
s9.addText([
  { text: "Gwaky ", options: { color: C.amber, bold: true, fontSize: 14, fontFace: F.body } },
  { text: "and ", options: { color: C.text, fontSize: 14, fontFace: F.body } },
  { text: "1060 ", options: { color: C.amber, bold: true, fontSize: 14, fontFace: F.body } },
  { text: "serve different sides of the same market. Together, they're the full picture.", options: { color: C.text, fontSize: 14, fontFace: F.body } },
], { x: 1.2, y: 5.8, w: 10.9, h: 1.1, valign: "middle", align: "center" });

addSlideNum(s9, 9);

// ═══════════════════════════════════════════════════════
// SLIDE 10: AI-NATIVE TEAM
// ═══════════════════════════════════════════════════════
let s10 = pres.addSlide();
s10.background = { color: C.bg };
sectionLabel(s10, "AI-Native Team");

// Headcount progression
const hcData = [
  { phase: "Launch", count: "4", months: "Mo 0-6" },
  { phase: "Growth", count: "7", months: "Mo 6-12" },
  { phase: "Scale", count: "11", months: "Mo 12-18" },
];

hcData.forEach((h, i) => {
  const x = 0.8 + i * 2.3;
  cardRect(s10, x, 1.3, 2.0, 2.0, C.card);
  s10.addText(h.count, {
    x, y: 1.4, w: 2.0, h: 1.0,
    fontSize: 42, fontFace: F.head, color: C.amber, bold: true, align: "center",
  });
  s10.addText(h.phase, {
    x, y: 2.3, w: 2.0, h: 0.4,
    fontSize: 13, fontFace: F.body, color: C.text, align: "center",
  });
  s10.addText(h.months, {
    x, y: 2.7, w: 2.0, h: 0.3,
    fontSize: 10, fontFace: F.mono, color: C.muted, align: "center",
  });
});

// vs Traditional
s10.addText("vs", {
  x: 7.4, y: 1.9, w: 0.6, h: 0.5,
  fontSize: 14, fontFace: F.body, color: C.muted, align: "center",
});
cardRect(s10, 8.0, 1.3, 4.5, 2.0, C.card);
s10.addText("45", {
  x: 8.0, y: 1.4, w: 4.5, h: 1.0,
  fontSize: 42, fontFace: F.head, color: C.gray, bold: true, align: "center",
});
s10.addText("Traditional Startup", {
  x: 8.0, y: 2.3, w: 4.5, h: 0.4,
  fontSize: 13, fontFace: F.body, color: C.gray, align: "center",
});
s10.addText("same stage", {
  x: 8.0, y: 2.7, w: 4.5, h: 0.3,
  fontSize: 10, fontFace: F.mono, color: C.gray, align: "center",
});

// AI coverage bars
cardRect(s10, 0.8, 3.7, 7.5, 2.5, C.card);
s10.addText("AI COVERAGE", {
  x: 1.2, y: 3.8, w: 5, h: 0.35,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});

const aiCoverage = [
  { label: "QA & Testing", pct: 100 },
  { label: "Customer Support", pct: 90 },
  { label: "Content Moderation", pct: 95 },
];

aiCoverage.forEach((a, i) => {
  const y = 4.3 + i * 0.6;
  s10.addText(a.label, {
    x: 1.2, y, w: 2.5, h: 0.4,
    fontSize: 12, fontFace: F.body, color: C.text, valign: "middle",
  });
  // Bar background
  s10.addShape(pres.shapes.RECTANGLE, {
    x: 3.8, y: y + 0.1, w: 3.5, h: 0.22, fill: { color: C.card2 },
  });
  // Bar fill
  s10.addShape(pres.shapes.RECTANGLE, {
    x: 3.8, y: y + 0.1, w: 3.5 * (a.pct / 100), h: 0.22, fill: { color: C.amber },
  });
  s10.addText(a.pct + "%", {
    x: 7.4, y, w: 0.7, h: 0.4,
    fontSize: 12, fontFace: F.mono, color: C.amber, valign: "middle",
  });
});

// Cost comparison
cardRect(s10, 8.8, 3.7, 3.7, 2.5, C.card);
s10.addText("ANNUAL COST", {
  x: 9.2, y: 3.8, w: 3, h: 0.35,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});
s10.addText("$800K", {
  x: 9.2, y: 4.3, w: 3, h: 0.8,
  fontSize: 36, fontFace: F.head, color: C.amber, bold: true,
});
s10.addText("vs $2M traditional", {
  x: 9.2, y: 5.0, w: 3, h: 0.4,
  fontSize: 13, fontFace: F.body, color: C.gray,
});
s10.addText("60% savings", {
  x: 9.2, y: 5.4, w: 3, h: 0.35,
  fontSize: 12, fontFace: F.body, color: C.green, bold: true,
});

s10.addText("Every hire does 4x. Not a slogan — an operating model.", {
  x: 0.5, y: 6.5, w: 12.33, h: 0.4,
  fontSize: 15, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s10, 10);

// ═══════════════════════════════════════════════════════
// SLIDE 11: THE ASK
// ═══════════════════════════════════════════════════════
let s11 = pres.addSlide();
s11.background = { color: C.bg };
sectionLabel(s11, "The Ask");

// Main ask
s11.addText([
  { text: "$1.5M SAFE", options: { fontSize: 42, color: C.amber, fontFace: F.head, bold: true } },
  { text: "\n$10M post-money cap", options: { fontSize: 18, color: C.muted, fontFace: F.body } },
], { x: 0.8, y: 1.0, w: 6, h: 1.6, valign: "middle" });

// Use of Funds
cardRect(s11, 0.8, 2.8, 5.6, 2.6, C.card);
s11.addText("USE OF FUNDS", {
  x: 1.2, y: 2.9, w: 5, h: 0.35,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});

const funds = [
  { label: "Product & Engineering", pct: 40, color: C.amber },
  { label: "Growth & Marketing", pct: 25, color: C.amberDark },
  { label: "Operations", pct: 20, color: C.muted },
  { label: "Reserve", pct: 15, color: C.gray },
];

funds.forEach((f, i) => {
  const y = 3.4 + i * 0.45;
  // Bar
  s11.addShape(pres.shapes.RECTANGLE, {
    x: 1.2, y: y + 0.05, w: 3.5 * (f.pct / 50), h: 0.2, fill: { color: f.color },
  });
  s11.addText(f.label, {
    x: 1.2 + 3.5 * (f.pct / 50) + 0.15, y: y - 0.02, w: 2.5, h: 0.3,
    fontSize: 10, fontFace: F.body, color: C.text,
  });
  s11.addText(f.pct + "%", {
    x: 4.8, y: y - 0.02, w: 0.6, h: 0.3,
    fontSize: 10, fontFace: F.mono, color: C.amber, align: "right",
  });
});

// Path to Profit — revenue bars
cardRect(s11, 6.9, 1.0, 5.6, 4.4, C.card);
s11.addText("PATH TO PROFIT", {
  x: 7.3, y: 1.1, w: 5, h: 0.35,
  fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2,
});

const mrrData = [
  { label: "Mo 0-6", mrr: "$0", val: 0, phase: "Build" },
  { label: "Mo 6-12", mrr: "$15K", val: 15, phase: "Launch" },
  { label: "Mo 12-18", mrr: "$45K", val: 45, phase: "CF Positive ✓" },
  { label: "Mo 18+", mrr: "$80K+", val: 80, phase: "Scale" },
];

const barBaseY = 4.5;
const maxBarH = 2.5;
mrrData.forEach((m, i) => {
  const x = 7.5 + i * 1.25;
  const barH = Math.max(0.15, (m.val / 80) * maxBarH);
  const barY = barBaseY - barH;

  s11.addShape(pres.shapes.RECTANGLE, {
    x, y: barY, w: 0.9, h: barH,
    fill: { color: i === 2 ? C.green : (i === 3 ? C.amber : C.card2) },
  });

  s11.addText(m.mrr, {
    x, y: barY - 0.35, w: 0.9, h: 0.3,
    fontSize: 11, fontFace: F.mono, color: i >= 2 ? C.amber : C.muted,
    align: "center", bold: true,
  });

  s11.addText(m.label, {
    x, y: 4.55, w: 0.9, h: 0.25,
    fontSize: 8, fontFace: F.mono, color: C.muted, align: "center",
  });
  s11.addText(m.phase, {
    x: x - 0.15, y: 4.8, w: 1.2, h: 0.25,
    fontSize: 8, fontFace: F.body, color: i === 2 ? C.green : C.muted, align: "center",
  });
});

s11.addText("Cash-flow positive by Month 18. Not \"break-even someday\" — profitable by design.", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.5,
  fontSize: 15, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s11, 11);

// ═══════════════════════════════════════════════════════
// SLIDE 12: THE OPPENHEIM PLAY
// ═══════════════════════════════════════════════════════
let s12 = pres.addSlide();
s12.background = { color: C.bg };
sectionLabel(s12, "The Oppenheim Play");

s12.addText("This isn't just an investment.\nIt's a platform your agents would actually use.", {
  x: 0.8, y: 1.0, w: 11.7, h: 1.2,
  fontSize: 24, fontFace: F.head, color: C.text,
});

// Benefits grid (2x2)
const benefits = [
  { title: "Community Verified Badges", desc: "Your listings get the Gwaky seal — trusted by locals, visible to every buyer." },
  { title: "Gen Z Buyer Pipeline", desc: "68% of 25-34 year olds start home search on social. Meet them where they already are." },
  { title: "Co-Branded Reports", desc: "Neighborhood intelligence reports with Oppenheim branding. New lead magnet." },
  { title: "Revenue Share", desc: "Agent profile tier with revenue share. Your team earns while building reputation." },
];

benefits.forEach((b, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 6.1;
  const y = 2.5 + row * 1.7;

  cardRect(s12, x, y, 5.7, 1.4, C.card);

  s12.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.06, h: 1.4, fill: { color: C.amber },
  });

  s12.addText(b.title, {
    x: x + 0.3, y: y + 0.1, w: 5.1, h: 0.45,
    fontSize: 15, fontFace: F.body, color: C.amber, bold: true,
  });
  s12.addText(b.desc, {
    x: x + 0.3, y: y + 0.55, w: 5.1, h: 0.7,
    fontSize: 12, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.3,
  });
});

// 1060 complement
cardRect(s12, 0.8, 6.0, 11.7, 0.9, C.card2);
s12.addText([
  { text: "1060 ", options: { color: C.amber, bold: true, fontSize: 14, fontFace: F.body } },
  { text: "gives your agents a voice.  ", options: { color: C.text, fontSize: 14, fontFace: F.body } },
  { text: "Gwaky ", options: { color: C.amber, bold: true, fontSize: 14, fontFace: F.body } },
  { text: "gives your buyers the truth.  Together: ", options: { color: C.text, fontSize: 14, fontFace: F.body } },
  { text: "the full stack.", options: { color: C.amber, bold: true, fontSize: 14, fontFace: F.body } },
], { x: 1.2, y: 6.0, w: 10.9, h: 0.9, valign: "middle", align: "center" });

addSlideNum(s12, 12);

// ═══════════════════════════════════════════════════════
// SLIDE 13: CLOSING
// ═══════════════════════════════════════════════════════
let s13 = pres.addSlide();
s13.background = { color: C.bg };

s13.addText("Every neighborhood has a truth.", {
  x: 0.5, y: 1.5, w: 12.33, h: 0.8,
  fontSize: 28, fontFace: F.head, color: C.text, align: "center",
});
s13.addText("We're building the infrastructure to surface it.", {
  x: 0.5, y: 2.3, w: 12.33, h: 0.8,
  fontSize: 28, fontFace: F.head, color: C.text, align: "center",
});

amberLine(s13, 5.5, 3.5, 2.33);

s13.addText("Gwaky", {
  x: 0.5, y: 3.9, w: 12.33, h: 1.2,
  fontSize: 52, fontFace: F.head, color: C.amber, bold: true, align: "center", charSpacing: 4,
});
s13.addText("your favorite local real estate", {
  x: 0.5, y: 5.0, w: 12.33, h: 0.5,
  fontSize: 16, fontFace: F.body, color: C.muted, italic: true, align: "center",
});

// Contact
amberLine(s13, 4.0, 5.8, 5.33);
s13.addText([
  { text: "Zachary Kaufman\n", options: { fontSize: 14, color: C.text, fontFace: F.body, bold: true } },
  { text: "hello@gwaky.com  ·  gwaky.com", options: { fontSize: 12, color: C.muted, fontFace: F.body } },
], {
  x: 0.5, y: 6.0, w: 12.33, h: 0.8, align: "center", valign: "middle",
});

addSlideNum(s13, 13);

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════
const outPath = "/Users/zacharykaufman/Desktop/Pitch Decks/Gwaky - Oppenheim Group Pitch.pptx";
pres.writeFile({ fileName: outPath })
  .then(() => console.log("✅ Deck saved to: " + outPath))
  .catch((err) => console.error("❌ Error:", err));

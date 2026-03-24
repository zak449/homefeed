const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pres.author = "Zachary Kaufman";
pres.title = "gwak gwak — Investor Pitch Deck Q1 2026";

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

s1.addText("gwak gwak", {
  x: 0.5, y: 1.4, w: 12.33, h: 2,
  fontSize: 84, fontFace: F.head, color: C.amber,
  bold: true, align: "center", valign: "middle", charSpacing: 6,
});
s1.addText("the comment section real estate never had", {
  x: 0.5, y: 3.5, w: 12.33, h: 0.7,
  fontSize: 22, fontFace: F.body, color: C.muted, italic: true, align: "center",
});
amberLine(s1, 5.2, 4.5, 2.93);
s1.addText("Seed Investment  ·  Q1 2026  ·  Confidential", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.4,
  fontSize: 11, fontFace: F.body, color: C.muted, align: "center",
});
addSlideNum(s1, 1);

// ═══════════════════════════════════════════════════════
// SLIDE 2: THE HOOK
// ═══════════════════════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: C.bg };
sectionLabel(s2, "The Hook");

s2.addText("85%", {
  x: 0.5, y: 1.0, w: 12.33, h: 2.5,
  fontSize: 120, fontFace: F.head, color: C.amber,
  bold: true, align: "center", valign: "middle",
});
s2.addText("of homebuyers say neighborhood\nmatters more than the house.", {
  x: 0.5, y: 3.4, w: 12.33, h: 1.2,
  fontSize: 28, fontFace: F.head, color: C.text, align: "center", lineSpacingMultiple: 1.3,
});

amberLine(s2, 5.0, 4.9, 3.33);

s2.addText("0", {
  x: 0.5, y: 5.1, w: 3, h: 1.2,
  fontSize: 72, fontFace: F.head, color: C.red,
  bold: true, align: "right", valign: "middle",
});
s2.addText("platforms let them hear\nfrom actual neighbors.", {
  x: 3.8, y: 5.1, w: 8, h: 1.2,
  fontSize: 24, fontFace: F.head, color: C.text, valign: "middle", lineSpacingMultiple: 1.3,
});
addSlideNum(s2, 2);

// ═══════════════════════════════════════════════════════
// SLIDE 3: THE PROBLEM (MARKET FAILURE)
// ═══════════════════════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: C.bg };
sectionLabel(s3, "Market Failure");

s3.addText("$4.4B in revenue. Zero community features.", {
  x: 0.8, y: 0.9, w: 11.7, h: 0.6,
  fontSize: 24, fontFace: F.head, color: C.text, bold: true,
});

// Zillow card
cardRect(s3, 0.8, 1.8, 5.6, 2.0, C.card);
s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.8, w: 0.06, h: 2.0, fill: { color: C.red } });
s3.addText("Zillow", { x: 1.2, y: 1.9, w: 3, h: 0.45, fontSize: 20, fontFace: F.head, color: C.amber, bold: true });
s3.addText([
  { text: "$2.6B", options: { fontSize: 14, color: C.amber, fontFace: F.mono, bold: true } },
  { text: " revenue  ·  ", options: { fontSize: 11, color: C.muted, fontFace: F.body } },
  { text: "230M", options: { fontSize: 14, color: C.amber, fontFace: F.mono, bold: true } },
  { text: " users", options: { fontSize: 11, color: C.muted, fontFace: F.body } },
], { x: 1.2, y: 2.35, w: 4.8, h: 0.35 });
s3.addText("ZERO community features.\nRemoved climate risk data to protect agents.", {
  x: 1.2, y: 2.75, w: 4.8, h: 0.8,
  fontSize: 12, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.4,
});

// Nextdoor card
cardRect(s3, 6.9, 1.8, 5.6, 2.0, C.card);
s3.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 1.8, w: 0.06, h: 2.0, fill: { color: C.red } });
s3.addText("Nextdoor", { x: 7.3, y: 1.9, w: 3, h: 0.45, fontSize: 20, fontFace: F.head, color: C.amber, bold: true });
s3.addText([
  { text: "Lost $98M", options: { fontSize: 14, color: C.red, fontFace: F.mono, bold: true } },
  { text: "  ·  WAU declining 5% YoY", options: { fontSize: 11, color: C.muted, fontFace: F.body } },
], { x: 7.3, y: 2.35, w: 4.8, h: 0.35 });
s3.addText("Too broad. No real estate depth.\nStock down 40% over 52 weeks.", {
  x: 7.3, y: 2.75, w: 4.8, h: 0.8,
  fontSize: 12, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.4,
});

// Redfin card
cardRect(s3, 0.8, 4.1, 5.6, 1.5, C.card);
s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.1, w: 0.06, h: 1.5, fill: { color: C.amber } });
s3.addText("Redfin", { x: 1.2, y: 4.2, w: 3, h: 0.4, fontSize: 18, fontFace: F.head, color: C.amber, bold: true });
s3.addText("Acquired for $1.75B. Still agent-first. No community layer.", {
  x: 1.2, y: 4.65, w: 4.8, h: 0.7,
  fontSize: 12, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.4,
});

// The Gap card
cardRect(s3, 6.9, 4.1, 5.6, 1.5, C.card2);
s3.addShape(pres.shapes.RECTANGLE, { x: 6.9, y: 4.1, w: 0.06, h: 1.5, fill: { color: C.green } });
s3.addText("The Gap", { x: 7.3, y: 4.2, w: 3, h: 0.4, fontSize: 18, fontFace: F.head, color: C.green, bold: true });
s3.addText("Nobody owns verified neighborhood sentiment.\nThis is a white space worth billions.", {
  x: 7.3, y: 4.65, w: 4.8, h: 0.7,
  fontSize: 12, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.4, bold: true,
});

s3.addText("Listings have data. Communities have none. That's the failure.", {
  x: 0.5, y: 6.2, w: 12.33, h: 0.5,
  fontSize: 16, fontFace: F.head, color: C.amber, italic: true, align: "center",
});
addSlideNum(s3, 3);

// ═══════════════════════════════════════════════════════
// SLIDE 4: THIS IS GWAK GWAK
// ═══════════════════════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: C.bg };
sectionLabel(s4, "This Is gwak gwak");

// Phone frame (center)
cardRect(s4, 4.6, 0.9, 4.1, 6.1, C.card3);
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 5.8, y: 0.9, w: 1.7, h: 0.25, rectRadius: 0.1,
  fill: { color: C.bg },
});

// Feed items
cardRect(s4, 4.9, 1.4, 3.5, 1.3, C.card2);
s4.addText([
  { text: "742 Elm St", options: { fontSize: 11, color: C.amber, fontFace: F.body, bold: true } },
  { text: "  Verified Local", options: { fontSize: 8, color: C.green, fontFace: F.mono } },
], { x: 5.4, y: 1.45, w: 2.8, h: 0.3 });
s4.addText("Basement floods every spring. Previous owner hid it with fresh paint. Ask about the sump pump.", {
  x: 5.0, y: 1.85, w: 3.2, h: 0.7,
  fontSize: 10, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.2,
});

cardRect(s4, 4.9, 2.9, 3.5, 1.3, C.card2);
s4.addText([
  { text: "1200 Oak Ave", options: { fontSize: 11, color: C.amber, fontFace: F.body, bold: true } },
  { text: "  Verified Local", options: { fontSize: 8, color: C.green, fontFace: F.mono } },
], { x: 5.4, y: 2.95, w: 2.8, h: 0.3 });
s4.addText("Best block in the neighborhood. Kids play outside, everyone knows each other. 11 years here.", {
  x: 5.0, y: 3.35, w: 3.2, h: 0.7,
  fontSize: 10, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.2,
});

cardRect(s4, 4.9, 4.4, 3.5, 1.3, C.card2);
s4.addText([
  { text: "890 Pine Dr", options: { fontSize: 11, color: C.amber, fontFace: F.body, bold: true } },
  { text: "  Verified Local", options: { fontSize: 8, color: C.green, fontFace: F.mono } },
], { x: 5.4, y: 4.45, w: 2.8, h: 0.3 });
s4.addText("Divorce sale -- they'll take under ask. House is solid. New roof 2024. Great neighbors on this block.", {
  x: 5.0, y: 4.85, w: 3.2, h: 0.7,
  fontSize: 10, fontFace: F.body, color: C.text, lineSpacingMultiple: 1.2,
});

// Reaction bar
s4.addText("12       8       3       2", {
  x: 5.0, y: 5.85, w: 3.2, h: 0.3,
  fontSize: 9, fontFace: F.mono, color: C.muted,
});

// Left callouts
s4.addText("warnings", { x: 0.8, y: 1.6, w: 3.2, h: 0.4, fontSize: 20, fontFace: F.head, color: C.red, align: "right" });
s4.addText("what realtors hide", { x: 0.8, y: 2.0, w: 3.2, h: 0.4, fontSize: 12, fontFace: F.body, color: C.muted, align: "right" });

s4.addText("endorsements", { x: 0.8, y: 3.1, w: 3.2, h: 0.4, fontSize: 20, fontFace: F.head, color: C.green, align: "right" });
s4.addText("verified locals vouch", { x: 0.8, y: 3.5, w: 3.2, h: 0.4, fontSize: 12, fontFace: F.body, color: C.muted, align: "right" });

s4.addText("insider intel", { x: 0.8, y: 4.6, w: 3.2, h: 0.4, fontSize: 20, fontFace: F.head, color: C.amber, align: "right" });
s4.addText("context only locals know", { x: 0.8, y: 5.0, w: 3.2, h: 0.4, fontSize: 12, fontFace: F.body, color: C.muted, align: "right" });

// Right side -- the culture shift
s4.addText("This IS the\nculture shift.", {
  x: 9.0, y: 2.8, w: 3.8, h: 1.4,
  fontSize: 26, fontFace: F.head, color: C.text, bold: true,
});
s4.addText("Real estate has reviews\nfor agents but not for\nneighborhoods. We fix that.", {
  x: 9.0, y: 4.2, w: 3.8, h: 1.4,
  fontSize: 13, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.4,
});

addSlideNum(s4, 4);

// ═══════════════════════════════════════════════════════
// SLIDE 5: HOW IT WORKS
// ═══════════════════════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: C.bg };
sectionLabel(s5, "How It Works");

const steps = [
  { num: "01", title: "Browse", desc: "Search any address or zip.\nSee what neighbors say.\nNo account required.", sub: "Open to everyone" },
  { num: "02", title: "Verify Your Zip", desc: "Enter your zip code.\nYour location is your credential.\nOnly locals speak on their area.", sub: "Trust through geography" },
  { num: "03", title: "Drop Your Take", desc: "Warn buyers. Endorse your block.\nShare what only you know.\nBe the neighbor you needed.", sub: "Your truth, verified" },
];

steps.forEach((step, i) => {
  const x = 0.8 + i * 4.1;
  cardRect(s5, x, 1.3, 3.7, 4.8, C.card);

  s5.addText(step.num, {
    x: x + 0.3, y: 1.6, w: 1, h: 0.7,
    fontSize: 36, fontFace: F.head, color: C.amber, bold: true,
  });

  s5.addText(step.title, {
    x: x + 0.3, y: 2.4, w: 3.1, h: 0.7,
    fontSize: 28, fontFace: F.head, color: C.text, bold: true,
  });

  amberLine(s5, x + 0.3, 3.15, 1.5);

  s5.addText(step.desc, {
    x: x + 0.3, y: 3.4, w: 3.1, h: 1.8,
    fontSize: 14, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.5,
  });

  s5.addText(step.sub, {
    x: x + 0.3, y: 5.3, w: 3.1, h: 0.4,
    fontSize: 10, fontFace: F.mono, color: C.amber, charSpacing: 1,
  });
});

s5.addText("-->", { x: 4.3, y: 2.5, w: 0.8, h: 0.6, fontSize: 28, color: C.amber, fontFace: F.body, align: "center" });
s5.addText("-->", { x: 8.4, y: 2.5, w: 0.8, h: 0.6, fontSize: 28, color: C.amber, fontFace: F.body, align: "center" });

s5.addText("Anyone can browse. Only verified locals can speak.", {
  x: 0.5, y: 6.5, w: 12.33, h: 0.5,
  fontSize: 18, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s5, 5);

// ═══════════════════════════════════════════════════════
// SLIDE 6: WHO USES THIS
// ═══════════════════════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: C.bg };
sectionLabel(s6, "Who Uses This");

// Big stats
cardRect(s6, 0.8, 1.1, 3.7, 1.6, C.card2);
s6.addText([
  { text: "44M", options: { fontSize: 42, color: C.amber, fontFace: F.head, bold: true } },
  { text: "\nAmericans move each year", options: { fontSize: 11, color: C.muted, fontFace: F.body } },
], { x: 0.8, y: 1.1, w: 3.7, h: 1.6, align: "center", valign: "middle" });

cardRect(s6, 4.8, 1.1, 3.7, 1.6, C.card2);
s6.addText([
  { text: "6.1M", options: { fontSize: 42, color: C.amber, fontFace: F.head, bold: true } },
  { text: "\nhomes sold annually", options: { fontSize: 11, color: C.muted, fontFace: F.body } },
], { x: 4.8, y: 1.1, w: 3.7, h: 1.6, align: "center", valign: "middle" });

cardRect(s6, 8.8, 1.1, 3.7, 1.6, C.card2);
s6.addText([
  { text: "73%", options: { fontSize: 42, color: C.amber, fontFace: F.head, bold: true } },
  { text: "\ntrust peers over experts", options: { fontSize: 11, color: C.muted, fontFace: F.body } },
], { x: 8.8, y: 1.1, w: 3.7, h: 1.6, align: "center", valign: "middle" });

// User segments
const segments = [
  { title: "Gen Z / Millennials (25-40)", desc: "68% start home search on social.\n41% use social media for RE info.\nThis is their native format.", color: C.amber },
  { title: "First-Time Buyers", desc: "Terrified. Need ground truth.\nNo network of homeowner friends.\ngwak gwak is their cheat code.", color: C.green },
  { title: "Renters Evaluating Moves", desc: "Want block-level intel before signing.\nNeed to know about noise, safety,\nparking -- not just rent prices.", color: C.amber },
  { title: "Current Homeowners", desc: "Want to warn or endorse their block.\nProud neighbors speak up.\nTheir takes are the product.", color: C.green },
];

segments.forEach((seg, i) => {
  const x = 0.8 + i * 3.1;
  cardRect(s6, x, 3.1, 2.85, 3.2, C.card);
  s6.addShape(pres.shapes.RECTANGLE, { x, y: 3.1, w: 2.85, h: 0.05, fill: { color: seg.color } });
  s6.addText(seg.title, {
    x: x + 0.2, y: 3.3, w: 2.45, h: 0.7,
    fontSize: 13, fontFace: F.head, color: seg.color, bold: true,
  });
  s6.addText(seg.desc, {
    x: x + 0.2, y: 4.1, w: 2.45, h: 1.8,
    fontSize: 11, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.3,
  });
});

s6.addText("Target: the 44M Americans who move each year and have nowhere to hear the truth.", {
  x: 0.5, y: 6.5, w: 12.33, h: 0.5,
  fontSize: 14, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s6, 6);

// ═══════════════════════════════════════════════════════
// SLIDE 7: WHY NOW
// ═══════════════════════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: C.bg };
sectionLabel(s7, "Why Now");

s7.addText("Four forces converging.", {
  x: 0.8, y: 0.9, w: 11.7, h: 0.6,
  fontSize: 28, fontFace: F.head, color: C.text, bold: true,
});

const whyNow = [
  { num: "01", event: "NAR Commission Settlement", detail: "The 2024 ruling disrupted the legacy commission structure.\nAgents no longer gatekeep. Market is open to new models.", color: C.amber },
  { num: "02", event: "Zillow Removed Climate Data", detail: "Chose agent revenue over buyer safety.\nCreated a trust vacuum that gwak gwak fills.", color: C.red },
  { num: "03", event: "AI Replacing Search, Not Experience", detail: "Every AI tool pulls MLS data and comps.\nNone can surface what it's actually like to live there.", color: C.amber },
  { num: "04", event: "Gen Z Demands Transparency", detail: "They have reviews for restaurants, hotels, doctors.\nNot for the biggest purchase of their lives.", color: C.green },
];

whyNow.forEach((item, i) => {
  const y = 1.8 + i * 1.2;
  cardRect(s7, 0.8, y, 11.7, 1.05, C.card);
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y, w: 0.06, h: 1.05, fill: { color: item.color } });

  s7.addText(item.num, {
    x: 1.2, y, w: 0.6, h: 1.05,
    fontSize: 18, fontFace: F.head, color: item.color, bold: true, valign: "middle",
  });
  s7.addText(item.event, {
    x: 1.9, y, w: 4.2, h: 1.05,
    fontSize: 17, fontFace: F.head, color: C.text, bold: true, valign: "middle",
  });
  s7.addText(item.detail, {
    x: 6.3, y, w: 5.7, h: 1.05,
    fontSize: 12, fontFace: F.body, color: C.muted, valign: "middle", lineSpacingMultiple: 1.3,
  });
});

s7.addText("The trust layer for real estate is missing. The timing is now.", {
  x: 0.5, y: 6.5, w: 12.33, h: 0.5,
  fontSize: 16, fontFace: F.head, color: C.amber, italic: true, align: "center",
});
addSlideNum(s7, 7);

// ═══════════════════════════════════════════════════════
// SLIDE 8: THE MOAT
// ═══════════════════════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: C.bg };
sectionLabel(s8, "The Moat");

s8.addText("AI replaces your realtor.\nAI cannot replace your neighbor.", {
  x: 0.8, y: 0.9, w: 11.7, h: 1.4,
  fontSize: 32, fontFace: F.head, color: C.text, bold: true, lineSpacingMultiple: 1.2,
});

// Left: What AI does
cardRect(s8, 0.8, 2.6, 5.6, 3.2, C.card);
s8.addText("WHAT AI DOES", { x: 1.2, y: 2.7, w: 5, h: 0.4, fontSize: 10, fontFace: F.mono, color: C.gray, charSpacing: 2 });
const aiDoes = ["Automated valuations & comps", "Virtual tours & walkthroughs", "Document processing", "Market predictions & trends", "Agent matching & automation"];
aiDoes.forEach((item, i) => {
  s8.addText("--  " + item, { x: 1.4, y: 3.2 + i * 0.45, w: 4.5, h: 0.4, fontSize: 13, fontFace: F.body, color: C.gray });
});

// Right: What AI CAN'T
cardRect(s8, 6.9, 2.6, 5.6, 3.2, C.card);
s8.addText("WHAT AI CAN'T", { x: 7.3, y: 2.7, w: 5, h: 0.4, fontSize: 10, fontFace: F.mono, color: C.amber, charSpacing: 2 });
const aiCant = ["Know the basement floods every spring", "Know the neighbors fight at 2am", "Know the contractor cut corners", "Know the real reason it's priced low", "Know which block is actually safe"];
aiCant.forEach((item, i) => {
  s8.addText(">>  " + item, { x: 7.5, y: 3.2 + i * 0.45, w: 4.5, h: 0.4, fontSize: 13, fontFace: F.body, color: C.amber, bold: true });
});

// Bottom statement
cardRect(s8, 0.8, 6.1, 11.7, 0.9, C.card2);
s8.addText("gwak gwak owns the only dataset of verified, geo-locked human sentiment in American real estate.", {
  x: 1.2, y: 6.1, w: 10.9, h: 0.9,
  fontSize: 15, fontFace: F.head, color: C.text, align: "center", valign: "middle", italic: true,
});
addSlideNum(s8, 8);

// ═══════════════════════════════════════════════════════
// SLIDE 9: DATA MOAT DETAIL
// ═══════════════════════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: C.bg };
sectionLabel(s9, "The Data Moat");

s9.addText("The only dataset of verified, geo-locked\nhuman sentiment in American real estate.", {
  x: 0.8, y: 0.9, w: 11.7, h: 1.0,
  fontSize: 24, fontFace: F.head, color: C.text, bold: true,
});

// 5 properties
const props = [
  { title: "Verified", desc: "Every contributor's address is confirmed" },
  { title: "Geo-locked", desc: "Data tied to specific zips and blocks" },
  { title: "Human-only", desc: "Can't be scraped or synthesized by AI" },
  { title: "Sentiment-rich", desc: "Emotions, warnings, endorsements" },
  { title: "Temporal", desc: "Tied to listing lifecycles" },
];

props.forEach((p, i) => {
  const x = 0.8 + i * 2.45;
  cardRect(s9, x, 2.2, 2.2, 1.8, C.card);
  s9.addText(p.title, { x: x + 0.2, y: 2.4, w: 1.8, h: 0.5, fontSize: 16, fontFace: F.head, color: C.amber, bold: true });
  s9.addText(p.desc, { x: x + 0.2, y: 2.95, w: 1.8, h: 0.8, fontSize: 11, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.3 });
});

// Who pays
cardRect(s9, 0.8, 4.3, 11.7, 2.0, C.card);
s9.addText("WHO PAYS FOR THIS DATA", { x: 1.2, y: 4.4, w: 5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });

const buyers = [
  { who: "AI Platforms", use: "Training data for RE models", price: "$85K/zip" },
  { who: "Insurance Co's", use: "Community-reported risk", price: "Enterprise" },
  { who: "City Planners", use: "Sentiment for development", price: "Annual license" },
  { who: "Hedge Funds", use: "Block-level investment intel", price: "$50K+/mo" },
];

buyers.forEach((b, i) => {
  const x = 1.2 + i * 2.85;
  s9.addText(b.who, { x, y: 4.85, w: 2.6, h: 0.35, fontSize: 14, fontFace: F.body, color: C.amber, bold: true });
  s9.addText(b.use, { x, y: 5.2, w: 2.6, h: 0.4, fontSize: 10, fontFace: F.body, color: C.muted });
  s9.addText(b.price, { x, y: 5.55, w: 2.6, h: 0.3, fontSize: 12, fontFace: F.mono, color: C.text, bold: true });
});

s9.addText("Comp: Reddit's data deal with Google = $60M/year.  Our data is more valuable -- verified, geo-specific, real estate.", {
  x: 0.5, y: 6.6, w: 12.33, h: 0.4,
  fontSize: 12, fontFace: F.body, color: C.muted, italic: true, align: "center",
});
addSlideNum(s9, 9);

// ═══════════════════════════════════════════════════════
// SLIDE 10: COMPETITIVE GRID
// ═══════════════════════════════════════════════════════
let s10 = pres.addSlide();
s10.background = { color: C.bg };
sectionLabel(s10, "Competitive Landscape");

const gridCols = ["gwak gwak", "Zillow", "Nextdoor", "Redfin"];
const gridRows = ["Community Intel", "Verified Locals", "Gen Z Design", "Property Data", "Data Licensing", "Transparency"];
const gridData = [
  [true, false, false, false],
  [true, false, true, false],
  [true, false, false, false],
  [true, true, false, true],
  [true, false, false, false],
  [true, false, false, false],
];

const gridX = 1.5;
const gridY = 1.3;
const colW = 2.4;
const rowH = 0.75;
const labelW = 2.5;

// Column headers
gridCols.forEach((col, i) => {
  s10.addText(col, {
    x: gridX + labelW + i * colW, y: gridY, w: colW, h: 0.5,
    fontSize: col === "gwak gwak" ? 14 : 12, fontFace: col === "gwak gwak" ? F.head : F.body,
    color: col === "gwak gwak" ? C.amber : C.muted,
    bold: col === "gwak gwak", align: "center", valign: "middle",
  });
});

amberLine(s10, gridX, gridY + 0.55, labelW + colW * 4);

gridRows.forEach((row, ri) => {
  const y = gridY + 0.7 + ri * rowH;
  if (ri % 2 === 0) {
    s10.addShape(pres.shapes.RECTANGLE, {
      x: gridX, y, w: labelW + colW * 4, h: rowH, fill: { color: C.card },
    });
  }
  s10.addText(row, {
    x: gridX, y, w: labelW, h: rowH,
    fontSize: 13, fontFace: F.body, color: C.text, valign: "middle", margin: [0, 0, 0, 8],
  });
  gridData[ri].forEach((val, ci) => {
    s10.addText(val ? "YES" : "--", {
      x: gridX + labelW + ci * colW, y, w: colW, h: rowH,
      fontSize: val ? 13 : 11, fontFace: F.body,
      color: val ? (ci === 0 ? C.amber : C.green) : C.gray,
      bold: val, align: "center", valign: "middle",
    });
  });
});

cardRect(s10, 0.8, 6.1, 11.7, 0.9, C.card);
s10.addText("No platform combines verified community intelligence with real estate data. That's the gap.", {
  x: 1.2, y: 6.1, w: 10.9, h: 0.9, valign: "middle", align: "center",
  fontSize: 15, fontFace: F.body, color: C.text, italic: true,
});
addSlideNum(s10, 10);

// ═══════════════════════════════════════════════════════
// SLIDE 11: BUSINESS MODEL & REVENUE
// ═══════════════════════════════════════════════════════
let s11 = pres.addSlide();
s11.background = { color: C.bg };
sectionLabel(s11, "Business Model & Revenue");

// Revenue streams
cardRect(s11, 0.8, 1.2, 7.0, 4.5, C.card);
s11.addText("FOUR REVENUE STREAMS", { x: 1.2, y: 1.3, w: 6, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });

const streams = [
  { name: "Premium Listings", yr1: "$300K", yr3: "$1.8M", yr1w: 0.3, yr3w: 1.8 },
  { name: "Agent Profiles", yr1: "$150K", yr3: "$1.5M", yr1w: 0.15, yr3w: 1.5 },
  { name: "Data Licensing", yr1: "$50K", yr3: "$1.4M", yr1w: 0.05, yr3w: 1.4 },
  { name: "API Access", yr1: "$0", yr3: "$820K", yr1w: 0, yr3w: 0.82 },
];

streams.forEach((s, i) => {
  const y = 1.85 + i * 0.95;

  s11.addText(s.name, { x: 1.2, y, w: 2.2, h: 0.35, fontSize: 13, fontFace: F.body, color: C.text, bold: true });

  // Year 1 bar
  s11.addText("Yr 1", { x: 1.2, y: y + 0.35, w: 0.7, h: 0.2, fontSize: 8, fontFace: F.mono, color: C.gray });
  const maxW = 3.5;
  s11.addShape(pres.shapes.RECTANGLE, { x: 1.9, y: y + 0.37, w: Math.max(0.1, (s.yr1w / 2) * maxW), h: 0.14, fill: { color: C.gray } });
  s11.addText(s.yr1, { x: 1.9 + Math.max(0.1, (s.yr1w / 2) * maxW) + 0.1, y: y + 0.3, w: 1, h: 0.25, fontSize: 9, fontFace: F.mono, color: C.gray });

  // Year 3 bar
  s11.addText("Yr 3", { x: 1.2, y: y + 0.55, w: 0.7, h: 0.2, fontSize: 8, fontFace: F.mono, color: C.amber });
  s11.addShape(pres.shapes.RECTANGLE, { x: 1.9, y: y + 0.57, w: Math.max(0.1, (s.yr3w / 2) * maxW), h: 0.14, fill: { color: C.amber } });
  s11.addText(s.yr3, { x: 1.9 + Math.max(0.1, (s.yr3w / 2) * maxW) + 0.1, y: y + 0.5, w: 1, h: 0.25, fontSize: 9, fontFace: F.mono, color: C.amber });
});

// Year 3 target
cardRect(s11, 8.3, 1.2, 4.2, 4.5, C.card);
s11.addText("YEAR 3 TARGET", { x: 8.7, y: 1.3, w: 3.5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });
s11.addText("$5.52M", {
  x: 8.3, y: 2.0, w: 4.2, h: 1.6,
  fontSize: 56, fontFace: F.head, color: C.amber, bold: true, align: "center", valign: "middle",
});
s11.addText("Annual Recurring Revenue", {
  x: 8.3, y: 3.5, w: 4.2, h: 0.5,
  fontSize: 16, fontFace: F.body, color: C.text, align: "center",
});

amberLine(s11, 9.0, 4.2, 2.8);

s11.addText("4 revenue streams\ndiversified & recurring\nscalable with data moat", {
  x: 8.5, y: 4.4, w: 3.8, h: 1.0,
  fontSize: 12, fontFace: F.body, color: C.muted, align: "center", lineSpacingMultiple: 1.4,
});

s11.addText("Revenue diversified from Day 1. Not dependent on any single stream.", {
  x: 0.5, y: 6.2, w: 12.33, h: 0.5,
  fontSize: 14, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s11, 11);

// ═══════════════════════════════════════════════════════
// SLIDE 12: AI-NATIVE TEAM
// ═══════════════════════════════════════════════════════
let s12 = pres.addSlide();
s12.background = { color: C.bg };
sectionLabel(s12, "AI-Native Operating Model");

// gwak gwak team vs traditional
cardRect(s12, 0.8, 1.2, 5.0, 2.2, C.card);
s12.addText("gwak gwak at Launch", { x: 1.2, y: 1.3, w: 4, h: 0.4, fontSize: 12, fontFace: F.mono, color: C.amber, charSpacing: 1 });
s12.addText("4", { x: 1.0, y: 1.7, w: 4.6, h: 1.4, fontSize: 72, fontFace: F.head, color: C.amber, bold: true, align: "center", valign: "middle" });
s12.addText("people", { x: 1.0, y: 2.9, w: 4.6, h: 0.3, fontSize: 14, fontFace: F.body, color: C.text, align: "center" });

s12.addText("vs", { x: 5.9, y: 2.0, w: 0.8, h: 0.5, fontSize: 16, fontFace: F.body, color: C.muted, align: "center" });

cardRect(s12, 6.9, 1.2, 5.6, 2.2, C.card);
s12.addText("Traditional PropTech", { x: 7.3, y: 1.3, w: 4, h: 0.4, fontSize: 12, fontFace: F.mono, color: C.gray, charSpacing: 1 });
s12.addText("45", { x: 7.1, y: 1.7, w: 5.2, h: 1.4, fontSize: 72, fontFace: F.head, color: C.gray, bold: true, align: "center", valign: "middle" });
s12.addText("people, same output", { x: 7.1, y: 2.9, w: 5.2, h: 0.3, fontSize: 14, fontFace: F.body, color: C.gray, align: "center" });

// AI coverage bars
cardRect(s12, 0.8, 3.7, 7.0, 2.6, C.card);
s12.addText("AI COVERAGE BY FUNCTION", { x: 1.2, y: 3.8, w: 5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });

const aiCoverage = [
  { label: "QA & Testing", pct: 100 },
  { label: "Data Pipelines", pct: 100 },
  { label: "Content Moderation", pct: 95 },
  { label: "Customer Support", pct: 90 },
  { label: "Marketing Content", pct: 80 },
];

aiCoverage.forEach((a, i) => {
  const y = 4.25 + i * 0.4;
  s12.addText(a.label, { x: 1.2, y, w: 2.2, h: 0.35, fontSize: 11, fontFace: F.body, color: C.text, valign: "middle" });
  s12.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: y + 0.08, w: 3.3, h: 0.18, fill: { color: C.card2 } });
  s12.addShape(pres.shapes.RECTANGLE, { x: 3.5, y: y + 0.08, w: 3.3 * (a.pct / 100), h: 0.18, fill: { color: C.amber } });
  s12.addText(a.pct + "%", { x: 6.9, y, w: 0.7, h: 0.35, fontSize: 11, fontFace: F.mono, color: C.amber, valign: "middle" });
});

// Cost card
cardRect(s12, 8.3, 3.7, 4.2, 2.6, C.card);
s12.addText("ANNUAL COST", { x: 8.7, y: 3.8, w: 3.5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });
s12.addText("$800K", { x: 8.3, y: 4.2, w: 4.2, h: 1.0, fontSize: 44, fontFace: F.head, color: C.amber, bold: true, align: "center" });
s12.addText("vs $2M traditional", { x: 8.3, y: 5.2, w: 4.2, h: 0.4, fontSize: 14, fontFace: F.body, color: C.gray, align: "center" });
s12.addText("60% cost reduction", { x: 8.3, y: 5.6, w: 4.2, h: 0.35, fontSize: 13, fontFace: F.body, color: C.green, bold: true, align: "center" });

s12.addText("Every hire does 4x. Not a slogan -- an operating model.", {
  x: 0.5, y: 6.6, w: 12.33, h: 0.4,
  fontSize: 16, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s12, 12);

// ═══════════════════════════════════════════════════════
// SLIDE 13: TRACTION & METRICS
// ═══════════════════════════════════════════════════════
let s13 = pres.addSlide();
s13.background = { color: C.bg };
sectionLabel(s13, "Traction & What's Built");

s13.addText("Not a deck. A live product.", {
  x: 0.8, y: 0.9, w: 11.7, h: 0.7,
  fontSize: 30, fontFace: F.head, color: C.text, bold: true,
});

// Live product URL
cardRect(s13, 0.8, 1.8, 11.7, 0.9, C.card2);
s13.addText([
  { text: "LIVE AT   ", options: { fontSize: 10, color: C.muted, fontFace: F.mono, charSpacing: 2 } },
  { text: "homefeed-ivory.vercel.app", options: { fontSize: 18, color: C.amber, fontFace: F.mono, bold: true } },
], { x: 1.2, y: 1.8, w: 10.9, h: 0.9, valign: "middle", align: "center" });

// Feature grid
const features = [
  { title: "Real Listings", desc: "Realty in US API integration.\nAny city, any zip. Live data.", icon: "01" },
  { title: "Comment System", desc: "Full thread model with\nreactions and sentiment analysis.", icon: "02" },
  { title: "Community Verification", desc: "Zip-code-based identity.\nOnly locals speak on their area.", icon: "03" },
  { title: "Rate-Limited API", desc: "Security-hardened backend.\nProduction-grade infrastructure.", icon: "04" },
  { title: "Mobile-First Design", desc: "Responsive, dark-mode native.\nBuilt for Gen Z browsing.", icon: "05" },
  { title: "Sentiment Analysis", desc: "AI-powered take classification.\nWarnings, endorsements, intel.", icon: "06" },
];

features.forEach((f, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.8 + col * 4.1;
  const y = 3.1 + row * 1.65;
  cardRect(s13, x, y, 3.7, 1.45, C.card);

  s13.addText(f.icon, { x: x + 0.2, y: y + 0.1, w: 0.5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.amber });
  s13.addText(f.title, { x: x + 0.7, y: y + 0.1, w: 2.7, h: 0.35, fontSize: 14, fontFace: F.head, color: C.text, bold: true });
  s13.addText(f.desc, { x: x + 0.2, y: y + 0.55, w: 3.3, h: 0.8, fontSize: 11, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.3 });
});

s13.addText("Shipped and live. Not vaporware.", {
  x: 0.5, y: 6.6, w: 12.33, h: 0.4,
  fontSize: 15, fontFace: F.head, color: C.amber, italic: true, align: "center",
});
addSlideNum(s13, 13);

// ═══════════════════════════════════════════════════════
// SLIDE 14: THE ASK
// ═══════════════════════════════════════════════════════
let s14 = pres.addSlide();
s14.background = { color: C.bg };
sectionLabel(s14, "The Ask");

s14.addText("$1.5M", {
  x: 0.8, y: 0.9, w: 6, h: 1.2,
  fontSize: 64, fontFace: F.head, color: C.amber, bold: true,
});
s14.addText("SAFE  ·  $10M post-money cap", {
  x: 0.8, y: 2.0, w: 6, h: 0.5,
  fontSize: 18, fontFace: F.body, color: C.muted,
});

// Use of funds
cardRect(s14, 0.8, 2.8, 5.6, 3.0, C.card);
s14.addText("USE OF FUNDS", { x: 1.2, y: 2.9, w: 5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });

const funds = [
  { label: "Product & Engineering", pct: 40, amount: "$600K", color: C.amber },
  { label: "Growth & Marketing", pct: 25, amount: "$375K", color: C.amberDark },
  { label: "Operations", pct: 20, amount: "$300K", color: C.muted },
  { label: "Reserve", pct: 15, amount: "$225K", color: C.gray },
];

funds.forEach((f, i) => {
  const y = 3.45 + i * 0.55;
  s14.addShape(pres.shapes.RECTANGLE, { x: 1.2, y: y + 0.05, w: 3.5 * (f.pct / 50), h: 0.22, fill: { color: f.color } });
  s14.addText(f.label, { x: 1.2, y: y + 0.28, w: 2.5, h: 0.25, fontSize: 10, fontFace: F.body, color: C.text });
  s14.addText(f.pct + "%  (" + f.amount + ")", { x: 3.8, y: y + 0.28, w: 2, h: 0.25, fontSize: 10, fontFace: F.mono, color: C.amber, align: "right" });
});

// Path to CF Positive
cardRect(s14, 6.9, 2.8, 5.6, 3.0, C.card);
s14.addText("PATH TO CASH-FLOW POSITIVE", { x: 7.3, y: 2.9, w: 5, h: 0.35, fontSize: 10, fontFace: F.mono, color: C.muted, charSpacing: 2 });

const mrrData = [
  { label: "Mo 0-6", mrr: "$0", val: 0, phase: "Build" },
  { label: "Mo 6-12", mrr: "$15K", val: 15, phase: "Launch" },
  { label: "Mo 12-18", mrr: "$45K", val: 45, phase: "CF+" },
  { label: "Mo 18+", mrr: "$80K+", val: 80, phase: "Scale" },
];

const barBaseY = 5.3;
const maxBarH = 1.8;
mrrData.forEach((m, i) => {
  const x = 7.3 + i * 1.3;
  const barH = Math.max(0.15, (m.val / 80) * maxBarH);
  const barY = barBaseY - barH;
  s14.addShape(pres.shapes.RECTANGLE, {
    x, y: barY, w: 0.95, h: barH,
    fill: { color: i === 2 ? C.green : (i === 3 ? C.amber : C.card2) },
  });
  s14.addText(m.mrr, { x, y: barY - 0.35, w: 0.95, h: 0.3, fontSize: 11, fontFace: F.mono, color: i >= 2 ? C.amber : C.muted, align: "center", bold: true });
  s14.addText(m.label, { x, y: 5.35, w: 0.95, h: 0.25, fontSize: 8, fontFace: F.mono, color: C.muted, align: "center" });
  s14.addText(m.phase, { x: x - 0.1, y: 5.55, w: 1.15, h: 0.25, fontSize: 9, fontFace: F.body, color: i === 2 ? C.green : C.muted, align: "center", bold: i === 2 });
});

s14.addText("Cash-flow positive by Month 18. Profitable by design, not by miracle.", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.5,
  fontSize: 16, fontFace: F.head, color: C.text, italic: true, align: "center",
});
addSlideNum(s14, 14);

// ═══════════════════════════════════════════════════════
// SLIDE 15: THE STRATEGIC PLAY (for brokerages)
// ═══════════════════════════════════════════════════════
let s15 = pres.addSlide();
s15.background = { color: C.bg };
sectionLabel(s15, "The Strategic Play");

s15.addText("For Brokerages & Strategic Partners", {
  x: 0.8, y: 0.9, w: 11.7, h: 0.7,
  fontSize: 28, fontFace: F.head, color: C.text, bold: true,
});

const partnerBenefits = [
  { title: "Community Verified Badges", desc: "Listings with community verification sell faster.\nTrust converts to speed. Your agents close more.", icon: "01" },
  { title: "Gen Z Buyer Pipeline", desc: "41% of Gen Z use social media for RE.\ngwak gwak is where your next buyers already live.", icon: "02" },
  { title: "Co-Branded Reports", desc: "Neighborhood intelligence reports with\nyour brokerage brand. Premium intel competitors lack.", icon: "03" },
  { title: "Revenue Share on Agents", desc: "Agent profiles on gwak gwak generate leads.\nYour agents get leads. Your buyers get truth.", icon: "04" },
];

partnerBenefits.forEach((pb, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.8 + col * 6.25;
  const y = 1.9 + row * 2.0;
  cardRect(s15, x, y, 5.85, 1.75, C.card);
  s15.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.75, fill: { color: C.amber } });

  s15.addText(pb.icon, { x: x + 0.3, y: y + 0.15, w: 0.5, h: 0.3, fontSize: 10, fontFace: F.mono, color: C.amber });
  s15.addText(pb.title, { x: x + 0.8, y: y + 0.1, w: 4.7, h: 0.45, fontSize: 17, fontFace: F.head, color: C.amber, bold: true });
  s15.addText(pb.desc, { x: x + 0.3, y: y + 0.6, w: 5.2, h: 0.95, fontSize: 12, fontFace: F.body, color: C.muted, lineSpacingMultiple: 1.3 });
});

// Bottom tagline
cardRect(s15, 0.8, 6.1, 11.7, 0.8, C.card2);
s15.addText("Your agents get leads.  Your buyers get truth.", {
  x: 1.2, y: 6.1, w: 10.9, h: 0.8,
  fontSize: 20, fontFace: F.head, color: C.amber, align: "center", valign: "middle", bold: true, italic: true,
});
addSlideNum(s15, 15);

// ═══════════════════════════════════════════════════════
// SLIDE 16: CLOSING
// ═══════════════════════════════════════════════════════
let s16 = pres.addSlide();
s16.background = { color: C.bg };

s16.addText("Every neighborhood has a truth.", {
  x: 0.5, y: 1.2, w: 12.33, h: 0.9,
  fontSize: 32, fontFace: F.head, color: C.text, align: "center",
});
s16.addText("We're building the infrastructure to surface it.", {
  x: 0.5, y: 2.1, w: 12.33, h: 0.9,
  fontSize: 32, fontFace: F.head, color: C.text, align: "center",
});

amberLine(s16, 5.0, 3.4, 3.33);

s16.addText("gwak gwak", {
  x: 0.5, y: 3.7, w: 12.33, h: 1.4,
  fontSize: 60, fontFace: F.head, color: C.amber, bold: true, align: "center", charSpacing: 5,
});
s16.addText("the comment section real estate never had", {
  x: 0.5, y: 5.0, w: 12.33, h: 0.5,
  fontSize: 18, fontFace: F.body, color: C.muted, italic: true, align: "center",
});

amberLine(s16, 4.0, 5.8, 5.33);
s16.addText([
  { text: "Zachary Kaufman\n", options: { fontSize: 16, color: C.text, fontFace: F.body, bold: true } },
  { text: "hello@gwakgwak.com  |  gwakgwak.com", options: { fontSize: 13, color: C.muted, fontFace: F.body } },
], {
  x: 0.5, y: 6.0, w: 12.33, h: 0.9, align: "center", valign: "middle",
});

addSlideNum(s16, 16);

// ═══════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════
const outPath = "/Users/zacharykaufman/Desktop/Pitch Decks/gwak gwak - Investor Pitch Q1 2026.pptx";

const fs = require("fs");
const path = require("path");
const dir = path.dirname(outPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

pres.writeFile({ fileName: outPath })
  .then(() => console.log("Deck saved to: " + outPath))
  .catch((err) => console.error("Error:", err));

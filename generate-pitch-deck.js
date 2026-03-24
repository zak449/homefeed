const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pres.author = "Zachary Kaufman";
pres.title = "gwak gwak — Investor Pitch Deck Q1 2026";

// ─── DESIGN SYSTEM ───
const C = {
  light: "FAFAF8",
  dark: "0A0A0A",
  darkCard: "141414",
  white: "FFFFFF",
  text: "1A1A1A",
  textLight: "F2F0ED",
  muted: "8A8680",
  mutedLight: "B0ADA8",
  amber: "D4763C",
  amberSoft: "E8A87C",
  green: "4ADE80",
  red: "E05555",
  overlay: "000000",
};

const F = { head: "Georgia", body: "Calibri", mono: "Consolas" };
const IMG = "/Users/zacharykaufman/Desktop/Pitch Decks/images/";
const W = 13.33;
const H = 7.5;

// ─── HELPERS ───
function addSlideNum(slide, num) {
  slide.addText(String(num).padStart(2, "0"), {
    x: 12.3, y: 6.9, w: 0.8, h: 0.4,
    fontSize: 9, fontFace: F.mono, color: C.muted, align: "right",
  });
}

function fullBleedImage(slide, filename) {
  slide.addImage({
    path: path.join(IMG, filename),
    x: 0, y: 0, w: W, h: H,
    sizing: { type: "cover", w: W, h: H },
  });
}

function darkOverlay(slide, opacity) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: C.overlay, transparency: 100 - (opacity || 60) },
  });
}

function leftHalfOverlay(slide) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W * 0.55, h: H,
    fill: { color: C.overlay, transparency: 20 },
  });
}

function amberLeftBorder(slide, x, y, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.04, h: h || 0.5,
    fill: { color: C.amber },
  });
}

function lightSlide() {
  const s = pres.addSlide();
  s.background = { fill: C.light };
  return s;
}

function darkSlide() {
  const s = pres.addSlide();
  s.background = { fill: C.dark };
  return s;
}

// ═══════════════════════════════════════════════════════════
// SLIDE 1: COVER — Full-bleed hero-couple.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "hero-couple.jpg");
  darkOverlay(slide, 60);

  slide.addText("gwak gwak", {
    x: 0, y: 2.2, w: W, h: 1.5,
    fontSize: 72, fontFace: F.head, color: C.white,
    align: "center", bold: false, italic: true,
  });

  slide.addText("the comment section real estate never had", {
    x: 0, y: 3.6, w: W, h: 0.8,
    fontSize: 22, fontFace: F.body, color: C.amberSoft,
    align: "center",
  });

  slide.addText("Q1 2026  ·  Confidential", {
    x: 0, y: 6.5, w: W, h: 0.5,
    fontSize: 11, fontFace: F.body, color: C.mutedLight,
    align: "center", transparency: 30,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 2: THE FEELING — Full-bleed neighbors.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "neighbors.jpg");
  darkOverlay(slide, 50);

  slide.addText(
    "Your neighbor knows the truth about\nevery house on the block.\n\nThey've just never had a place to share it.",
    {
      x: 0.8, y: 1.8, w: 7, h: 4,
      fontSize: 28, fontFace: F.head, color: C.white,
      lineSpacingMultiple: 1.4, italic: true,
    }
  );
}

// ═══════════════════════════════════════════════════════════
// SLIDE 3: THE PROBLEM — Clean light slide, 3 stat blocks
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 3);

  slide.addText("THE PROBLEM", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const stats = [
    { num: "85%", color: C.amber, desc: "of homebuyers say neighborhood\nmatters more than the house" },
    { num: "0", color: C.red, desc: "platforms let them hear\nfrom actual neighbors" },
    { num: "$2.6B", color: C.text, desc: "Zillow's revenue.\nZero community features." },
  ];

  const colW = 3.5;
  const startX = 0.9;
  const gap = 0.4;

  stats.forEach((s, i) => {
    const x = startX + i * (colW + gap);
    slide.addText(s.num, {
      x, y: 2.0, w: colW, h: 1.6,
      fontSize: 80, fontFace: F.head, color: s.color,
      align: "left", bold: true,
    });
    slide.addText(s.desc, {
      x, y: 3.8, w: colW, h: 1.2,
      fontSize: 16, fontFace: F.body, color: C.text,
      lineSpacingMultiple: 1.3,
    });
  });

  // Dividers between stats
  for (let i = 1; i < 3; i++) {
    const x = startX + i * (colW + gap) - gap / 2;
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.2, w: 0.01, h: 2.8,
      fill: { color: "E0DDD8" },
    });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 4: THE WORLD IS CHANGING — Light slide, amber borders
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 4);

  slide.addText("THE WORLD IS CHANGING", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const items = [
    "NAR commission settlement disrupted the agent model",
    "Zillow removed climate risk data to protect agents",
    "AI replaces search — but can't replace lived experience",
    "Gen Z demands transparency for everything — except housing",
  ];

  const startY = 1.8;
  const itemH = 1.1;

  items.forEach((text, i) => {
    const y = startY + i * itemH;
    amberLeftBorder(slide, 1.2, y + 0.1, 0.45);
    slide.addText(text, {
      x: 1.5, y, w: 9, h: 0.7,
      fontSize: 20, fontFace: F.body, color: C.text,
      lineSpacingMultiple: 1.2,
    });
  });

  slide.addText("The infrastructure of home-buying trust is collapsing. Something new is coming.", {
    x: 1.5, y: 6.0, w: 9, h: 0.6,
    fontSize: 14, fontFace: F.head, color: C.muted, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 5: THIS IS gwak gwak — Full-bleed phone-app.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "phone-app.jpg");
  leftHalfOverlay(slide);

  slide.addText("THIS IS", {
    x: 0.8, y: 1.5, w: 5, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.amberSoft,
    letterSpacing: 4, bold: true,
  });

  slide.addText("gwak gwak", {
    x: 0.8, y: 2.0, w: 5, h: 1.2,
    fontSize: 48, fontFace: F.head, color: C.white, italic: true,
  });

  slide.addText(
    "A completely new way to engage with\nreal estate and community.\n\nSearch any address. See what neighbors\nare really saying. Drop your take.",
    {
      x: 0.8, y: 3.4, w: 5.5, h: 2.5,
      fontSize: 17, fontFace: F.body, color: C.textLight,
      lineSpacingMultiple: 1.5,
    }
  );
}

// ═══════════════════════════════════════════════════════════
// SLIDE 6: HOW IT WORKS — Light slide, 3 columns
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 6);

  slide.addText("HOW IT WORKS", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const steps = [
    { title: "Browse", num: "01", desc: "Search any address or zip.\nSee real neighbor takes.\nNo account needed." },
    { title: "Verify", num: "02", desc: "Enter your zip code.\nYour location is your credential.\nNo sign-up friction." },
    { title: "Gwak", num: "03", desc: "Drop your take.\nWarn buyers.\nEndorse your block." },
  ];

  const colW = 3.4;
  const startX = 0.9;
  const gap = 0.5;

  steps.forEach((s, i) => {
    const x = startX + i * (colW + gap);

    slide.addText(s.num, {
      x, y: 1.6, w: colW, h: 0.6,
      fontSize: 14, fontFace: F.mono, color: C.amberSoft,
    });

    slide.addText(s.title, {
      x, y: 2.1, w: colW, h: 0.8,
      fontSize: 32, fontFace: F.head, color: C.text, bold: true,
    });

    amberLeftBorder(slide, x, 2.1, 0.5);

    slide.addText(s.desc, {
      x, y: 3.1, w: colW, h: 1.8,
      fontSize: 15, fontFace: F.body, color: C.muted,
      lineSpacingMultiple: 1.5,
    });
  });

  // Bottom tagline
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 5.6, w: W - 1.6, h: 0.01,
    fill: { color: "E0DDD8" },
  });

  slide.addText("Anyone can browse. Only verified locals can speak.", {
    x: 0.8, y: 5.8, w: W - 1.6, h: 0.5,
    fontSize: 16, fontFace: F.head, color: C.amber, italic: true,
    align: "center",
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 7: THE FOMO ENGINE — Light slide, secret weapon
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 7);

  slide.addText("THE FOMO ENGINE", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Comments disappear\nwhen the listing sells.", {
    x: 0.8, y: 1.5, w: 10, h: 1.6,
    fontSize: 44, fontFace: F.head, color: C.text,
    lineSpacingMultiple: 1.2, bold: true,
  });

  slide.addText(
    "Every listing is a ticking clock. If you want the truth about 742 Elm St — you better get in NOW. Once it sells, the conversation locks forever.",
    {
      x: 0.8, y: 3.5, w: 8, h: 1.2,
      fontSize: 17, fontFace: F.body, color: C.muted,
      lineSpacingMultiple: 1.5,
    }
  );

  const hooks = [
    "This creates urgency.",
    "This creates engagement.",
    "This creates a reason to come back.",
  ];

  hooks.forEach((text, i) => {
    const y = 5.0 + i * 0.55;
    amberLeftBorder(slide, 0.8, y + 0.05, 0.35);
    slide.addText(text, {
      x: 1.1, y, w: 6, h: 0.5,
      fontSize: 18, fontFace: F.head, color: C.amber,
      italic: true, bold: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 8: WHO USES THIS — Full-bleed urban-woman.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "urban-woman.jpg");

  // Bottom half gradient overlay
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H * 0.35, w: W, h: H * 0.65,
    fill: { color: C.overlay, transparency: 15 },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: C.overlay, transparency: 55 },
  });

  slide.addText("WHO USES THIS", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.amberSoft,
    letterSpacing: 4, bold: true,
  });

  // Stats row
  const statsData = [
    { num: "44M", desc: "Americans move\neach year" },
    { num: "6.1M", desc: "homes sold\nannually" },
    { num: "73%", desc: "of Gen Z trust peer\nreviews over experts" },
  ];

  statsData.forEach((s, i) => {
    const x = 0.8 + i * 4;
    slide.addText(s.num, {
      x, y: 1.2, w: 3.5, h: 0.9,
      fontSize: 48, fontFace: F.head, color: C.white, bold: true,
    });
    slide.addText(s.desc, {
      x, y: 2.1, w: 3.5, h: 0.8,
      fontSize: 14, fontFace: F.body, color: C.mutedLight,
      lineSpacingMultiple: 1.3,
    });
  });

  // Personas
  const personas = [
    { title: "First-time buyers", desc: "Need truth before biggest purchase of their life" },
    { title: "Renters evaluating", desc: "Researching blocks before committing to a lease" },
    { title: "Homeowners", desc: "Sharing what they know — warnings and endorsements" },
    { title: "Agents", desc: "Building reputation through transparency" },
  ];

  personas.forEach((p, i) => {
    const x = 0.8 + i * 3.1;
    const y = 4.2;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 2.8, h: 1.8,
      rectRadius: 0.08,
      fill: { color: C.overlay, transparency: 40 },
    });

    slide.addText(p.title, {
      x: x + 0.2, y: y + 0.2, w: 2.4, h: 0.5,
      fontSize: 15, fontFace: F.head, color: C.amberSoft, bold: true,
    });

    slide.addText(p.desc, {
      x: x + 0.2, y: y + 0.8, w: 2.4, h: 0.7,
      fontSize: 12, fontFace: F.body, color: C.mutedLight,
      lineSpacingMultiple: 1.3,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 9: THE MOAT — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 9);

  slide.addText("THE MOAT", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("AI replaces your realtor.\nAI cannot replace your neighbor.", {
    x: 0.8, y: 1.2, w: 10, h: 1.5,
    fontSize: 36, fontFace: F.head, color: C.textLight,
    lineSpacingMultiple: 1.3, italic: true,
  });

  // Two columns
  const leftItems = ["Automated valuations", "Virtual tours", "Document processing", "Market predictions"];
  const rightItems = ["Does the basement flood?", "Neighbor disputes history", "Why they REALLY sold", "School pickup chaos at 3pm"];

  slide.addText("WHAT AI DOES", {
    x: 0.8, y: 3.0, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3,
  });

  leftItems.forEach((item, i) => {
    slide.addText(item, {
      x: 0.8, y: 3.5 + i * 0.55, w: 5, h: 0.5,
      fontSize: 15, fontFace: F.body, color: C.muted,
    });
  });

  slide.addText("WHAT AI CAN'T", {
    x: 7, y: 3.0, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.amberSoft,
    letterSpacing: 3,
  });

  rightItems.forEach((item, i) => {
    amberLeftBorder(slide, 7, 3.6 + i * 0.55, 0.35);
    slide.addText(item, {
      x: 7.3, y: 3.5 + i * 0.55, w: 5, h: 0.5,
      fontSize: 15, fontFace: F.body, color: C.amberSoft, bold: true,
    });
  });

  // Divider
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.3, y: 3.2, w: 0.01, h: 2.5,
    fill: { color: "333333" },
  });

  slide.addText(
    "We own the only dataset of verified, geo-locked human sentiment\nin American real estate.",
    {
      x: 0.8, y: 6.2, w: 10, h: 0.6,
      fontSize: 14, fontFace: F.head, color: C.amberSoft, italic: true,
    }
  );
}

// ═══════════════════════════════════════════════════════════
// SLIDE 10: THE DATA PLAY — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 10);

  slide.addText("THE DATA PLAY", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Community → Data → Revenue", {
    x: 0.8, y: 1.2, w: 10, h: 0.9,
    fontSize: 36, fontFace: F.head, color: C.text, bold: true,
  });

  // Flywheel — circular flow represented as connected blocks
  const flywheel = ["More residents", "More takes", "More data", "Licensing revenue", "Reinvest"];
  const fwStartX = 1.0;
  const fwY = 2.5;

  flywheel.forEach((step, i) => {
    const x = fwStartX + i * 2.3;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: fwY, w: 2.0, h: 0.7,
      rectRadius: 0.06,
      fill: { color: i === 3 ? C.amber : "EEEDEA" },
    });
    slide.addText(step, {
      x, y: fwY, w: 2.0, h: 0.7,
      fontSize: 12, fontFace: F.body, color: i === 3 ? C.white : C.text,
      align: "center", bold: true,
    });
    if (i < flywheel.length - 1) {
      slide.addText("→", {
        x: x + 1.9, y: fwY, w: 0.5, h: 0.7,
        fontSize: 18, fontFace: F.body, color: C.amber, align: "center",
      });
    }
  });

  // Curved arrow back from Reinvest to More residents
  slide.addText("↻", {
    x: 5.5, y: 3.3, w: 1, h: 0.6,
    fontSize: 20, fontFace: F.body, color: C.amber, align: "center",
  });

  // Who pays
  slide.addText("WHO PAYS FOR THIS DATA", {
    x: 0.8, y: 4.0, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3, bold: true,
  });

  const buyers = [
    { who: "AI Platforms", price: "$85K/zip", desc: "Training on verified sentiment" },
    { who: "Insurance", price: "Per-query", desc: "Hyper-local risk signals" },
    { who: "City Planners", price: "Annual license", desc: "Community sentiment mapping" },
    { who: "Hedge Funds", price: "Premium API", desc: "Predictive housing signals" },
  ];

  buyers.forEach((b, i) => {
    const x = 0.8 + i * 3.05;
    slide.addText(b.who, {
      x, y: 4.5, w: 2.8, h: 0.4,
      fontSize: 16, fontFace: F.head, color: C.text, bold: true,
    });
    slide.addText(b.price, {
      x, y: 4.9, w: 2.8, h: 0.4,
      fontSize: 14, fontFace: F.body, color: C.amber, bold: true,
    });
    slide.addText(b.desc, {
      x, y: 5.3, w: 2.8, h: 0.4,
      fontSize: 12, fontFace: F.body, color: C.muted,
    });
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 6.0, w: W - 1.6, h: 0.01,
    fill: { color: "E0DDD8" },
  });

  slide.addText("Comp: Reddit's Google deal = $60M/year. Our data is verified, geo-specific, real estate vertical.", {
    x: 0.8, y: 6.2, w: 11, h: 0.5,
    fontSize: 13, fontFace: F.head, color: C.amber, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 11: HOW WE MAKE MONEY — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 11);

  slide.addText("HOW WE MAKE MONEY", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const streams = [
    { name: "Premium Listings", y1: "$120K", y3: "$1.8M", pct: 33 },
    { name: "Agent Profiles", y1: "$80K", y3: "$1.2M", pct: 22 },
    { name: "Data Licensing", y1: "$200K", y3: "$2.0M", pct: 36 },
    { name: "API Access", y1: "$40K", y3: "$520K", pct: 9 },
  ];

  const barMaxW = 6;

  streams.forEach((s, i) => {
    const y = 1.6 + i * 1.3;

    slide.addText(s.name, {
      x: 0.8, y, w: 3, h: 0.4,
      fontSize: 16, fontFace: F.head, color: C.text, bold: true,
    });

    // Year 1 bar
    slide.addText("Y1", {
      x: 4, y: y + 0.0, w: 0.5, h: 0.35,
      fontSize: 10, fontFace: F.body, color: C.muted,
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.5, y: y + 0.05, w: barMaxW * (s.pct / 100) * 0.3, h: 0.25,
      rectRadius: 0.04,
      fill: { color: C.amberSoft },
    });
    slide.addText(s.y1, {
      x: 4.5 + barMaxW * (s.pct / 100) * 0.3 + 0.15, y: y - 0.02, w: 1.5, h: 0.35,
      fontSize: 11, fontFace: F.body, color: C.muted,
    });

    // Year 3 bar
    slide.addText("Y3", {
      x: 4, y: y + 0.4, w: 0.5, h: 0.35,
      fontSize: 10, fontFace: F.body, color: C.muted,
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.5, y: y + 0.45, w: barMaxW * (s.pct / 100), h: 0.25,
      rectRadius: 0.04,
      fill: { color: C.amber },
    });
    slide.addText(s.y3, {
      x: 4.5 + barMaxW * (s.pct / 100) + 0.15, y: y + 0.38, w: 1.5, h: 0.35,
      fontSize: 11, fontFace: F.body, color: C.text, bold: true,
    });
  });

  // Bottom highlights
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 6.0, w: 4, h: 0.8,
    rectRadius: 0.06,
    fill: { color: "EEEDEA" },
  });
  slide.addText([
    { text: "$5.52M ", options: { fontSize: 24, fontFace: F.head, color: C.amber, bold: true } },
    { text: "ARR by Year 3", options: { fontSize: 14, fontFace: F.body, color: C.text } },
  ], { x: 1.0, y: 6.1, w: 3.6, h: 0.6 });

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.5, y: 6.0, w: 4.5, h: 0.8,
    rectRadius: 0.06,
    fill: { color: "EEEDEA" },
  });
  slide.addText([
    { text: "Cash-flow positive ", options: { fontSize: 16, fontFace: F.head, color: C.green, bold: true } },
    { text: "by Month 18", options: { fontSize: 14, fontFace: F.body, color: C.text } },
  ], { x: 5.7, y: 6.1, w: 4.1, h: 0.6 });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 12: COMPETITIVE LANDSCAPE — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 12);

  slide.addText("COMPETITIVE LANDSCAPE", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const features = ["Community Intel", "Verified Locals", "Gen Z Design", "Data Licensing", "Transparency"];
  const competitors = [
    { name: "gwak gwak", scores: [true, true, true, true, true] },
    { name: "Zillow", scores: [false, false, false, false, false] },
    { name: "Nextdoor", scores: [true, false, false, false, false] },
    { name: "Redfin", scores: [false, false, false, false, true] },
  ];

  const tableStartX = 0.8;
  const tableStartY = 1.5;
  const colW = 2.0;
  const rowH = 0.65;
  const labelColW = 2.5;

  // Header row
  competitors.forEach((comp, i) => {
    const x = tableStartX + labelColW + i * colW;
    slide.addText(comp.name, {
      x, y: tableStartY, w: colW, h: rowH,
      fontSize: i === 0 ? 14 : 13,
      fontFace: i === 0 ? F.head : F.body,
      color: i === 0 ? C.amber : C.text,
      align: "center", bold: i === 0,
    });
  });

  // Feature rows
  features.forEach((feat, fi) => {
    const y = tableStartY + (fi + 1) * rowH;

    // Alternating row bg
    if (fi % 2 === 0) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: tableStartX, y, w: labelColW + colW * competitors.length, h: rowH,
        fill: { color: "F0EFEB" },
      });
    }

    slide.addText(feat, {
      x: tableStartX, y, w: labelColW, h: rowH,
      fontSize: 13, fontFace: F.body, color: C.text,
      valign: "middle",
    });

    competitors.forEach((comp, ci) => {
      const x = tableStartX + labelColW + ci * colW;
      slide.addText(comp.scores[fi] ? "●" : "—", {
        x, y, w: colW, h: rowH,
        fontSize: comp.scores[fi] ? 18 : 14,
        fontFace: F.body,
        color: comp.scores[fi] ? (ci === 0 ? C.amber : C.green) : C.muted,
        align: "center", valign: "middle",
      });
    });
  });

  slide.addText("gwak gwak wins every social and community category.", {
    x: 0.8, y: 5.8, w: 10, h: 0.5,
    fontSize: 15, fontFace: F.head, color: C.amber, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 13: AI-NATIVE TEAM — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 13);

  slide.addText("AI-NATIVE TEAM", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("4 people. Not 45.", {
    x: 0.8, y: 1.5, w: 10, h: 1.2,
    fontSize: 52, fontFace: F.head, color: C.textLight, bold: true,
  });

  // Comparison cards
  const cards = [
    { label: "Our burn", value: "$800K/yr", color: C.amberSoft },
    { label: "Traditional startup", value: "$2M/yr", color: C.muted },
    { label: "Savings", value: "60%", color: C.green },
  ];

  cards.forEach((c, i) => {
    const x = 0.8 + i * 3.8;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.3, w: 3.4, h: 1.6,
      rectRadius: 0.08,
      fill: { color: C.darkCard },
    });
    slide.addText(c.label, {
      x: x + 0.3, y: 3.5, w: 2.8, h: 0.4,
      fontSize: 11, fontFace: F.body, color: C.muted,
    });
    slide.addText(c.value, {
      x: x + 0.3, y: 3.9, w: 2.8, h: 0.8,
      fontSize: 36, fontFace: F.head, color: c.color, bold: true,
    });
  });

  slide.addText("Every hire does 4x. Not a slogan — an operating model.", {
    x: 0.8, y: 5.5, w: 10, h: 0.5,
    fontSize: 18, fontFace: F.head, color: C.amberSoft, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 14: WHAT'S BUILT — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 14);

  slide.addText("WHAT'S BUILT", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Live product. Real listings.\nReal comments.", {
    x: 0.8, y: 1.2, w: 10, h: 1.2,
    fontSize: 36, fontFace: F.head, color: C.text, bold: true,
    lineSpacingMultiple: 1.2,
  });

  const features = [
    "Search any US city",
    "Photo carousels",
    "Split map view",
    "Gated community join",
    "Style Visualizer",
    "Rate-limited API",
  ];

  features.forEach((feat, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = 0.8 + col * 5.5;
    const y = 2.8 + row * 0.7;

    slide.addText("✓", {
      x, y, w: 0.4, h: 0.5,
      fontSize: 16, fontFace: F.body, color: C.amber, bold: true,
    });
    slide.addText(feat, {
      x: x + 0.4, y, w: 4.5, h: 0.5,
      fontSize: 16, fontFace: F.body, color: C.text,
    });
  });

  // URL callout
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 5.4, w: 6, h: 0.8,
    rectRadius: 0.06,
    fill: { color: "EEEDEA" },
  });
  slide.addText("homefeed-ivory.vercel.app", {
    x: 1.0, y: 5.4, w: 5.6, h: 0.8,
    fontSize: 18, fontFace: F.mono, color: C.amber,
    valign: "middle",
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 15: THE ASK — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 15);

  slide.addText("THE ASK", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("$1.5M SAFE", {
    x: 0.8, y: 1.2, w: 10, h: 1.4,
    fontSize: 64, fontFace: F.head, color: C.amberSoft, bold: true,
  });

  slide.addText("$10M post-money cap", {
    x: 0.8, y: 2.5, w: 10, h: 0.6,
    fontSize: 22, fontFace: F.body, color: C.textLight,
  });

  // Use of funds
  slide.addText("USE OF FUNDS", {
    x: 0.8, y: 3.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3, bold: true,
  });

  const funds = [
    { label: "Product", pct: 40, w: 4.8 },
    { label: "Growth", pct: 25, w: 3.0 },
    { label: "Ops", pct: 20, w: 2.4 },
    { label: "Reserve", pct: 15, w: 1.8 },
  ];

  let barX = 0.8;
  funds.forEach((f) => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: barX, y: 4.0, w: f.w, h: 0.5,
      rectRadius: 0.04,
      fill: { color: C.amber, transparency: (40 - f.pct) * 1.5 },
    });
    slide.addText(`${f.label} ${f.pct}%`, {
      x: barX, y: 4.0, w: f.w, h: 0.5,
      fontSize: 11, fontFace: F.body, color: C.white,
      align: "center", valign: "middle", bold: true,
    });
    barX += f.w + 0.05;
  });

  // MRR growth
  slide.addText("MRR TRAJECTORY", {
    x: 0.8, y: 5.0, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3, bold: true,
  });

  const mrr = [
    { label: "Now", val: "$0" },
    { label: "M6", val: "$15K" },
    { label: "M12", val: "$45K" },
    { label: "M18", val: "$80K+" },
  ];

  mrr.forEach((m, i) => {
    const x = 0.8 + i * 2.8;
    slide.addText(m.val, {
      x, y: 5.4, w: 2.5, h: 0.6,
      fontSize: 28, fontFace: F.head, color: C.amberSoft, bold: true,
    });
    slide.addText(m.label, {
      x, y: 6.0, w: 2.5, h: 0.3,
      fontSize: 11, fontFace: F.body, color: C.muted,
    });

    if (i < mrr.length - 1) {
      slide.addText("→", {
        x: x + 2.2, y: 5.4, w: 0.8, h: 0.6,
        fontSize: 20, fontFace: F.body, color: C.muted, align: "center",
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 16: CLOSING — Full-bleed aerial.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "aerial.jpg");
  darkOverlay(slide, 55);

  slide.addText("Every neighborhood has a truth.", {
    x: 0, y: 1.8, w: W, h: 0.9,
    fontSize: 32, fontFace: F.head, color: C.white,
    align: "center", italic: true,
  });

  slide.addText("We're building the infrastructure to surface it.", {
    x: 0, y: 2.7, w: W, h: 0.7,
    fontSize: 20, fontFace: F.body, color: C.mutedLight,
    align: "center",
  });

  slide.addText("gwak gwak", {
    x: 0, y: 3.8, w: W, h: 1.2,
    fontSize: 56, fontFace: F.head, color: C.white,
    align: "center", italic: true,
  });

  slide.addText("Zachary Kaufman  ·  hello@gwakgwak.com  ·  gwakgwak.com", {
    x: 0, y: 6.2, w: W, h: 0.5,
    fontSize: 14, fontFace: F.body, color: C.mutedLight,
    align: "center",
  });
}

// ─── EXPORT ───
const outputPath = "/Users/zacharykaufman/Desktop/Pitch Decks/gwak gwak - Investor Pitch Q1 2026.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log(`✅ Deck saved to: ${outputPath}`);
  console.log(`   ${pres.slides.length} slides generated`);
}).catch((err) => {
  console.error("❌ Error generating deck:", err);
});

const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33" x 7.5"
pres.author = "Zachary Kaufman";
pres.title = "Gwaky — Investor Pitch Deck Q1 2026";

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
  darkOverlay(slide, 65);

  slide.addText("Gwaky", {
    x: 0, y: 1.8, w: W, h: 1.5,
    fontSize: 72, fontFace: F.head, color: C.white,
    align: "center", bold: false, italic: true,
  });

  slide.addText("the data layer for the next generation\nof real estate AI", {
    x: 0, y: 3.3, w: W, h: 1.0,
    fontSize: 22, fontFace: F.body, color: C.amberSoft,
    align: "center", lineSpacingMultiple: 1.3,
  });

  slide.addText("Seed Round  ·  Q1 2026  ·  Confidential", {
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
  darkOverlay(slide, 55);

  slide.addText(
    "AI is about to help everyone buy a home.\n\nBut the most important data\ndoesn't exist yet.",
    {
      x: 0.8, y: 1.5, w: 8, h: 4,
      fontSize: 30, fontFace: F.head, color: C.white,
      lineSpacingMultiple: 1.4, italic: true,
    }
  );

  slide.addText("We're building it.", {
    x: 0.8, y: 5.2, w: 8, h: 0.7,
    fontSize: 22, fontFace: F.body, color: C.amberSoft,
  });
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
    { num: "$0", color: C.text, desc: "of real estate data captures\nverified community sentiment" },
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

  for (let i = 1; i < 3; i++) {
    const x = startX + i * (colW + gap) - gap / 2;
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.2, w: 0.01, h: 2.8,
      fill: { color: "E0DDD8" },
    });
  }

  slide.addText("AI agents are already helping people buy homes. They pull MLS data, comps, and market trends.\nThe one thing they can't access: what the neighbors actually know.", {
    x: 0.8, y: 5.6, w: 11, h: 0.9,
    fontSize: 14, fontFace: F.head, color: C.muted, italic: true,
    lineSpacingMultiple: 1.3,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 4: THE AGENTIC AI SHIFT — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 4);

  slide.addText("THE AGENTIC AI SHIFT", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Real estate is being rebuilt\naround AI agents.", {
    x: 0.8, y: 1.2, w: 10, h: 1.4,
    fontSize: 36, fontFace: F.head, color: C.text, bold: true,
    lineSpacingMultiple: 1.2,
  });

  const items = [
    { text: "87% of brokerages now use AI tools daily", sub: "Delta Media, 2026" },
    { text: "Lofty launched the first agentic AI OS for real estate", sub: "February 2026" },
    { text: "McKinsey: $430-550B annual value unlock in RE through AI", sub: "Global real estate automation" },
    { text: "NAR settlement + AI = the agent model is being rewritten", sub: "Commission disruption accelerating" },
  ];

  const startY = 2.8;
  const itemH = 0.9;

  items.forEach((item, i) => {
    const y = startY + i * itemH;
    amberLeftBorder(slide, 1.2, y + 0.08, 0.5);
    slide.addText(item.text, {
      x: 1.5, y, w: 9, h: 0.5,
      fontSize: 18, fontFace: F.body, color: C.text,
    });
    slide.addText(item.sub, {
      x: 1.5, y: y + 0.42, w: 9, h: 0.35,
      fontSize: 12, fontFace: F.body, color: C.muted, italic: true,
    });
  });

  slide.addText("Every one of these AI agents needs ground truth data that doesn't exist in MLS. We're building it.", {
    x: 0.8, y: 6.5, w: 11, h: 0.6,
    fontSize: 14, fontFace: F.head, color: C.amber, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 5: THIS IS Gwaky — Full-bleed phone-app.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "phone-app.jpg");
  leftHalfOverlay(slide);

  slide.addText("THIS IS", {
    x: 0.8, y: 1.2, w: 5, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.amberSoft,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Gwaky", {
    x: 0.8, y: 1.7, w: 5, h: 1.2,
    fontSize: 48, fontFace: F.head, color: C.white, italic: true,
  });

  slide.addText(
    "The comment section real estate\nnever had.\n\nSearch any address. See what neighbors\nare really saying. Every verified take\nbecomes training data for the next\ngeneration of RE AI agents.",
    {
      x: 0.8, y: 3.0, w: 5.8, h: 3.2,
      fontSize: 16, fontFace: F.body, color: C.textLight,
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
    { title: "Verify", num: "02", desc: "Enter your zip code.\nYour location is your credential.\nGeo-locked verification." },
    { title: "Gwak", num: "03", desc: "Drop your take.\nWarn buyers. Endorse your block.\nEvery take = a data point." },
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

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 5.6, w: W - 1.6, h: 0.01,
    fill: { color: "E0DDD8" },
  });

  slide.addText("Anyone can browse. Only verified locals can speak. Every take trains AI.", {
    x: 0.8, y: 5.8, w: W - 1.6, h: 0.5,
    fontSize: 16, fontFace: F.head, color: C.amber, italic: true,
    align: "center",
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 7: THE .AI THESIS — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 7);

  slide.addText("THE .AI THESIS", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("We don't compete with AI.\nWe feed it.", {
    x: 0.8, y: 1.2, w: 10, h: 1.6,
    fontSize: 42, fontFace: F.head, color: C.textLight,
    lineSpacingMultiple: 1.2, bold: true,
  });

  // Two columns: what AI does vs what it can't
  slide.addText("WHAT AI DOES WELL", {
    x: 0.8, y: 3.2, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3,
  });

  const leftItems = ["Automated valuations & comps", "Market predictions & trends", "Virtual tours & 3D rendering", "Document processing & contracts"];
  leftItems.forEach((item, i) => {
    slide.addText(item, {
      x: 0.8, y: 3.7 + i * 0.5, w: 5, h: 0.45,
      fontSize: 14, fontFace: F.body, color: C.muted,
    });
  });

  slide.addText("WHAT AI NEEDS FROM US", {
    x: 7, y: 3.2, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.amberSoft,
    letterSpacing: 3,
  });

  const rightItems = ["Does the basement actually flood?", "Are the neighbors fighting at 2am?", "Why did the last owner really sell?", "Is this block safe or just safe on paper?"];
  rightItems.forEach((item, i) => {
    amberLeftBorder(slide, 7, 3.8 + i * 0.5, 0.3);
    slide.addText(item, {
      x: 7.3, y: 3.7 + i * 0.5, w: 5, h: 0.45,
      fontSize: 14, fontFace: F.body, color: C.amberSoft, bold: true,
    });
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 6.3, y: 3.4, w: 0.01, h: 2.3,
    fill: { color: "333333" },
  });

  slide.addText(
    "As AI gets better at everything else, our data becomes MORE valuable, not less.\nHuman-generated, verified, geo-locked sentiment that AI cannot synthesize.",
    {
      x: 0.8, y: 6.0, w: 11, h: 0.8,
      fontSize: 14, fontFace: F.head, color: C.amberSoft, italic: true,
      lineSpacingMultiple: 1.3,
    }
  );
}

// ═══════════════════════════════════════════════════════════
// SLIDE 8: THE FOMO ENGINE — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 8);

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
    "Every listing is a ticking clock. If you want the truth about 742 Elm St — you better get in NOW.\nOnce it sells, the conversation locks forever. But the data lives on in our training corpus.",
    {
      x: 0.8, y: 3.5, w: 9, h: 1.2,
      fontSize: 17, fontFace: F.body, color: C.muted,
      lineSpacingMultiple: 1.5,
    }
  );

  const hooks = [
    "This creates urgency — users return before listings close.",
    "This creates engagement — every listing is a live conversation.",
    "This creates data — every take is a permanent training signal.",
  ];

  hooks.forEach((text, i) => {
    const y = 5.0 + i * 0.55;
    amberLeftBorder(slide, 0.8, y + 0.05, 0.35);
    slide.addText(text, {
      x: 1.1, y, w: 10, h: 0.5,
      fontSize: 17, fontFace: F.head, color: C.amber,
      italic: true, bold: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 9: WHO USES THIS — Full-bleed urban-woman.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "urban-woman.jpg");

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

  const personas = [
    { title: "Homebuyers", desc: "Need ground truth before the biggest purchase of their life" },
    { title: "Renters", desc: "Researching blocks before committing to a lease" },
    { title: "Homeowners", desc: "Sharing warnings and endorsements — building the dataset" },
    { title: "AI Platforms", desc: "Need verified sentiment data to power next-gen agents" },
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
// SLIDE 10: THE DATA MOAT — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 10);

  slide.addText("THE DATA MOAT", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Five properties no AI model\ncan replicate.", {
    x: 0.8, y: 1.2, w: 10, h: 1.4,
    fontSize: 36, fontFace: F.head, color: C.textLight,
    lineSpacingMultiple: 1.2, italic: true,
  });

  const moatProps = [
    { label: "Verified", desc: "Every contributor's address is confirmed. No bots. No fake reviews." },
    { label: "Geo-locked", desc: "Data tied to specific zip codes and blocks. Spatial precision AI can't guess." },
    { label: "Human-generated", desc: "Can't be scraped, synthesized, or hallucinated. Only humans who live there know." },
    { label: "Sentiment-rich", desc: "Not just facts — emotions, warnings, endorsements. The context AI misses." },
    { label: "Temporal", desc: "Tied to listing lifecycles. A living record of neighborhood truth over time." },
  ];

  moatProps.forEach((p, i) => {
    const y = 2.8 + i * 0.75;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y, w: 11.5, h: 0.6,
      rectRadius: 0.06,
      fill: { color: C.darkCard },
    });
    amberLeftBorder(slide, 0.8, y + 0.1, 0.4);
    slide.addText(p.label, {
      x: 1.1, y, w: 2.2, h: 0.6,
      fontSize: 15, fontFace: F.head, color: C.amberSoft, bold: true,
      valign: "middle",
    });
    slide.addText(p.desc, {
      x: 3.3, y, w: 8.8, h: 0.6,
      fontSize: 12, fontFace: F.body, color: C.mutedLight,
      valign: "middle",
    });
  });

  slide.addText(
    "Network effects compound the moat: more residents = more takes = more value = more residents.",
    {
      x: 0.8, y: 6.7, w: 11, h: 0.5,
      fontSize: 14, fontFace: F.head, color: C.amberSoft, italic: true,
    }
  );
}

// ═══════════════════════════════════════════════════════════
// SLIDE 11: THE DATA FLYWHEEL — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 11);

  slide.addText("THE DATA FLYWHEEL", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Community \u2192 Data \u2192 AI Value \u2192 Revenue", {
    x: 0.8, y: 1.2, w: 10, h: 0.9,
    fontSize: 34, fontFace: F.head, color: C.text, bold: true,
  });

  // Flywheel steps
  const flywheel = ["Verified residents", "Neighborhood takes", "Proprietary dataset", "AI licensing revenue", "Reinvest & grow"];
  const fwStartX = 0.6;
  const fwY = 2.5;

  flywheel.forEach((step, i) => {
    const x = fwStartX + i * 2.5;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: fwY, w: 2.2, h: 0.7,
      rectRadius: 0.06,
      fill: { color: i === 3 ? C.amber : "EEEDEA" },
    });
    slide.addText(step, {
      x, y: fwY, w: 2.2, h: 0.7,
      fontSize: 11, fontFace: F.body, color: i === 3 ? C.white : C.text,
      align: "center", bold: true,
    });
    if (i < flywheel.length - 1) {
      slide.addText("\u2192", {
        x: x + 2.1, y: fwY, w: 0.5, h: 0.7,
        fontSize: 18, fontFace: F.body, color: C.amber, align: "center",
      });
    }
  });

  slide.addText("\u21BB", {
    x: 5.8, y: 3.3, w: 1, h: 0.6,
    fontSize: 20, fontFace: F.body, color: C.amber, align: "center",
  });

  // The Reddit comp
  slide.addText("THE REDDIT MODEL, APPLIED TO REAL ESTATE", {
    x: 0.8, y: 3.8, w: 8, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3, bold: true,
  });

  const compRows = [
    { left: "Reddit licensed user posts to Google & OpenAI", right: "$203M in 2024 data licensing revenue" },
    { left: "Reddit's data: unverified, general-purpose, noisy", right: "Gwaky's data: verified, geo-locked, RE-specific" },
    { left: "Reddit is the #1 cited domain by AI Overviews", right: "Gwaky targets the #1 purchase decision in life" },
  ];

  compRows.forEach((row, i) => {
    const y = 4.4 + i * 0.55;
    if (i % 2 === 0) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.8, y, w: 11.5, h: 0.5,
        fill: { color: "F0EFEB" },
      });
    }
    slide.addText(row.left, {
      x: 0.8, y, w: 5.5, h: 0.5,
      fontSize: 13, fontFace: F.body, color: C.muted, valign: "middle",
    });
    slide.addText(row.right, {
      x: 6.5, y, w: 5.5, h: 0.5,
      fontSize: 13, fontFace: F.body, color: C.text, bold: true, valign: "middle",
    });
  });

  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 6.1, w: W - 1.6, h: 0.01,
    fill: { color: "E0DDD8" },
  });

  slide.addText("Reddit proved the model. Our data is more valuable because it's verified, vertical, and spatial.", {
    x: 0.8, y: 6.3, w: 11, h: 0.5,
    fontSize: 14, fontFace: F.head, color: C.amber, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 12: REVENUE MODEL — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 12);

  slide.addText("REVENUE MODEL", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Four revenue streams.\nData licensing is the engine.", {
    x: 0.8, y: 0.9, w: 10, h: 1.0,
    fontSize: 28, fontFace: F.head, color: C.text, bold: true,
    lineSpacingMultiple: 1.2,
  });

  const streams = [
    { name: "AI Data Licensing", y1: "$200K", y3: "$2.4M", pct: 40, desc: "AI platforms, hedge funds, insurers pay for verified sentiment" },
    { name: "API Access", y1: "$80K", y3: "$1.2M", pct: 20, desc: "Per-query access for agentic AI platforms and developers" },
    { name: "Premium Listings", y1: "$120K", y3: "$1.6M", pct: 27, desc: "Enhanced listing features for agents and property managers" },
    { name: "Agent Profiles", y1: "$40K", y3: "$520K", pct: 13, desc: "Verified agent presence on the platform" },
  ];

  const barMaxW = 4.5;
  const streamStartY = 2.1;
  const streamSpacing = 1.2;

  streams.forEach((s, i) => {
    const y = streamStartY + i * streamSpacing;

    slide.addText(s.name, {
      x: 0.8, y, w: 3.5, h: 0.35,
      fontSize: 14, fontFace: F.head, color: C.text, bold: true,
    });
    slide.addText(s.desc, {
      x: 0.8, y: y + 0.32, w: 4.2, h: 0.3,
      fontSize: 10, fontFace: F.body, color: C.muted,
    });

    // Year 1 bar
    slide.addText("Y1", {
      x: 5.2, y: y - 0.02, w: 0.5, h: 0.35,
      fontSize: 10, fontFace: F.body, color: C.muted,
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.7, y: y + 0.02, w: barMaxW * (s.pct / 100) * 0.35, h: 0.25,
      rectRadius: 0.04,
      fill: { color: C.amberSoft },
    });
    slide.addText(s.y1, {
      x: 5.7 + barMaxW * (s.pct / 100) * 0.35 + 0.15, y: y - 0.02, w: 1.5, h: 0.35,
      fontSize: 11, fontFace: F.body, color: C.muted,
    });

    // Year 3 bar
    slide.addText("Y3", {
      x: 5.2, y: y + 0.4, w: 0.5, h: 0.35,
      fontSize: 10, fontFace: F.body, color: C.muted,
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.7, y: y + 0.43, w: barMaxW * (s.pct / 100), h: 0.25,
      rectRadius: 0.04,
      fill: { color: C.amber },
    });
    slide.addText(s.y3, {
      x: 5.7 + barMaxW * (s.pct / 100) + 0.15, y: y + 0.38, w: 1.5, h: 0.35,
      fontSize: 11, fontFace: F.body, color: C.text, bold: true,
    });
  });

  // Bottom highlights — moved down and spread apart
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 6.5, w: 4, h: 0.65,
    rectRadius: 0.06,
    fill: { color: "EEEDEA" },
  });
  slide.addText([
    { text: "$5.72M ", options: { fontSize: 22, fontFace: F.head, color: C.amber, bold: true } },
    { text: "ARR by Year 3", options: { fontSize: 13, fontFace: F.body, color: C.text } },
  ], { x: 1.0, y: 6.52, w: 3.6, h: 0.56 });

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.8, y: 6.5, w: 4.8, h: 0.65,
    rectRadius: 0.06,
    fill: { color: "EEEDEA" },
  });
  slide.addText([
    { text: "Cash-flow positive ", options: { fontSize: 15, fontFace: F.head, color: C.green, bold: true } },
    { text: "by Month 18", options: { fontSize: 13, fontFace: F.body, color: C.text } },
  ], { x: 6.0, y: 6.52, w: 4.4, h: 0.56 });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 13: WHO PAYS FOR THE DATA — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 13);

  slide.addText("WHO PAYS FOR THE DATA", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const buyers = [
    {
      who: "AI Platforms",
      price: "$85K / zip code",
      desc: "OpenAI, Google, and every agentic RE platform need verified\nsentiment to answer 'should I buy this house?'",
      icon: "01",
    },
    {
      who: "Insurance Companies",
      price: "Per-query API",
      desc: "Community-reported risk signals at the block level.\nFlood history, crime perception, infrastructure concerns.",
      icon: "02",
    },
    {
      who: "Hedge Funds & REITs",
      price: "Premium API",
      desc: "Block-level sentiment as a predictive signal for\ninvestment decisions. Alternative data at its purest.",
      icon: "03",
    },
    {
      who: "City Planners",
      price: "Annual license",
      desc: "Neighborhood sentiment mapping for development\ndecisions, zoning changes, and public investment.",
      icon: "04",
    },
  ];

  buyers.forEach((b, i) => {
    const col = i < 2 ? 0 : 1;
    const row = i % 2;
    const x = 0.8 + col * 6.2;
    const y = 1.4 + row * 2.7;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 5.8, h: 2.3,
      rectRadius: 0.08,
      fill: { color: "F0EFEB" },
    });

    slide.addText(b.icon, {
      x: x + 0.3, y: y + 0.2, w: 0.6, h: 0.5,
      fontSize: 12, fontFace: F.mono, color: C.amberSoft,
    });

    slide.addText(b.who, {
      x: x + 0.3, y: y + 0.5, w: 5, h: 0.5,
      fontSize: 20, fontFace: F.head, color: C.text, bold: true,
    });

    slide.addText(b.price, {
      x: x + 0.3, y: y + 1.0, w: 5, h: 0.35,
      fontSize: 14, fontFace: F.body, color: C.amber, bold: true,
    });

    slide.addText(b.desc, {
      x: x + 0.3, y: y + 1.35, w: 5, h: 0.8,
      fontSize: 12, fontFace: F.body, color: C.muted,
      lineSpacingMultiple: 1.3,
    });
  });

  slide.addText("TAM: $18.9B PropTech  |  $17.4B Alternative Data  |  $3.2B RE Data specifically", {
    x: 0.8, y: 6.6, w: 11, h: 0.4,
    fontSize: 13, fontFace: F.body, color: C.amber, bold: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 14: COMPETITIVE LANDSCAPE — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 14);

  slide.addText("COMPETITIVE LANDSCAPE", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const features = ["Community Intel", "Verified Locals", "AI Training Data", "Data Licensing", "Gen Z Design"];
  const competitors = [
    { name: "Gwaky", scores: [true, true, true, true, true] },
    { name: "Zillow", scores: [false, false, false, false, false] },
    { name: "Nextdoor", scores: [true, false, false, false, false] },
    { name: "Redfin", scores: [false, false, false, false, false] },
  ];

  const tableStartX = 0.8;
  const tableStartY = 1.5;
  const colW = 2.0;
  const rowH = 0.65;
  const labelColW = 2.5;

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

  features.forEach((feat, fi) => {
    const y = tableStartY + (fi + 1) * rowH;

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
      slide.addText(comp.scores[fi] ? "\u25CF" : "\u2014", {
        x, y, w: colW, h: rowH,
        fontSize: comp.scores[fi] ? 18 : 14,
        fontFace: F.body,
        color: comp.scores[fi] ? (ci === 0 ? C.amber : C.green) : C.muted,
        align: "center", valign: "middle",
      });
    });
  });

  // Key insight below table
  slide.addText("WHY THEY CAN'T REPLICATE THIS", {
    x: 0.8, y: 5.2, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3, bold: true,
  });

  const defenses = [
    { scenario: "Zillow launches AI chat", impact: "Still no community data. They need us." },
    { scenario: "OpenAI builds property agent", impact: "Still needs our sentiment dataset." },
    { scenario: "Google integrates RE search", impact: "They have maps. We have the people who live there." },
  ];

  defenses.forEach((d, i) => {
    const y = 5.6 + i * 0.45;
    slide.addText(d.scenario, {
      x: 0.8, y, w: 4.5, h: 0.4,
      fontSize: 12, fontFace: F.body, color: C.text,
    });
    slide.addText(d.impact, {
      x: 5.5, y, w: 6, h: 0.4,
      fontSize: 12, fontFace: F.body, color: C.amber, bold: true, italic: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 15: AI-NATIVE OPERATING MODEL — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 15);

  slide.addText("AI-NATIVE OPERATING MODEL", {
    x: 0.8, y: 0.5, w: 6, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("4 people doing what 45 would.", {
    x: 0.8, y: 1.2, w: 10, h: 1.2,
    fontSize: 44, fontFace: F.head, color: C.textLight, bold: true,
  });

  slide.addText("Not a slogan. An operating model.", {
    x: 0.8, y: 2.3, w: 10, h: 0.6,
    fontSize: 18, fontFace: F.body, color: C.amberSoft,
  });

  // AI coverage bars
  const coverage = [
    { func: "QA & Testing", pct: 100 },
    { func: "Data Pipelines", pct: 100 },
    { func: "Customer Support", pct: 90 },
    { func: "Content Moderation", pct: 95 },
    { func: "Marketing Content", pct: 80 },
    { func: "Campaign Analysis", pct: 100 },
  ];

  coverage.forEach((c, i) => {
    const y = 3.2 + i * 0.5;
    slide.addText(c.func, {
      x: 0.8, y, w: 3, h: 0.4,
      fontSize: 12, fontFace: F.body, color: C.mutedLight,
    });
    // Bar background
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.0, y: y + 0.05, w: 5.5, h: 0.28,
      rectRadius: 0.04,
      fill: { color: C.darkCard },
    });
    // Bar fill
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 4.0, y: y + 0.05, w: 5.5 * (c.pct / 100), h: 0.28,
      rectRadius: 0.04,
      fill: { color: C.amber },
    });
    slide.addText(`${c.pct}% AI`, {
      x: 9.8, y, w: 1.5, h: 0.4,
      fontSize: 11, fontFace: F.mono, color: C.amberSoft,
    });
  });

  // Comparison cards
  const cards = [
    { label: "Our burn", value: "$800K/yr", color: C.amberSoft },
    { label: "Traditional PropTech", value: "$2M/yr", color: C.muted },
    { label: "Capital efficiency", value: "60% savings", color: C.green },
  ];

  cards.forEach((c, i) => {
    const x = 0.8 + i * 3.8;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 6.2, w: 3.4, h: 0.9,
      rectRadius: 0.08,
      fill: { color: C.darkCard },
    });
    slide.addText(c.label, {
      x: x + 0.3, y: 6.25, w: 2.8, h: 0.3,
      fontSize: 10, fontFace: F.body, color: C.muted,
    });
    slide.addText(c.value, {
      x: x + 0.3, y: 6.5, w: 2.8, h: 0.5,
      fontSize: 22, fontFace: F.head, color: c.color, bold: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 16: THE ROADMAP — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 16);

  slide.addText("THE ROADMAP", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  const phases = [
    {
      year: "2026-2027",
      title: "Build the Data Moat",
      items: "Launch in top 25 metros\nVerified resident onboarding\nEvery take = proprietary intelligence\nData compounds daily",
    },
    {
      year: "2027-2028",
      title: "Become the API",
      items: "AI platforms pay for access\nData licensing at $85K/zip\nAPI for agentic AI agents\nInsurance & hedge fund deals",
    },
    {
      year: "2028-2029",
      title: "Launch Gwaky AI",
      items: "Our own agent on our data\n\"Ask Gwaky about any address\"\nFlywheel: community grows the model\nNo competitor can replicate",
    },
    {
      year: "2029-2030",
      title: "The Platform Layer",
      items: "Community truth layer for all RE\nCity planners, mortgage lenders\nInfrastructure for every transaction\nMultiple exit paths open",
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.6 + i * 3.1;
    const y = 1.4;

    // Phase number/year
    slide.addText(p.year, {
      x, y, w: 2.8, h: 0.4,
      fontSize: 12, fontFace: F.mono, color: C.amber, bold: true,
    });

    slide.addText(p.title, {
      x, y: y + 0.4, w: 2.8, h: 0.7,
      fontSize: 18, fontFace: F.head, color: C.text, bold: true,
    });

    amberLeftBorder(slide, x, y + 0.45, 0.5);

    slide.addText(p.items, {
      x, y: y + 1.2, w: 2.8, h: 2.5,
      fontSize: 12, fontFace: F.body, color: C.muted,
      lineSpacingMultiple: 1.5,
    });

    // Connector arrow
    if (i < phases.length - 1) {
      slide.addText("\u2192", {
        x: x + 2.7, y: y + 0.5, w: 0.5, h: 0.5,
        fontSize: 20, fontFace: F.body, color: C.amber, align: "center",
      });
    }
  });

  // Timeline bar at bottom
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 5.6, w: 11.7, h: 0.06,
    rectRadius: 0.03,
    fill: { color: "E0DDD8" },
  });

  // Active marker
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 5.55, w: 2.8, h: 0.16,
    rectRadius: 0.04,
    fill: { color: C.amber },
  });

  slide.addText("We are here. Building the moat that every AI platform will need.", {
    x: 0.8, y: 5.9, w: 11, h: 0.5,
    fontSize: 15, fontFace: F.head, color: C.amber, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 17: WHAT'S BUILT — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 17);

  slide.addText("WHAT'S BUILT", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Live product. Real listings.\nReal community data.", {
    x: 0.8, y: 1.2, w: 10, h: 1.2,
    fontSize: 36, fontFace: F.head, color: C.text, bold: true,
    lineSpacingMultiple: 1.2,
  });

  const features = [
    "Search any US city or address",
    "Photo carousels with MLS data",
    "Split map view with geo-filtering",
    "Gated community membership",
    "Style Visualizer (AI-powered)",
    "Rate-limited API infrastructure",
    "Verified resident system",
    "AI content moderation",
  ];

  features.forEach((feat, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = 0.8 + col * 5.5;
    const y = 2.8 + row * 0.65;

    slide.addText("\u2713", {
      x, y, w: 0.4, h: 0.5,
      fontSize: 16, fontFace: F.body, color: C.amber, bold: true,
    });
    slide.addText(feat, {
      x: x + 0.4, y, w: 4.5, h: 0.5,
      fontSize: 15, fontFace: F.body, color: C.text,
    });
  });

  // URL callout
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 5.6, w: 6, h: 0.8,
    rectRadius: 0.06,
    fill: { color: "EEEDEA" },
  });
  slide.addText("homefeed-ivory.vercel.app", {
    x: 1.0, y: 5.6, w: 5.6, h: 0.8,
    fontSize: 18, fontFace: F.mono, color: C.amber,
    valign: "middle",
  });

  slide.addText("Built by 2 people + AI in 4 months. That's the thesis in action.", {
    x: 7.2, y: 5.7, w: 5, h: 0.6,
    fontSize: 14, fontFace: F.head, color: C.muted, italic: true,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 18: THE ASK — Dark slide
// ═══════════════════════════════════════════════════════════
{
  const slide = darkSlide();
  addSlideNum(slide, 18);

  slide.addText("THE ASK", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("$1.5M SAFE", {
    x: 0.8, y: 1.0, w: 10, h: 1.4,
    fontSize: 64, fontFace: F.head, color: C.amberSoft, bold: true,
  });

  slide.addText("$10M post-money cap  ·  18-24 months runway", {
    x: 0.8, y: 2.3, w: 10, h: 0.6,
    fontSize: 20, fontFace: F.body, color: C.textLight,
  });

  // Use of funds
  slide.addText("USE OF FUNDS", {
    x: 0.8, y: 3.3, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 3, bold: true,
  });

  const funds = [
    { label: "Product & Data Infra", pct: 40, w: 4.8 },
    { label: "Growth & Community", pct: 25, w: 3.0 },
    { label: "Operations", pct: 20, w: 2.4 },
    { label: "Reserve", pct: 15, w: 1.8 },
  ];

  let barX = 0.8;
  funds.forEach((f) => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: barX, y: 3.8, w: f.w, h: 0.5,
      rectRadius: 0.04,
      fill: { color: C.amber, transparency: (40 - f.pct) * 1.5 },
    });
    slide.addText(`${f.label} ${f.pct}%`, {
      x: barX, y: 3.8, w: f.w, h: 0.5,
      fontSize: 11, fontFace: F.body, color: C.white,
      align: "center", valign: "middle", bold: true,
    });
    barX += f.w + 0.05;
  });

  // MRR trajectory
  slide.addText("MRR TRAJECTORY", {
    x: 0.8, y: 4.6, w: 5, h: 0.4,
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
      x, y: 5.1, w: 2.5, h: 0.6,
      fontSize: 28, fontFace: F.head, color: C.amberSoft, bold: true,
    });
    slide.addText(m.label, {
      x, y: 5.7, w: 2.5, h: 0.3,
      fontSize: 11, fontFace: F.body, color: C.muted,
    });

    if (i < mrr.length - 1) {
      slide.addText("\u2192", {
        x: x + 2.2, y: 5.1, w: 0.8, h: 0.6,
        fontSize: 20, fontFace: F.body, color: C.muted, align: "center",
      });
    }
  });

  // Exit paths
  slide.addText("EXIT PATHS: Acquisition (Zillow, Redfin, CoStar)  |  Data licensing scale  |  IPO", {
    x: 0.8, y: 6.4, w: 11, h: 0.5,
    fontSize: 12, fontFace: F.body, color: C.muted,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 19: FOUNDER — Light slide
// ═══════════════════════════════════════════════════════════
{
  const slide = lightSlide();
  addSlideNum(slide, 19);

  slide.addText("FOUNDER", {
    x: 0.8, y: 0.5, w: 5, h: 0.4,
    fontSize: 10, fontFace: F.body, color: C.muted,
    letterSpacing: 4, bold: true,
  });

  slide.addText("Zachary Kaufman", {
    x: 0.8, y: 1.2, w: 10, h: 1.0,
    fontSize: 40, fontFace: F.head, color: C.text, bold: true,
  });

  slide.addText("CEO & Founder", {
    x: 0.8, y: 2.1, w: 10, h: 0.5,
    fontSize: 16, fontFace: F.body, color: C.amber,
  });

  const points = [
    "Built the entire product with AI-native methodology — 2 people, 4 months, production-ready",
    "Deep understanding of both the AI landscape and real estate market dynamics",
    "First-hand experience with the broken information asymmetry in home buying",
    "Obsessed with the intersection of community data and AI infrastructure",
    "Technical founder who ships — not a pitch deck founder who talks",
  ];

  points.forEach((p, i) => {
    const y = 3.0 + i * 0.7;
    amberLeftBorder(slide, 0.8, y + 0.08, 0.4);
    slide.addText(p, {
      x: 1.1, y, w: 10, h: 0.55,
      fontSize: 15, fontFace: F.body, color: C.text,
    });
  });

  slide.addText("The product exists because I couldn't find what neighbors actually thought about a home I was buying.\nSo I built it.", {
    x: 0.8, y: 6.0, w: 10, h: 0.8,
    fontSize: 14, fontFace: F.head, color: C.muted, italic: true,
    lineSpacingMultiple: 1.4,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 20: CLOSING — Full-bleed aerial.jpg
// ═══════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  fullBleedImage(slide, "aerial.jpg");
  darkOverlay(slide, 60);

  slide.addText("AI replaces search.\nAI replaces agents.\nAI cannot replace your neighbor.", {
    x: 0, y: 1.2, w: W, h: 1.8,
    fontSize: 30, fontFace: F.head, color: C.white,
    align: "center", italic: true, lineSpacingMultiple: 1.4,
  });

  slide.addText("We own that data.", {
    x: 0, y: 3.2, w: W, h: 0.8,
    fontSize: 24, fontFace: F.body, color: C.amberSoft,
    align: "center", bold: true,
  });

  slide.addText("Gwaky", {
    x: 0, y: 4.2, w: W, h: 1.2,
    fontSize: 56, fontFace: F.head, color: C.white,
    align: "center", italic: true,
  });

  slide.addText("Zachary Kaufman  ·  hello@gwaky.com  ·  gwaky.com", {
    x: 0, y: 6.2, w: W, h: 0.5,
    fontSize: 14, fontFace: F.body, color: C.mutedLight,
    align: "center",
  });
}

// ─── EXPORT ───
const outputPath = "/Users/zacharykaufman/Desktop/Pitch Decks/Gwaky - Investor Pitch Q1 2026.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log(`Deck saved to: ${outputPath}`);
  console.log(`   ${pres.slides.length} slides generated`);
}).catch((err) => {
  console.error("Error generating deck:", err);
});
